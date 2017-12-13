class Storage {
	constructor(){
		this.homeserverURL    = window.localStorage.getItem("homeserverURL");
		this.accessToken      = window.localStorage.getItem("accessToken");
		this.userId           = window.localStorage.getItem("userId");
		this.deviceId         = window.localStorage.getItem("deviceId");
		this.roomAlias        = window.localStorage.getItem("roomAlias");
		this.roomId           = window.localStorage.getItem("roomId");
	}

	save(){
		window.localStorage.setItem("homeserverURL", this.homeserverURL);
		window.localStorage.setItem("accessToken", this.accessToken);
		window.localStorage.setItem("userId", this.userId);
		window.localStorage.setItem("deviceId", this.deviceId);
		window.localStorage.setItem("roomAlias", this.roomAlias);
		window.localStorage.setItem("roomId", this.roomId);
	}
}

export default (new Storage)
