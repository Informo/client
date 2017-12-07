"use strict;"

import * as matrix from 'matrix-js-sdk'

const clientEndPoint = 'https://matrix.org';
const roomAlias = '#informo:matrix.org';
const eventPrefix = "network.informo.news.";


let matrixClient;
let matrixRoom;
let informoSources;


$( document ).ready(function(){
	$("#navbar-left-button").sideNav();
	$('.collapsible').collapsible();

	queryMatrixClient(true)
	.then((client) => {
		storage.save();
		return queryRoomInfo(true);
	})
	.then((room) => {
		storage.save();
		matrixClient.peekInRoom(room.roomId)
		.then((data) => {
			console.debug("peekInRoom callback", data);

			// clearArticles();
			// for(let ev of data.timeline){
			// 	if(ev.event.type === getEventFilter()){
			// 		console.debug("Dislay", ev.event.content);
			// 		addArticle(ev.event.content.headline, null, "source", "date", "content");
			// 	}
			// }
		});
	});

	addArticle("Qt 5.10 Released Along With Qt Creator 4.5", "https://www.phoronix.com/assets/categories/qt.jpg", "phoronix.com", "07/12/2017", `
		Qt 5.10 is now officially out as the half-year update to the Qt5 tool-kit.
		Qt 5.10 is arriving just a few days late and is a big feature update. Qt 5.10 features many improvements to Qt Quick and QML, initial Vulkan support, support for streaming Qt UIs to WebGL-enabled browsers, OpenGL ES improvements, new functionality in Qt 3D, a new QRandomGenerator as a "high quality" RNG, OpenSSL 1.1 support in Qt Network, embedded improvements, updated Qt WebEngine, and Qt Network Authentication for OAuth/OAuth2 support and Qt Speech for text-to-speech capabilities. There's a whole lot more as well.
		Qt 5.10 release details can be found via this blog post by Lars Knoll where he also goes in to talk about the recently released Qt 3D Studio 1.0.
		Qt Creator 5.5 was also released today as their Qt/C++ focused integrated development environment. Qt Creator 4.5 features improvements in its CMake support, better Android support, and a variety of other improvements.`);
	addArticle("The Most Exciting Linux Kernel Stories Of 2017", null, "phoronix.com", "07/12/2017", `This year on Phoronix has been more than 290 original news articles pertaining to advancements and changes within the Linux kernel. Here are those highlights.
		With the year opening during the Linux 4.10 RC phase and now ending 2017 with the Linux 4.15 kernel merge window recently passed, here's a look back at the most viewed Linux kernel articles on Phoronix: `);
	addArticle("Such lorem ipsum", "/static/default-img.jpg", "ACME News", "06/12/2017", `Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
		tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
		quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
		consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
		cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
		proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
		Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
		tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
		quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
		consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
		cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
		proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
		Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
		tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
		quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
		consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
		cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
		proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
		Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
		tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
		quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
		consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
		cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
		proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`);
	addArticle("Empty example", null, "source", "date", "content");

	$(window).bind('hashchange', function() {
		console.log("HashChange", window.location);
		//TODO: query getEventFilter() events and reload articles
	});
})


function reportLoadingProgress(percent, message){
	if(percent < 100){
		$("#loader").css("display", "block");
		$("#main-content").css("display", "none");
	}
	else{
		$("#loader").css("display", "none");
		$("#main-content").css("display", "block");
	}

	if(message !== null) $("#loader-text").text(message);
	$("#loader-progress-bar").css("width", percent+"%");
}


class Storage {
	constructor(){
		this.endPoint    = window.localStorage.getItem("endPoint");
		this.accessToken = window.localStorage.getItem("accessToken");
		this.userId      = window.localStorage.getItem("userId");
		this.deviceId    = window.localStorage.getItem("deviceId");
		this.roomAlias   = window.localStorage.getItem("roomAlias");
		this.roomId      = window.localStorage.getItem("roomId");
	}

	save(){
		window.localStorage.setItem("endPoint", this.endPoint);
		window.localStorage.setItem("accessToken", this.accessToken);
		window.localStorage.setItem("userId", this.userId);
		window.localStorage.setItem("deviceId", this.deviceId);
		window.localStorage.setItem("roomAlias", this.roomAlias);
		window.localStorage.setItem("roomId", this.roomId);
	}
}
let storage = new Storage;

function getEventFilter(){
	const params = (new URL(window.location)).searchParams;
	return eventPrefix + params.get("source");
}

function queryMatrixClient(reportProgress = false){

	return new Promise((resolve, reject) => {
		if(storage.endPoint === null || storage.endPoint !== clientEndPoint || storage.accessToken === null){

			if(reportProgress === true) reportLoadingProgress(20, "Creating guest session at "+clientEndPoint);
			return matrix.createClient({ baseUrl: clientEndPoint })
				.registerGuest()
				.then((data) => {
					if(reportProgress === true) reportLoadingProgress(30, null);
					console.debug("Guest", data);
					return resolve({
						baseUrl: clientEndPoint,
						accessToken: data.access_token,
						userId: data.user_id,
						deviceId: data.device_id,
					});
				})
		}
		return resolve({
			baseUrl: storage.endPoint,
			accessToken: storage.accessToken,
			userId: storage.userId,
			deviceId: storage.deviceId,
		});
	})
	.then((param) => {
		storage.endPoint = param.baseUrl;
		storage.accessToken = param.accessToken;
		storage.userId = param.userId;
		storage.deviceId = param.deviceId;

		if(reportProgress === true) reportLoadingProgress(40, "Authenticating as guest at " + param.baseUrl);
		console.debug("Credentials", param);
		return matrix.createClient(param);
	})
	.then((client) => {
		console.debug("Client", client);
		return matrixClient = client;
	});
}



function queryRoomInfo(reportProgress = false){
	if(!matrixClient){
		console.err("matrixClient not initialized");
		return;
	}
	if(reportProgress === true) reportLoadingProgress(60, "Retrieving room information");
	return matrixClient.getRoomIdForAlias(roomAlias)
		.then((data) => {
			return matrixRoom = new matrix.Room(data.room_id);
		})
		.then((matrixRoom) => {
			console.debug("Room", matrixRoom);
			if(reportProgress === true) reportLoadingProgress(80, "Fetching feed list");
			return matrixClient.roomState(matrixRoom.roomId);
		})
		.then((state) => {
			console.debug("Room state", state);

			informoSources = [];
			for(let stateEv of state){
				if(stateEv.type === "network.informo.sources"){
					informoSources = stateEv.content.sources;
				}
			}

			if(!informoSources){
				console.err("Could not find informo source list");
				if(reportProgress === true) reportLoadingProgress(0, "Error: Could not find any feed");
			}
			else{
				$(".informo-source-link").remove();
				let appender = $("#sourcelist-append");

				for(let source of informoSources){

					if(source.className.startsWith(eventPrefix)){
						let evName = source.className.substr(eventPrefix.length);

						let li = document.createElement("li");
						li.classList.add("informo-source-link");

						let a = document.createElement("a");
						a.setAttribute("href", "#" + encodeURI(evName));
						a.appendChild(document.createTextNode(source.name));
						li.appendChild(a);

						appender.before(li);
					}
					else{
						console.err("network.informo.sources contains '" + source.className + "' that does not match 'network.informo.news.*' format");
					}

				}
				if(reportProgress === true) reportLoadingProgress(100, "");
			}

			return matrixRoom;
		});
}


function clearArticles(){
	$("#article-list > *").remove();
}

function addArticle(title, image, source, date, content, href = null){
	let article = $(`
		<li class="informo-article">
			<div class="collapsible-header">
				<div>
					<div class="flow-text"><span class="informo-article-title">{{TITLE}}</span><a class="informo-article-anchor" href="#"><i class="material-icons">link</i></a></div>
					<div class="informo-article-source">
						{{SOURCE}}
					</div>
					<div class="informo-article-date">
						{{DATE}}
					</div>
				</div>
				<img class="informo-article-image" src="{{SRC}}">
			</div>
			<div class="collapsible-body">
				<p class="informo-article-content">

				</p>
			</div>
		</li>`);

	if(image && image !== null){
		article.addClass("with-img");
		article.find(".informo-article-image").attr("src", image);
	}
	else{
		article.find(".informo-article-image").remove();
	}
	article.find(".informo-article-anchor").attr("href", href);
	article.find(".informo-article-title").text(title);
	article.find(".informo-article-source").text(source);
	article.find(".informo-article-date").text(date);
	article.find(".informo-article-content").text(content);

	$("#article-list").append(article);
}

