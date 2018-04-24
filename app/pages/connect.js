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

// Connection to a matrix homeserver

import $ from "jquery";
import storage from "../storage";
import Router from "../router";
import * as matrix from "../matrix";
import Materialize from "materialize-css";

import * as sidebarPage from "./sidebar";


const homeservers = [
	{
		url: "https://matrix.org",
		room: "#informo-test:matrix.org",
		location: "UK",
		owner: "Matrix team",
		info: "Official Matrix server",
	}, {
		url: "https://doge.wow",
		room: "#informo:doge.wow",
		location: "MagicLand",
		owner: "A dog",
		info: "Wow",
	}
];

export function init(){

	$("#form-connect-homeserver-error").text("");


	let homeserverList = $("#connect-homeserver-list");
	homeserverList.empty();
	for(let homeserver of homeservers){

		let tr = $(`
			<tr style="cursor: pointer;">
				<td><code>https://url.com</code></td>
				<td><code>#room:url.com</code></td>
				<td>Location</td>
				<td>Owner</td>
				<td>Info</td>
			</tr>`);
		tr.bind("click", () => {
			$("#form-connect-homeserver-url")
				.val(homeserver.url);
			$("#form-connect-room-alias")
				.val(homeserver.room);
			Materialize.updateTextFields();
		});

		tr.find("td:nth-child(1) code").text(homeserver.url);
		tr.find("td:nth-child(2) code").text(homeserver.room);
		tr.find("td:nth-child(3)").text(homeserver.location);
		tr.find("td:nth-child(4)").text(homeserver.owner);
		tr.find("td:nth-child(5)").text(homeserver.info);

		homeserverList.append(tr);
	}


	$("#form-connect-homeserver").bind("submit", () => {
		let url = $("#form-connect-homeserver-url").val();
		let roomAlias = $("#form-connect-room-alias").val();

		storage.homeserverURL = url;
		storage.roomAlias = roomAlias;
		sidebarPage.updateState();
		matrix.getConnectedMatrixClient()
			.then((client) => {
				console.log("Connected to client: ", client);
				//TODO: redirect to /feeds if user has already selected some feeds to follow
				sidebarPage.updateState();
				Router.navigate("/discover");
			},
			(err) => {
				console.error("Could not connect to matrix server: ", err);
				Materialize.toast("Error: " + err, 4000, "red darken-3");
			});

		return false;
	});
}
