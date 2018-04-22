// Copyright 2018 Informo core team <core@informo.network>
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

// Special "page" that handles the side bar containing feed list.


import $ from "jquery";
import storage from "../storage";
import * as matrix from "../matrix";
import informoSources from "../sources";
import {eventPrefix} from "../const";


export function init(){
	updateState();
}


/// Read current informo connection status and updates its content accordingly
export function updateState(){
	$("#navbar-left .navbar-if-setup").toggle(storage.homeserverURL !== null);
	$("#navbar-left .navbar-if-notsetup").toggle(storage.homeserverURL === null);

	if(storage.homeserverURL === null){
		$("#navbar-left .endpoint-url").text("Not setup");

		$("#navbar-left .navbar-if-connected").hide();
		$("#navbar-left .navbar-if-notconnected").hide();
	}
	else{
		$("#navbar-left .endpoint-url").text(storage.homeserverURL);

		$("#navbar-left .navbar-if-connected").toggle(matrix.isInformoConnected() === true);
		$("#navbar-left .navbar-if-notconnected").toggle(matrix.isInformoConnected() !== true);

		// Connect to informo
		matrix.getConnectedMatrixClient()
			.then(updateUserSourceList);

	}
}



let lastSourceList = null;

/// Updates the list of sources in the sidebar
export function updateUserSourceList(){
	if(storage.userSources !== lastSourceList){

		$(".informo-source-link").remove();
		let appender = $("#sourcelist-append");

		$("#sourcelist-load").hide();

		for(let className of storage.userSources){

			if(className.startsWith(eventPrefix)){
				let evName = className.substr(eventPrefix.length);

				let li = $(`
					<li class="informo-source-link">
						<a href="{{LINK}}"><span class="link">{{NAME}}</span><span class="new badge informo-bg-green" data-badge-caption="unread">{{UNREAD_CNT}}</span></a>
					</li>`);

				li.find("a")
					.attr("href", "#/source/" + encodeURI(evName))
					.find(".link")
					.text(informoSources.sources[className].name);


				li.find(".badge")
					.text(informoSources.sources[className].unread)
					.addClass(informoSources.sources[className].unread === 0 ? "hide" : null);

				appender.before(li);
			}
			else{
				console.warn("network.informo.sources contains '" + className + "' that does not match 'network.informo.news.*' format");
			}
		}

		lastSourceList = informoSources.sources;
	}


}