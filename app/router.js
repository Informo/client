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

import * as connectPage from "./pages/connect";

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
				onInit: function(){},
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


		$(window).bind("hashchange", () => this.updateView());
	}




	updateView(){
		let lastView = this.currentRoute;

		let routeIndex = this._findCurrentRoute();
		if(routeIndex >= 0) {
			this.currentRoute = this.routes[routeIndex];
		}
		else {
			//Display 404
			this.currentRoute = this.route404;
		}

		if(this.currentView !== lastView){
			console.log("Current route: ", this.currentRoute);

			$("#main-container > *").hide();
			let elmt = $("#main-container").find(this.currentRoute.elmt);

			elmt.show();
			this.currentRoute.onInit();

			if(this.currentRoute.hideSidebar === true)
				$("body").addClass("no-sidebar");
			else
				$("body").removeClass("no-sidebar");
		}

	}

	getPathParamValue(paramName){
		for(let [i, name] of this.routes[this.currentView]) {
			if(name === (":"+paramName)){
				return window.location.pathname.split("/")[i];
			}
		}
		return null;
	}


	_findCurrentRoute(){
		let location = new URL("http://_/" + window.location.hash.substr(1));//TODO: ugly, should be a way to only parse path + hash
		let currentPath = location.pathname.split("/").filter((a) => a != "");

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