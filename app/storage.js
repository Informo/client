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
		this.homeserverURL    = window.localStorage.getItem("homeserverURL");
		this.accessToken      = window.localStorage.getItem("accessToken");
		this.userID           = window.localStorage.getItem("userID");
		this.deviceID         = window.localStorage.getItem("deviceID");
		this.roomAlias        = window.localStorage.getItem("roomAlias");
		this.roomID           = window.localStorage.getItem("roomID");
		this.userSources      = JSON.parse(window.localStorage.getItem("userSources"));
		if(this.userSources === null) this.userSources = [];
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
}

export default (new Storage);
