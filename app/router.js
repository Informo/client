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

import $ from "jquery";

import * as connectPage from "./pages/connect";
import * as feedsPage from "./pages/feeds";

class Router {
	constructor(){
		this.routes = [
			{
				path: "/connect",
				elmt: "#page-connect",
				hideSidebar: true,
				onInit: connectPage.init,
			},
			{
				path: "/feeds",
				elmt: "#page-feeds",
				hideSidebar: false,
				onInit: feedsPage.init,
			},
			{
				path: "/feed/:sourceName",
				elmt: "#page-feed-specific",
				hideSidebar: false,
				onInit: function(){},
			},
			{
				path: "/discover",
				elmt: "#null",
				hideSidebar: false,
				onInit: function(){},
			},
		];
		this.route404 = {
			path: "/404",
			elmt: "#page-404",
			hideSidebar: false,
			onInit: function(){},
		};
		this.currentRoute = null;


		$(window).bind("hashchange", () => {
			this.updateView();
			//TODO: scroll to anchor ix exists && is visible
		});
	}


	currentVirtualUrl(){
		return new URL(window.location.origin + window.location.hash.substr(1));
	}

	navigate(path){
		if(path === this.currentVirtualUrl().pathname){
			this.updateView();
		}
		else{
			window.location.hash = "#" + path;
		}
	}

	updateView(){
		let routeIndex = this._findCurrentRoute();
		if(routeIndex >= 0) {
			this.currentRoute = this.routes[routeIndex];
		}
		else {
			//Display 404
			this.currentRoute = this.route404;
		}

		$("#main-container > *").hide();
		let elmt = $("#main-container").find(this.currentRoute.elmt);

		elmt.show();
		this.currentRoute.onInit();

		if(this.currentRoute.hideSidebar === true)
			$("body").addClass("no-sidebar");
		else
			$("body").removeClass("no-sidebar");

	}

	getPathParamValue(paramName){
		let currentPath = this.currentVirtualUrl().pathname.split("/").filter((a) => a != "");

		for(let [i, name] of this.currentRoute.path.split("/").filter((a) => a != "")) {
			if(name === (":"+paramName)){
				return currentPath[i];
			}
		}
		return null;
	}


	_findCurrentRoute(){
		let currentPath = this.currentVirtualUrl().pathname.split("/").filter((a) => a != "");

		for(let [i, route] of this.routes.entries()){
			let path = route.path.split("/").filter((a) => a != "");

			let match = true;
			for(let [j, name] of path.entries()) {
				if(name[0] === ":")
					continue;

				if(currentPath[j] !== name){
					match = false;
					break;
				}
			}

			if(match)
				return i;
		}
		return -1;
	}

}
export default (new Router);