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
import * as sourcePage from "./pages/source";

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
				path: "/sources/:sourceName",
				elmt: "#page-source",
				hideSidebar: false,
				onInit: sourcePage.init,
			},
			{
				path: "/discover",
				elmt: "#page-discover",
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

			if(this.currentRoute != null && !this.matchPath(this.currentVirtualUrl().pathname, this.currentRoute.path))
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
		if(this.currentVirtualUrl() == "" || this.currentVirtualUrl() == "/"){
			Router.navigate("/feeds");
			return;
		}

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

	matchPath(path, pathModel){
		const pathSplit = path.split("/").filter((a) => a != "");
		const pathModelSplit = pathModel.split("/").filter((a) => a != "");

		for(let [i, name] of pathSplit.entries()) {
			if(pathModelSplit[i][0] === ":")
				continue;

			if(pathModelSplit[i] !== name){
				return false;
			}
		}
		return true;
	}


	_findCurrentRoute(){
		for(let [i, route] of this.routes.entries()){
			if(this.matchPath(this.currentVirtualUrl().pathname, route.path))
				return i;
		}
		return -1;
	}

}
export default (new Router);