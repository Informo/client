// Connection to a matrix homeserver

import $ from "jquery";
import storage from "../storage";
import Router from "../router";
import * as matrix from "../matrix";
import Materialize from "materialize-css";

import * as sidebarPage from "./sidebar";


export function init(){

	$("#form-connect-homeserver-error").text("");

	let homeservers = [
		{
			url: "https://matrix.org",
			location: "UK",
			owner: "Matrix team",
			info: "Official Matrix server",
		}, {
			url: "https://doge.wow",
			location: "MagicLand",
			owner: "A dog",
			info: "Wow",
		}
	];
	let homeserverList = $("#connect-homeserver-list");
	for(let homeserver of homeservers){

		let tr = $(`
			<tr style="cursor: pointer;">
				<td><code>https://url.com</code></td>
				<td>Location</td>
				<td>Owner</td>
				<td>Info</td>
			</tr>`);
		tr.bind("click", () => {
			$("#form-connect-homeserver-url")
				.val(homeserver.url);
			Materialize.updateTextFields();
		});

		tr.find("td:nth-child(1) code").text(homeserver.url);
		tr.find("td:nth-child(2)").text(homeserver.location);
		tr.find("td:nth-child(3)").text(homeserver.owner);
		tr.find("td:nth-child(4)").text(homeserver.info);

		homeserverList.append(tr);
	}


	$("#form-connect-homeserver").bind("submit", () => {
		let url = $("#form-connect-homeserver-url").val();

		storage.homeserverURL = url;
		storage.roomAlias = "#informo-test:matrix.org"; // TODO: make a form for this
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
