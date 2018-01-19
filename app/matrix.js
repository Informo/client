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

export function initMatrixClient(homeserverURL){
	return new Promise((resolve, reject) => {
		loader.update(20, "Creating session at " + homeserverURL);

		if(storage.homeserverURL === null || storage.homeserverURL !== homeserverURL || storage.accessToken === null){
			console.debug("Registering as guest")
			return resolve(MatrixClient.registerGuest(homeserverURL));
		}

		resolve(new MatrixClient(
			storage.homeserverURL,
			storage.accessToken,
			storage.userId,
			storage.deviceId,
		));
	})
	.then((client) => {
		storage.homeserverURL = client.homeserverURL;
		storage.accessToken = client.accessToken;
		storage.userId = client.userID;
		storage.deviceId = client.deviceID;
		storage.save();

		return mxClient = client;
	});
}

export function loadInformo() {
	return new Promise((resolve, reject) => {
		loader.update(40, "Entering Informo");
		resolve(mxClient.getRoomIDForAlias(roomAlias))
	})
	.then((roomID) => {
		mxRoomID = roomID
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

		return mxClient.joinRoom(roomAlias);
	})
	.then(() => {
		loader.update(60, "Fetching sources list");
		return mxClient.getStateEvent(mxRoomID, "network.informo.sources");
	})
	.then((sources) => {
		informoSources.setSources(sources);
		if(!informoSources.hasSources()) {
			throw "Could not retrieve sources"
		}
	})
}

export function getNews(sourceClassName = null, resetPos = false) {
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
