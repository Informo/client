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

// Source information and associated feeds

import Router from "../router";
import Sources from "../sources";
import storage from "../storage";
import * as matrix from "../matrix";
import {eventPrefix} from "../const";
import {Reader} from "./fragments/reader";
import * as sidebar from "./sidebar";
import $ from "jquery";

let reader = null;
let setup = false;
let sourceClassName = null;

export function init(){

	if(reader === null){
		reader = new Reader($("#page-source .reader"), true);
	}
	else
		reader.reset();

	$("#page-source .content-loader").show();
	$("#page-source .content").hide();
	$("#page-source .content-loader .loader-text").text("Waiting connection to Informo...");

	sourceClassName = eventPrefix + Router.getPathParamValue("sourceName");

	matrix.getConnectedMatrixClient()
		.then(() => {
			// TODO: content will be inserted multiple times if we change page during loading
			const source = Sources.sources[sourceClassName];

			if(!source){
				$("#page-source .name").text("Unknown source");
				$("#page-source .description").text("This source does not exist");

				$("#page-source .add-button").hide();
				$("#page-source .remove-button").hide();
			}
			else{
				$("#page-source .name").text(source.name);
				$("#page-source .description").text("This source use the following public key: " + source.publicKey);

				const isSourceAdded = storage.userSources.indexOf(sourceClassName) >= 0;
				$("#page-source .add-button").toggle(isSourceAdded === false);
				$("#page-source .remove-button").toggle(isSourceAdded === true);

				// Display news for this source
				reader.setFeed([sourceClassName]);
			}

			$("#page-source .content-loader").hide();
			$("#page-source .content").show();

		});

	if(setup === false){
		// Set button callbacks
		$("#page-source .add-button").bind("click", ()=>{
			const sourceIndex = storage.userSources.indexOf(sourceClassName);
			if(sourceIndex < 0){
				storage.userSources.push(sourceClassName);
				storage.save();
				_updateAddRmButtons();
				sidebar.updateUserSourceList();
			}
		});
		$("#page-source .remove-button").bind("click", ()=>{
			const sourceIndex = storage.userSources.indexOf(sourceClassName);
			if(sourceIndex >= 0){
				storage.userSources.splice(sourceIndex, 1);
				storage.save();
				_updateAddRmButtons();
				sidebar.updateUserSourceList();
			}
		});

		setup = true;
	}


}

export function remove(){
	reader.deactivate();
}


function _updateAddRmButtons(){
	const isSourceAdded = storage.userSources.indexOf(sourceClassName) >= 0;
	$("#page-source .add-button").toggle(isSourceAdded === false);
	$("#page-source .remove-button").toggle(isSourceAdded === true);
}