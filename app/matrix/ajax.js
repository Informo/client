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

export function req(method, homeserverURL, path, accessToken, body = {}) {
	return new Promise((resolve, reject) => {
		if(accessToken) {
			path = path + "?access_token=" + accessToken
		}

		let bodyStr
		if(method === "GET") {
			bodyStr = ""
			if(Object.keys(body).length) {
				if(!accessToken) {
					path += "?"
				}
				for(let key in body) {
					path += "&" + key + "=" + encodeURIComponent(body[key])
				}
			}
		} else {
			bodyStr = JSON.stringify(body)
		}

		resolve($.ajax({
			method: method,
			contentType: "application/json",
			url: homeserverURL + path,
			dataType: "json",
			data: bodyStr,
		})
		.catch(() => {
			throw "Could not connect to the Informo network"
		}));
	});
}
