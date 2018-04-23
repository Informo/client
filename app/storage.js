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

class Storage {
	constructor(){
		this.homeserverURL    = this._getLocalStorage("homeserverURL");
		this.accessToken      = this._getLocalStorage("accessToken");
		this.userID           = this._getLocalStorage("userID");
		this.deviceID         = this._getLocalStorage("deviceID");
		this.roomAlias        = this._getLocalStorage("roomAlias");
		this.roomID           = this._getLocalStorage("roomID");
		this.userSources      = JSON.parse(this._getLocalStorage("userSources", "[]"));
	}

	save(){
		window.localStorage.setItem("homeserverURL", this.homeserverURL);
		window.localStorage.setItem("accessToken", this.accessToken);
		window.localStorage.setItem("userID", this.userID);
		window.localStorage.setItem("deviceID", this.deviceID);
		window.localStorage.setItem("roomAlias", this.roomAlias);
		window.localStorage.setItem("roomID", this.roomID);
		window.localStorage.setItem("userSources", JSON.stringify(this.userSources));
	}

	_getLocalStorage(name, defaultValue = null){
		const value = window.localStorage.getItem(name);
		if(value === null || value === "null"){
			return defaultValue;
		}
		return value;
	}
}

export default (new Storage);
