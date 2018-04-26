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


import Hammer from "hammerjs";
import $ from "jquery";
import Materialize from "materialize-css";

import storage from "./storage";
import * as matrix from "./matrix";
import Router from "./router";

$(document).ready(function(){

	$("#sidebar-button").sideNav({closeOnClick: true, menuWidth: 250});
	$(".modal").modal();

	if(!storage.homeserverURL){
		//Redirect to connect page
		Router.navigate("/connect");//TODO: handle post connection redirection
	}
	else
		Router.updateView();
});


// TODO: find a better way to make externalLink() global
document.externalLink = function(elmt){
	const modal = $("#external-link-confirm");
	const linkTarget = $(elmt).attr("href");
	modal.find(".link-target").text(linkTarget);

	if(new URL(linkTarget).protocol === "https:")
		modal.find(".http-warning").addClass("hide");
	else
		modal.find(".http-warning").removeClass("hide");

	modal.find(".follow-link-button").attr("href", linkTarget);

	$("#external-link-confirm").modal("open");
	return false;
};
