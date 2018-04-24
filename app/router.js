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
import * as discoverPage from "./pages/discover";
import * as sidebarPage from "./pages/sidebar";

/// Router page definitions
const routes = [
	{
		path: "/connect",
		elmt: "#page-connect",
		onInit: connectPage.init,
		onRemoved: null,
	},
	{
		path: "/feeds/all",
		elmt: "#page-feeds",
		onInit: () => { feedsPage.init("All your feeds", "all"); },
		onRemoved: null,
	},
	{
		path: "/feeds/unread",
		elmt: "#page-feeds",
		onInit: () => { feedsPage.init("Unread articles", "unread"); },
		onRemoved: null,
	},
	{
		path: "/feeds/source/:sourceName",
		elmt: "#page-feeds",
		onInit: () => { feedsPage.init(null, "source"); },
		onRemoved: null,
	},
	{
		path: "/source/:sourceName",
		elmt: "#page-source",
		onInit: sourcePage.init,
		onRemoved: sourcePage.remove,
	},
	{
		path: "/discover",
		elmt: "#page-discover",
		onInit: discoverPage.init,
		onRemoved: null,
	},
];

/// Special 404 error page
const route404 = {
	path: "/404",
	elmt: "#page-404",
	onInit: function(){},
	onRemoved: null,
};

class Router {
	constructor(){
		this.currentRoute = null;
		this.lastNavbarState = false;
		this.lastUrl = null;

		$(window).bind("hashchange", () => {
			const newVirtURL = this.currentVirtualUrl();

			if(this.currentRoute === null
			|| newVirtURL.pathname !== this.lastUrl){
				this.updateView();
				this.lastUrl = newVirtURL;
			}
			//TODO: scroll to anchor ix exists && is visible
		});

		sidebarPage.init();
	}

	/// Route object of the currently displayed page
	currentActiveRoute(){
		return this.currentRoute;
	}

	/// Returns an URL object that combine the hash location with the current URI
	currentVirtualUrl(){
		let url = window.location.origin === "null" ? "file://" : window.location.origin;
		url += window.location.hash.substr(1);
		return new URL(url);
	}

	/// Navigate to a given virtual path.
	/// path must be absolute and not contain server name.
	/// If the wanted path is already displayed, will refresh the page.
	/// example: `navigate("/connect")`, `navigate("/source/Informo#article_id")`
	navigate(path){
		// TODO: do not refresh if path is the same but anchor is changed
		if(path === this.currentVirtualUrl().pathname){
			this.updateView();
		}
		else{
			window.location.hash = "#" + path;
		}
	}

	/// Update the displayed page to match the current virtual path
	updateView(){
		const currentVirtUrl = this.currentVirtualUrl();
		if(!currentVirtUrl || currentVirtUrl.pathname == "" || currentVirtUrl.pathname == "/"){
			// Landing page
			this.navigate("/feeds/all");
			return;
		}

		$("#main-container > *").hide();
		if(this.currentRoute !== null && this.currentRoute.onRemoved !== null)
			this.currentRoute.onRemoved();

		let routeIndex = this._findCurrentRoute();
		if(routeIndex >= 0) {
			this.currentRoute = routes[routeIndex];
		}
		else {
			//Display 404
			this.currentRoute = route404;
		}


		let elmt = $("#main-container").find(this.currentRoute.elmt);
		elmt.show();
		this.currentRoute.onInit();

	}

	/// Return a path parameter value
	/// example: If route is: `/source/:sourceName`, use `getPathParamValue("sourceName")` to get source name
	getPathParamValue(paramName){
		const currentPath = this.currentVirtualUrl().pathname.split("/").filter((a) => a != "");
		const routePath = this.currentRoute.path.split("/").filter((a) => a != "");

		let i = 0;
		for(let name of routePath) {
			if(name === (":"+paramName)){
				return decodeURI(currentPath[i]);
			}
			i++;
		}
		return null;
	}

	/// Get if path match a path model like `/source/:sourceName`
	matchPath(path, pathModel){
		const pathSplit = path.split("/").filter((a) => a != "");
		const pathModelSplit = pathModel.split("/").filter((a) => a != "");

		if(pathSplit.length != pathModelSplit.length)
			return false;

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
		for(let [i, route] of routes.entries()){
			if(this.matchPath(this.currentVirtualUrl().pathname, route.path))
				return i;
		}
		return -1;
	}

}
export default (new Router);