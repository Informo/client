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
		this.homeserverURL    = this._getLocalStorage("matrix.homeserverURL");
		this.accessToken      = this._getLocalStorage("matrix.accessToken");
		this.userID           = this._getLocalStorage("matrix.userID");
		this.deviceID         = this._getLocalStorage("matrix.deviceID");
		this.roomAlias        = this._getLocalStorage("matrix.roomAlias");
		this.roomID           = this._getLocalStorage("matrix.roomID");
		this.userSources      = JSON.parse(this._getLocalStorage("user.sources", "[]"));
	}

	save(){
		window.localStorage.setItem("matrix.homeserverURL", this.homeserverURL);
		window.localStorage.setItem("matrix.accessToken", this.accessToken);
		window.localStorage.setItem("matrix.userID", this.userID);
		window.localStorage.setItem("matrix.deviceID", this.deviceID);
		window.localStorage.setItem("matrix.roomAlias", this.roomAlias);
		window.localStorage.setItem("matrix.roomID", this.roomID);
		window.localStorage.setItem("user.sources", JSON.stringify(this.userSources));
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
