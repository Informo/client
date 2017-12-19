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
		this.streamPos = null;
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

	getMessages(roomID, filter, lim, resetPos = false){
		if (resetPos) {
			this.streamPos = null;
		}

		return new Promise((resolve, reject) => {
			resolve(this.requestMessages(roomID, filter, lim))
		})
		.then((resp) => {
			if (!(resp.chunk && resp.chunk.length)) {
				return this.requestMessages(roomID, filter, lim)
			}

			return resp
		})
		.then((resp) => {
			return resp.chunk
		});
	}

	requestMessages(roomID, filter, lim) {
		let body = {
			dir: "b",
			filter: JSON.stringify(filter),
			limit: lim,
		}

		if (this.streamPos) {
			body.from = this.streamPos;
		}

		return ajax.req(
			"GET",
			this.homeserverURL,
			"/_matrix/client/r0/rooms/" + encodeURIComponent(roomID) + "/messages",
			this.accessToken,
			body,
		)
		.then((resp) => {
			this.streamPos = resp.end;
			return resp;
		});
	}
}
