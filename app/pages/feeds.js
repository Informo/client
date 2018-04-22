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

// List all articles from all feeds

import $ from "jquery";
import storage from "../storage";
import * as matrix from "../matrix";
import Materialize from "materialize-css";
import informoSources from "../sources";
import {eventPrefix} from "../const";
import Router from "../router";
import * as sidebarPage from "./sidebar";

import {Reader} from "./fragments/reader";




let reader = null;


export function init(){

	if(reader === null){
		reader = new Reader($("#page-feeds .reader"), true);//TODO: make large reader
	}

	reader.setFeed(storage.userSources);

}

