

import $ from "jquery";
import storage from "../storage";
import connectMatrixHomeserver from "../index";
import MatrixClient from "../matrix/client";
import Materialize from "materialize-css";



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
	for(let [i, homeserver] of homeservers.entries()){

		let tr = $(`
			<tr>
				<td><pre>https://url.com</pre></td>
				<td>Location</td>
				<td>Owner</td>
				<td>Info</td>
			</tr>`);
		tr.bind("click", () => {
			$("#form-connect-homeserver-url")
				.val(homeserver.url);
			Materialize.updateTextFields();
		});

		tr.find("td:nth-child(1) pre").text(homeserver.url);
		tr.find("td:nth-child(2)").text(homeserver.location);
		tr.find("td:nth-child(3)").text(homeserver.owner);
		tr.find("td:nth-child(4)").text(homeserver.info);

		homeserverList.append(tr);
	}


	$("#form-connect-homeserver").bind("submit", () => {

		let url = $("#form-connect-homeserver-url").val();

		new MatrixClient(url).getVersions()
			.then(() => {
				connectMatrixHomeserver(storage.homeserverURL);
				window.location.hash = "#/discover";
			}, (err) => {
				console.error("Could not connect to matrix server: ", err);
				Materialize.toast("Error: " + err, 4000, "red darken-3");
			});

		return false;
	});
}
