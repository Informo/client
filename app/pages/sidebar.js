// Special "page" that handles the side bar containing feed list.


import $ from "jquery";
import storage from "../storage";
import * as matrix from "../matrix";
import informoSources from "../sources";
import {eventPrefix} from "../const";


export function init(){
	updateState();
}


/// Read current informo connection status and updates its content accordingly
export function updateState(){
	// if(Router.getCurrentRoute.hideSideBar == true)
	// 	return;


	if(storage.homeserverURL === null){
		$("#navbar-left .endpoint-url").text("Not setup");

		$("#navbar-left .navbar-if-needsetup").show();
		$("#navbar-left .navbar-if-connected").hide();
	}
	else{

		$("#navbar-left .endpoint-url").text(storage.homeserverURL);

		$("#navbar-left .navbar-if-needsetup").hide();

		if(matrix.isInformoConnected()){
			$("#navbar-left .navbar-if-connected").show();
			$("#sourcelist-load").hide();
		}
		else{
			$("#navbar-left .navbar-if-needsetup").show();
			$("#navbar-left .navbar-if-connected").hide();
		}


		// Connect to informo
		matrix.getConnectedMatrixClient()
			.then(updateUserSourceList);

	}
}



let lastSourceList = null;

/// Updates the list of sources in the sidebar
export function updateUserSourceList(){
	// TODO: currently, we display all existing sources here.
	//       We should implement a way to "favorite" specific sources so
	//       only them are displayed here.



	if(informoSources.sources !== lastSourceList){

		$(".informo-source-link").remove();
		let appender = $("#sourcelist-append");

		$("#sourcelist-load").hide();

		for(let className in informoSources.sources){

			if(className.startsWith(eventPrefix)){
				let evName = className.substr(eventPrefix.length);

				let li = $(`
					<li class="informo-source-link">
						<a href="{{LINK}}"><span class="link">{{NAME}}</span><span class="new badge informo-bg-green" data-badge-caption="unread">{{UNREAD_CNT}}</span></a>
					</li>`);

				li.find("a")
					.attr("href", "#/source/" + encodeURI(evName))
					.find(".link")
					.text(informoSources.sources[className].name);


				li.find(".badge")
					.text(informoSources.sources[className].unread)
					.addClass(informoSources.sources[className].unread === 0 ? "hide" : null);

				appender.before(li);
			}
			else{
				console.warn("network.informo.sources contains '" + className + "' that does not match 'network.informo.news.*' format");
			}
		}

		lastSourceList = informoSources.sources;
	}


}