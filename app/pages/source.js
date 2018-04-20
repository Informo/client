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
import * as matrix from "../matrix";
import {eventPrefix} from "../const";
import $ from "jquery";

export function init(){

	$("#page-source .content-loader").show();
	$("#page-source .content-loader .loader-text").text("Waiting connection to Informo...");

	matrix.getConnectedMatrixClient()
		.then(() => {
			const sourceClassName = eventPrefix + Router.getPathParamValue("sourceName");
			const source = Sources.sources[sourceClassName];

			if(!source){
				$("#page-source .name").text("Unknown source");
				$("#page-source .description").text("This source does not exist");
				$("#page-source .content-loader").hide();
				return;
			}

			$("#page-source .name").text(source.name);
			$("#page-source .description").text("This source use the following public key: " + source.publicKey);

			// TODO: fetch news from this source

			$("#page-source .content-loader").hide();
		});


}