import * as ajax from './ajax'

export default class MatrixClient {
	static registerGuest(homeserverURL) {
		return new Promise((resolve, reject) => {
			resolve(ajax.req(
				"POST",
				homeserverURL,
				"/_matrix/client/r0/register?kind=guest"
			));
		})
		.then((regResp) => {
			return new MatrixClient(
				homeserverURL,
				regResp["access_token"],
				regResp["user_id"],
				regResp["device_id"],
			);
		});
	}

	constructor(homeserverURL, accessToken, userID, deviceID){
		this.homeserverURL = homeserverURL;
		this.accessToken = accessToken;
		this.userID = userID;
		this.deviceID = deviceID;
	}

	getJoinedRooms(){
		return new Promise((resolve, reject) => {
			resolve(ajax.req(
				"GET",
				this.homeserverURL,
				"/_matrix/client/r0/joined_rooms",
				this.accessToken,
			));
		})
		.then((resp) => {
			return resp["joined_rooms"]
		});
	}

	getRoomIDForAlias(alias){
		return new Promise((resolve, reject) => {
			resolve(ajax.req(
				"GET",
				this.homeserverURL,
				"/_matrix/client/r0/directory/room/" + encodeURIComponent(alias),
				this.accessToken,
			));
		})
		.then((resp) => {
			return resp["room_id"];
		});
	}

	joinRoom(alias){
		return new Promise((resolve, reject) => {
			resolve(ajax.req(
				"POST",
				this.homeserverURL,
				"/_matrix/client/r0/join/" + encodeURIComponent(alias),
				this.accessToken,
			));
		});
	}

	getStateEvent(roomID, type, stateKey){
		return new Promise((resolve, reject) => {
			if(typeof stateKey !== "string") {
				stateKey = ""
			}

			let path = "/_matrix/client/r0/rooms/" + encodeURIComponent(roomID)
			path += "/state/" + type + "/" + stateKey
			resolve(ajax.req(
				"GET",
				this.homeserverURL,
				path,
				this.accessToken,
			));
		})
		.then((resp) => {
			return resp.sources;
		});
	}

	getMessages(roomID, filter, lim){
		return new Promise((resolve, reject) => {
			resolve(ajax.req(
				"GET",
				this.homeserverURL,
				"/_matrix/client/r0/rooms/" + encodeURIComponent(roomID) + "/messages",
				this.accessToken,
				{filter: JSON.stringify(filter)},
			));
		})
		.then((resp) => {
			return ajax.req(
				"GET",
				this.homeserverURL,
				"/_matrix/client/r0/rooms/" + encodeURIComponent(roomID) + "/messages",
				this.accessToken,
				{
					dir: "b",
					from: resp.start,
					filter: JSON.stringify(filter)
				},
			);
		})
		.then((resp) => {
			return resp.chunk
		});
	}
}
