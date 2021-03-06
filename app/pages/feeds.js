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

import {FeedReader} from "./fragments/feed-reader";
import informoSources from "../sources";
import {newsEventPrefix} from "../const";




let reader = null;


export function init(type){
	$("body > .navbar-fixed").hide();//TODO: will make impossible to open the side nav

	if(reader === null){
		reader = new FeedReader($("#page-feeds .feed-reader"), false);
	}


	let sources = [];
	let title;

	switch(type){
	case "all":
		title = "All your feeds";
		sources = storage.userSources;
		break;
	case "source":{
		const sourceName = router.getPathParamValue("sourceName");

		//TODO: will display sourceName if informo not yet connected
		const source = informoSources.sources[newsEventPrefix + sourceName];
		if(source)
			title = "Articles from " + source.name;
		else
			title = "Articles from " + sourceName;

		sources = [sourceName];
		break;
	}
	default:
		console.assert("Unknown feeds type:", type);
	}

	$("#page-feeds .page-title").text(title);
	reader.setFeedNames(sources);

}

export function remove(){
	$("body > .navbar-fixed").show();
}