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
import router from "../router";

import {Reader} from "./fragments/reader";
import informoSources from "../sources";
import {newsEventPrefix} from "../const";




let reader = null;


export function init(title, type){
	// TODO: we'll need later a better handling of unread / all selection

	if(reader === null){
		reader = new Reader($("#page-feeds .reader"), true);//TODO: make large reader
	}


	let sources = [];

	switch(type){
	case "all":
		sources = storage.userSources;
		break;
	case "unread":
		reader.setOnlyUnread();
		sources = storage.userSources;
		break;
	case "source":{
		const sourceName = router.getPathParamValue("sourceName");
		if(title === null){
			//TODO: will display sourceName if informo not yet connected
			const source = informoSources.sources[newsEventPrefix + sourceName];
			if(source)
				title = "Articles from " + source.name;
			else
				title = "Articles from " + sourceName;
		}
		sources = [sourceName];
		break;
	}
	default:
		console.assert("Unknown feeds type:", type);
	}

	$("#page-feeds .title").text(title);
	reader.setFeedNames(sources);

}

