// Copyright 2017 Informo core team <core@informo.network>
//
// Licensed under the GNU Affero General Public License, Version 3.0
// (the "License"); you may not use this file except in compliance with the
// License.
// You may obtain a copy of the License at
//
//     https://www.gnu.org/licenses/agpl-3.0.html
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import storage from "./storage";
import informoSources from "./sources";
import MatrixClient from "./matrix/client";
import $ from "jquery";
import Materialize from "materialize-css";

import stringify from "canonical-json";
import * as nacl from "tweetnacl";
import * as naclUtil from "tweetnacl-util";

import * as sidebarPage from "./pages/sidebar";
import {Article} from "./article";
import database from "./database";

const mxcURLRegexpStr = "mxc://([^/]+)/([^\"'/]+)";
const mxcURLRegexpLoc = new RegExp(mxcURLRegexpStr, "");
const mxcURLRegexpGen = new RegExp(mxcURLRegexpStr, "g");

var mxClient;
var currentHomeserverURL = null;
var isConnected = false;

var pendingConnectionPromise = null;
var connectingToast;


function connectingToastStart(){
	connectingToast = Materialize.toast($(`
		<div class="preloader-wrapper small active" style="margin-right: 1em;">
			<div class="spinner-layer spinner-green-only">
				<div class="circle-clipper left">
					<div class="circle"></div>
				</div>
				<div class="gap-patch">
					<div class="circle"></div>
				</div>
				<div class="circle-clipper right">
					<div class="circle"></div>
				</div>
			</div>
		</div>
		<div class="toast-text"></div>
		`), Infinity, "connecting-toast");
}
function connectingToastSetContent(html){
	console.info("Informo connection progress:", html);
	$(connectingToast.el).find(".toast-text").html(html);
}

function connectingToastEnd(html, success){
	connectingToastSetContent(html);
	$(connectingToast.el).addClass(success === true ? "informo-bg-green" : "red darken-3");
	$(connectingToast.el).find(".preloader-wrapper").hide();

	setTimeout(() => connectingToast.remove(), success === true? 3000 : 10000);
}

/// Returns true if the client is connected to a matrix endpoint and basic Informo data has been fetched
export function isInformoConnected(){
	return isConnected;
}


/// Return a promise that resolves into a matrix client (and establish the connection if needed)
export function getConnectedMatrixClient(){

	if(pendingConnectionPromise !== null){
		// Resolve with current pending connection
		return pendingConnectionPromise;
	}

	if(isConnected === false || mxClient === null || storage.homeserverURL !== currentHomeserverURL){
		// Create a new connection

		if(mxClient !== null){
			// TODO: gently disconnect from current server
			isConnected = false;
		}

		connectingToastStart();
		connectingToastSetContent("Connecting to <code>" + storage.homeserverURL + " " + storage.roomAlias + "</code>");

		pendingConnectionPromise = new Promise((resolve, reject) => {

			// inner promise that resolves into a matrix client object created either
			// by reusing stored tokens or by registering as guest
			let matrixClientPromise = new Promise((resolve, reject) => {
				// Register as guest only if needed
				if(storage.homeserverURL === null
				|| storage.accessToken === null
				|| (currentHomeserverURL !== null && storage.homeserverURL !== currentHomeserverURL)){

					console.info("Registering as guest");
					connectingToastSetContent("Registering as guest on <code>" + storage.homeserverURL + "</code>");

					// Resolve to a matrix client on query completion
					return resolve(MatrixClient.registerGuest(storage.homeserverURL));
				}

				console.info("Reusing guest account ", storage.userID);

				// Resolve to a matrix client now
				resolve(new MatrixClient(
					storage.homeserverURL,
					storage.accessToken,
					storage.userID,
					storage.deviceID
				));
			});


			// Once the matrix client is created, we want to to save client
			// tokens and retrieve main Informo data before resolving
			// pendingConnectionPromise
			matrixClientPromise
				.then((client) => {
					// save received matrix client information in the storage
					storage.homeserverURL = client.homeserverURL;
					storage.accessToken = client.accessToken;
					storage.userID = client.userID;
					storage.deviceID = client.deviceID;
					storage.save();

					// Save matrix client object
					mxClient = client;
					currentHomeserverURL = storage.homeserverURL;

					// Update sidebar information
					sidebarPage.updateState();

					return mxClient;
				},
				(err) => {
					pendingConnectionPromise = null;
					connectingToastEnd("Could not connect to <code>" + storage.homeserverURL + "</code>", false);
					throw err;
				})
				// Fetch informo related data
				.then(_loadInformo)
				// Handle success / errors
				.then(() => {
					connectingToastEnd("Connected to Informo through <code>" + storage.homeserverURL + "</code>", true);
				},
				(err) => {
					pendingConnectionPromise = null;
					connectingToastEnd("Could not fetch Informo data", false);
					throw err;
				})
				// Now that everything is OK, let's resolve pendingConnectionPromise
				.then(() => {
					isConnected = true;
					sidebarPage.updateState();

					// Resolve main promise with the matrix client
					resolve(mxClient);
				});
		});

		// return this long promise we just created
		return pendingConnectionPromise;
	}
	else {
		// The client is already connected to the right server
		return new Promise((resolve, reject) => { resolve(mxClient); });
	}
}

function _loadInformo() {
	return new Promise((resolve, reject) => {

		// This will resolve to a matrix Room ID, either by requesting it using
		// the room alias or by using the stored room ID
		let roomIDPromise;
		if(storage.roomID === null){
			connectingToastSetContent("Searching Informo room <code>"+storage.roomAlias+"</code>");
			roomIDPromise = mxClient.getRoomIDForAlias(storage.roomAlias);
		}
		else{
			roomIDPromise = new Promise((resolve, reject) => {
				resolve(storage.roomID);
			});
		}

		roomIDPromise
			// Save room id in storage
			.then((roomID) => {
				storage.roomID = roomID;
				storage.save();

				connectingToastSetContent("Check if joined Informo room <code>"+storage.roomAlias+"</code>");
				// TODO: We can go faster by calling getStateEvent and then join
				//       room if it fails
				return mxClient.getJoinedRooms();
			})
			// Check if room is joined, and join if necessary
			.then((rooms) => {
				let inRoom = false;

				for(let room of rooms) {
					if(room === storage.roomID) {
						inRoom = true;
					}
				}

				if(inRoom === true) {
					return Promise.resolve();
				}

				connectingToastSetContent("Joining Informo room <code>"+storage.roomAlias+"</code>");
				return mxClient.joinRoom(storage.roomAlias);
			})
			// Retrieve source list
			.then(() => {
				connectingToastSetContent("Fetching Informo source list");
				return mxClient.getStateEvent(storage.roomID, "network.informo.sources");
			})
			// Store source list
			.then((sources) => {
				informoSources.setSources(sources);
				if(!informoSources.hasSources()) {
					throw "Could not retrieve sources";
				}
				resolve();
			});
	});

}

/// Return a promise that resolves into a Article[]
/// sourceClassNames: List of source class names that will be fetched. Set ["*"] to fetch all informo official sources
export function getNews(sourceClassNames, resetPos = false) {
	console.assert(sourceClassNames.constructor === Array);

	// Build event filter
	let filter = {types: [],senders: []};

	if(sourceClassNames.length === 1 &&  sourceClassNames[0] === "*"){
		//Fetch everything
		for(let className in informoSources.sources) {
			filter.types.push(className);
			for(let publisher of informoSources.sources[className].publishers) {
				filter.senders.push(publisher);
			}
		}
	}
	else{
		for(let className of sourceClassNames) {
			if(informoSources.sources[className]){
				filter.types.push(className);
				for(let publisher of informoSources.sources[className].publishers) {
					filter.senders.push(publisher);
				}
			}
			else{
				console.warn("Unknown source class name: ", className);
			}
		}
	}


	let matrixClient = null;

	// TODO: no signature checks nor mxc replacements
	return getConnectedMatrixClient()
		.then((client) => {
			matrixClient = client;
			return matrixClient.getMessages(storage.roomID, filter, 20, resetPos);
		})
		.then((events) => {
			let promises = [];
			for(let event of events){
				promises.push(matrixEventToArticle(event));
			}
			return Promise.all(promises);
		});
}

/// Returns an Article object using the data contained in the given eventID
export function getSingleArticle(eventID) {
	let matrixClient = null;

	// TODO: no signature checks nor mxc replacements
	return getConnectedMatrixClient()
		.then((client) => {
			matrixClient = client;
			return matrixClient.getMessage(storage.roomID, eventID);
		})
		.then((event) => {
			return matrixEventToArticle(event);
		});
}



function getPartsFromMXCURL(mxcURL) {
	let parts = mxcURL.match(mxcURLRegexpLoc);
	return {
		serverName: parts[1],
		mediaID: parts[2],
	};
}

function matrixEventToArticle(matrixEvent){
	return new Promise((resolve, reject) => {
		let article;
		getConnectedMatrixClient()
			.then(() => {
				article = new Article(
					matrixEvent.event_id,
					matrixEvent.content.headline,
					matrixEvent.content.description,
					matrixEvent.content.author,
					matrixEvent.content.thumbnail,
					informoSources.sources[matrixEvent.type].name,
					matrixEvent.content.date,
					matrixEvent.content.content,
					matrixEvent.content.link,
					informoSources.canPublish(matrixEvent.sender, matrixEvent.type)
				);

				return database.getArticleRead(article.id);
			})
			.then((isRead) => {
				article.unread = isRead === false;

				// Verify signature
				let key, canonical;
				try {
					article.signature = naclUtil.decodeBase64(matrixEvent.content.signature);
					key = naclUtil.decodeBase64(informoSources.sources[matrixEvent.type].publicKey);
					canonical = naclUtil.decodeUTF8(stringify(matrixEvent.content));
				} catch(e) {
					return false;
				}

				return nacl.sign.detached.verify(canonical, article.signature, key);
			})
			.then((signatureOk) => {
				article.verified = signatureOk;

				// Replace mxc URLs
				let medias = article.content.match(mxcURLRegexpGen);
				if (medias) {
					for (let m of medias) {
						if(article.image === null){
							// Set first media as article picture if none
							article.image = m;
						}

						let parts = getPartsFromMXCURL(m);
						let dlURL = mxClient.homeserverURL
							+ "/_matrix/media/r0/download/" + parts.serverName
							+ "/" + parts.mediaID;
						article.content = article.content.replace(m, dlURL);
					}
				}
				if(article.image !== null){
					// Set / replace article image
					let imageParts = getPartsFromMXCURL(medias[0]);
					article.image = mxClient.homeserverURL
						+ "/_matrix/media/r0/download/" + imageParts.serverName
						+ "/" + imageParts.mediaID;
				}

				resolve(article);
			});
	});
}

