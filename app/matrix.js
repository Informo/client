import storage from './storage'
import loader from './loader'
import informoSources from './sources'
import MatrixClient from './matrix/client'

const homeserverURL = 'https://matrix.org';
const roomAlias = '#informo:matrix.org';

var mxClient;
var mxRoomID;

export function initMatrixClient(){
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

// TODO: Optional parameter to get news of a specific source
export function getNews() {
	return new Promise((resolve, reject) => {

		loader.update(80, "Fetching latest news");
		let filter = {types: []}

		for(let source of informoSources.sources) {
			filter.types.push(source.className)
		}

		resolve(mxClient.getMessages(mxRoomID, filter, 30));
	})
}
