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
import {newsEventPrefix} from "../const";


const sourceButton = $(`
	<li class="informo-source-link">
		<a class="source-link">
			<span class="source-name">{{NAME}}</span>
			<span class="badge new informo-bg-green">{{UNREAD_CNT}}</span>
		</a>
		<a class="dropdown-button" href="#" data-activates=""><i class="icon-more material-icons">more_horiz</i></a>

		<ul id="" class="dropdown-content">
			<li><a class="source-page-link"><i class="material-icons">pageview</i>View source page</a></li>
			<li><a class="source-markasread"><i class="material-icons">done_all</i>Mark as read</a></li>
			<li><a class="source-remove"><i class="material-icons">remove</i>Remove source</a></li>
		</ul>

	</li>

	`);



export function init(){
	updateState();
}


/// Read current informo connection status and updates its content accordingly
export function updateState(){
	$("#sidebar .navbar-if-setup").toggle(storage.homeserverURL !== null);
	$("#sidebar .navbar-if-notsetup").toggle(storage.homeserverURL === null);

	if(storage.homeserverURL === null){
		$("#sidebar .endpoint-url").text("Not setup");

		$("#sidebar .navbar-if-connected").hide();
		$("#sidebar .navbar-if-notconnected").hide();
	}
	else{
		$("#sidebar .endpoint-url").text(storage.homeserverURL);

		$("#sidebar .navbar-if-connected").toggle(matrix.isInformoConnected() === true);
		$("#sidebar .navbar-if-notconnected").toggle(matrix.isInformoConnected() !== true);

		// Connect to informo
		matrix.getConnectedMatrixClient()
			.then(updateUserSourceList);

	}
}



let lastSourceList = null;


/// Updates the list of sources in the sidebar
export function updateUserSourceList(){


	if(storage.userSources !== lastSourceList){

		$("#sidebar .informo-source-link").remove();
		let appender = $("#sourcelist-append");

		$("#sidebar #sourcelist-load").hide();

		let i = 0;

		for(let sourceName of storage.userSources){
			let source = informoSources.sources[newsEventPrefix + sourceName];

			if(source){
				let li = sourceButton.clone();

				li.find("a.source-link").attr("href", "#/feeds/source/" + encodeURI(sourceName));
				li.find("a.source-page-link").attr("href", "#/source/" + encodeURI(sourceName));
				li.find(".source-name").text(source.name);

				li.find(".badge")
					.text(source.unread)
					.addClass(source.unread === 0 ? "hide" : null);


				li.find(".dropdown-content").attr("id", "sidebar-dropdown-"+i);
				li.find(".dropdown-button").attr("data-activates", "sidebar-dropdown-"+i);
				i++;

				appender.before(li);

				// Setup dropdown behavior
				li.find(".dropdown-button").dropdown({
					inDuration: 300,
					outDuration: 225,
					constrainWidth: false,
					hover: false,
					gutter: 0,
					belowOrigin: true,
					alignment: "right",
					stopPropagation: true,
				});

				li.find(".source-remove").bind("click", () => {
					const sourceIndex = storage.userSources.indexOf(sourceName);
					if(sourceIndex >= 0){
						storage.userSources.splice(sourceIndex, 1);
						storage.save();
						updateUserSourceList();
					}
				});
			}
			else{
				console.warn("USER DEFINED SOURCES NOT SUPPORTED");//TODO
			}

		}

		lastSourceList = informoSources.sources;
	}


}