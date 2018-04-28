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

// List all existing sources

import $ from "jquery";
import informoSources from "../sources";
import storage from "../storage";
import {newsEventPrefix, stripNewsEventPrefix} from "../const";
import * as matrix from "../matrix";
import * as sidebar from "./sidebar";

const tempateCard = $(`
	<div class="source-card card grey lighten-3">
		<div class="card-image">
			<img class="source-image" src="">
		</div>
		<div class="card-content">
			<span class="card-title grey-text text-darken-4"><span class="source-name">{{SOURCENAME}}</span></span>
			<p class="source-short-description">{{SOURCESHORTDESCRIPTION}}</p>

			<ul>
				<li><a class="source-link-website" onclick="return externalLink(this)">Official website</a></li>
				<li><strong>Country: </strong><span class="source-country"></span></li>
				<li><strong>Language: </strong><span class="source-language"></span></li>
			</ul>
		</div>
		<div class="card-action">
			<a class="add-button btn-floating waves-effect waves-light informo-bg-green" title="Add feed" href="#"><i class="material-icons">add</i></a>
			<a class="view-button btn-floating waves-effect waves-light informo-bg-green right" title="View source page" href="#"><i class="material-icons">pageview</i></a>
		</div>
	</div>
	`);

export function init(){

	$("#page-discover ul.tabs").tabs();
	//TODO: bind search fields

	const container = $("#page-discover .card-container");

	container.empty();

	matrix.getConnectedMatrixClient()
		.then(() => {

			for(let sourceEventClassName in informoSources.sources){
				if(sourceEventClassName.startsWith(newsEventPrefix)){
					const source = informoSources.sources[sourceEventClassName];
					const sourceName = stripNewsEventPrefix(sourceEventClassName);

					let card = tempateCard.clone();

					card.find(".source-image").attr("src", "static/img/logo-full-128.png?TODO=use the source logo instead");
					card.find(".source-name").text(source.name);
					card.find(".source-short-description").text("TODO: source short description");
					card.find(".source-link-website").attr("href", "TODO: Source official website link");
					card.find(".source-country").text("TODO: country");
					card.find(".source-language").text("TODO: language");

					const sourceIndex = storage.userSources.indexOf(sourceName);

					const addButton = card.find(".add-button");
					addButton.toggleClass("disabled", sourceIndex >= 0);

					addButton.bind("click", () => {
						const sourceIndex = storage.userSources.indexOf(sourceEventClassName);
						if(sourceIndex < 0){
							storage.userSources.push(sourceName);
							storage.save();
							sidebar.updateUserSourceList();

							addButton.addClass("disabled");
						}
						return false;
					});

					card.find(".view-button").attr("href", "#/source/"+encodeURI(sourceName));


					container.append(card);
				}
				else{
					console.warn("User sources contains '" + sourceEventClassName + "' that does not match '"+newsEventPrefix+".*' format");
				}
			}
		});

}



