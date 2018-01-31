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

import storage from './storage'
import loader from './loader'
import informoSources from './sources'
import MatrixClient from './matrix/client'
import {eventPrefix} from './const'

import stringify from 'canonical-json'
import * as nacl from 'tweetnacl'
import * as naclUtil from 'tweetnacl-util'

const roomAlias = '#informo-test:matrix.org';
const mxcURLRegexpStr = "mxc://([^/]+)/([^\"'/]+)";
const mxcURLRegexpLoc = new RegExp(mxcURLRegexpStr, '');
const mxcURLRegexpGen = new RegExp(mxcURLRegexpStr, 'g')

var mxClient;
var mxRoomID;
var currentHomeserverURL;

var pendingConnectionPromise = null;
var connectingToast;
var connectingToastText;


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
	console.debug("Informo connection progress:", html);
	$(connectingToast.el).find(".toast-text").html(html);
}

function connectingToastEnd(html, endClass, timeout = 4000){
	connectingToastSetContent(html);
	$(connectingToast.el).addClass(endClass);
	$(connectingToast.el).find(".preloader-wrapper").hide();

	setTimeout(() => connectingToast.remove(), timeout);
}


/// Return a promise that resolves into a matrix client (and establish the connection if needed)
export function getConnectedMatrixClient(){

	if(pendingConnectionPromise !== null){
		console.debug("Matrix Connection already pending");
		// Resolve with current pending connection
		return pendingConnectionPromise; // TODO: untested
	}

	if(mxClient === null || storage.homeserverURL !== currentHomeserverURL){
		// Create a new connection

		if(mxClient !== null){
			// TODO: gently disconnect from current server
		}

		connectingToastStart();
		connectingToastSetContent("Connecting to <code>" + storage.homeserverURL + "</code>");

		pendingConnectionPromise = new Promise((resolve, reject) => {

			new Promise((resolve, reject) => {
				if(storage.homeserverURL === null || storage.homeserverURL !== currentHomeserverURL || storage.accessToken === null){
					console.debug("Registering as guest");
					connectingToastSetContent("Registering as guest on <code>" + storage.homeserverURL + "</code>");
					return resolve(MatrixClient.registerGuest(storage.homeserverURL));
				}

				resolve(new MatrixClient(
					storage.homeserverURL,
					storage.accessToken,
					storage.userId,
					storage.deviceId
				));
			})
				.then((client) => {
					storage.homeserverURL = client.homeserverURL;
					storage.accessToken = client.accessToken;
					storage.userId = client.userID;
					storage.deviceId = client.deviceID;
					storage.save();

					$("#navbar-left .endpoint-url").text(storage.homeserverURL);//TODO: move from here

					mxClient = client;
					currentHomeserverURL = storage.homeserverURL;
					pendingConnectionPromise = null;
					return mxClient;
				},
				(err) => {
					pendingConnectionPromise = null;
					connectingToastEnd("Could not connect to <code>" + storage.homeserverURL + "</code>", "red darken-3");
					throw err;
				})
				.then(loadInformo)
				.then(() => {
					connectingToastEnd("Connected to Informo through <code>" + storage.homeserverURL + "</code>", "informo-bg-green");
				},
				(err) => {
					pendingConnectionPromise = null;
					connectingToastEnd("Could not fetch Informo data", "red darken-3");
					throw err;
				})
				.then(() => {
					resolve(mxClient);
				});
		});
	}
	else {
		console.debug("Matrix already connected");
		pendingConnectionPromise = new Promise((resolve, reject) => { resolve(mxClient); });
	}


	return pendingConnectionPromise;
}

function loadInformo() {
	return new Promise((resolve, reject) => {
		connectingToastSetContent("Searching Informo room <code>"+roomAlias+"</code>");
		mxClient.getRoomIDForAlias(roomAlias)
			.then((roomID) => {
				connectingToastSetContent("Check if joined Informo room <code>"+roomAlias+"</code>");
				mxRoomID = roomID;
				return mxClient.getJoinedRooms();
			})
			.then((rooms) => {
				let inRoom = false;

				for(let room of rooms) {
					if(room === mxRoomID) {
						inRoom = true;
					}
				}

				if(inRoom) {
					return Promise.resolve();
				}

				connectingToastSetContent("Joining Informo room <code>"+roomAlias+"</code>");
				return mxClient.joinRoom(roomAlias);
			})
			.then(() => {
				connectingToastSetContent("Fetching Informo source list");
				return mxClient.getStateEvent(mxRoomID, "network.informo.sources");
			})
			.then((sources) => {
				informoSources.setSources(sources);
				if(!informoSources.hasSources()) {
					throw "Could not retrieve sources";
				}
				resolve();
			});
	});

}

export function getNews(sourceClassName = null, resetPos = false) {
	console.log("getNews", sourceClassName, resetPos);
	return new Promise((resolve, reject) => {
		let filter = {types: [],senders: []}

		if(sourceClassName) {
			filter.types.push(sourceClassName)
			for(let publisher of informoSources.sources[sourceClassName].publishers) {
				filter.senders.push(publisher)
			}
		} else {
			for(let className in informoSources.sources) {
				filter.types.push(className)
				for(let publisher of informoSources.sources[className].publishers) {
					filter.senders.push(publisher)
				}
			}
		}

		resolve(mxClient.getMessages(mxRoomID, filter, 20, resetPos));
	})
	.then((news) => {
		let p = []
		for (let i in news) {
			p.push(
				new Promise((resolve, reject) => {
					let sig, key, canonical;
					try {
						sig = naclUtil.decodeBase64(news[i].content.signature);
						key = naclUtil.decodeBase64(informoSources.sources[news[i].type].publicKey);
						delete(news[i].content.signature);
						canonical = naclUtil.decodeUTF8(stringify(news[i].content));
					} catch(e) {
						resolve(false);
					}
					resolve(nacl.sign.detached.verify(canonical, sig, key));
				})
				.then((verified) => {
                    // TODO: Work on a proper verification badge, which we can
                    // display (preferably in index.js because it handles
					// display) based on the news[i].content.verified boolean.
					news[i].content.verified = verified;
					if (verified) {
						news[i].content.headline += " 🗸"
					} else {
						news[i].content.headline += " 𐄂"
					}
					return news[i];
				})
			);
		}

		return Promise.all(p)
	})
	.then((news) => {
		let updatedNews = [];
		for (let n of news) {
			n.thumbnail = null
			let medias = n.content.content.match(mxcURLRegexpGen);
			if (medias) {
				for (let m of medias) {
					let parts = getPartsFromMXCURL(m)
					let dlURL = mxClient.homeserverURL
						+ "/_matrix/media/r0/download/" + parts.serverName
						+ "/" + parts.mediaID;
					n.content.content = n.content.content.replace(m, dlURL);
				}
				let thumbnailParts = getPartsFromMXCURL(medias[0])
				n.content.thumbnail = mxClient.homeserverURL
					+ "/_matrix/media/r0/download/" + thumbnailParts.serverName
					+ "/" + thumbnailParts.mediaID;
			}
			updatedNews.push(n)
		}

		return updatedNews
	});
}

function getPartsFromMXCURL(mxcURL) {
	let parts = mxcURL.match(mxcURLRegexpLoc)
	return {
		serverName: parts[1],
		mediaID: parts[2],
	};
}
