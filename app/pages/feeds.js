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

var noMorePosts = false;
var prevSource;
var currentSource;

let loaded = false;
let isLoadingBottom = false;

export function init(){
	loaded = false;
	isLoadingBottom = false;

	$("#page-feeds .content-loader").show();
	$("#page-feeds .content-loader .loader-text").text("Waiting connection to Informo...");

	$("#page-feeds .content").hide();
	$("#page-feeds .bottom-loader").hide();

	matrix.getConnectedMatrixClient()
		.then(sidebarPage.updateUserSourceList)
		.then(() => {
			updateActiveSource();
			$("#page-feeds .content-loader .loader-text").text("Fetching latest news");
			return displayNews();
		})
		.catch((reason) => {
			console.error(reason);
			$("#page-feeds .content-loader .loader-text").text("Failed: " + reason);
		})
		.then(() => {

			$("#page-feeds .content-loader").hide();
			$("#page-feeds .content").show();
			loaded = true;
		});

	$(window).bind("hashchange", () => resetDisplay());

	$(window).bind("scroll", () => {
		let loaderPos = $("#page-feeds .bottom-loader").position().top;

		if (loaded && window.scrollY + window.innerHeight >= loaderPos && !isLoadingBottom && !noMorePosts) {
			isLoadingBottom = true;
			displayNews(false, true)
				.then(() => isLoadingBottom = false);
		}
	});

	$(window).bind("keyup", (ev) => {
		if (ev.altKey && ev.originalEvent.key == "r") {
			resetDisplay(false);
		}
	});

	$("#refresh-button").bind("click", () => resetDisplay(false));

	matrix.getConnectedMatrixClient();

}






function resetDisplay(checkSource = true) {
	updateActiveSource();

	if ((prevSource != currentSource) || !checkSource) {
		noMorePosts = false;
		clearArticles();
		loader.indeterminate()
		loader.reset();
		displayNews(true);
	}
}

function updateActiveSource() {
	let hash = "#" + getCurrentSource();
	let activeClassValue = " grey lighten-1"

	for (let el of $(".informo-source-link")) {
		let href = $(el).find("a").attr("href");
		let classes = $(el).attr("class");

		if (href === hash) {
			classes += activeClassValue;
		} else {
			classes = classes.replace(activeClassValue, "");
		}

		$(el).attr("class", classes);
	}
}

function updateEndpointUrl(url){
	$("#navbar-left .endpoint-url").text(url);
}

function displayNews(resetPos = false, bottomLoad = false) {
	return matrix.getNews(currentSource, resetPos)
		.then((news) => {
			if (!(news && news.length)) {
				noMorePosts = true;
				$("#page-feeds .bottom-loader").hide();
				return;
			}

			news.sort((a, b) => b.content.date - a.content.date);

			for(let n of news) {
				let content = n.content;
				if (informoSources.canPublish(n.sender, n.type)) {
					addArticle(
						content.headline,
						content.description,
						content.author,
						content.thumbnail,
						informoSources.sources[n.type].name,
						content.date,
						content.content,
						content.link
					);
				}
			}

			$("#page-feeds .bottom-loader").show();
		});
}

function getCurrentSource() {
	prevSource = currentSource;

	let currentURL = Router.currentVirtualUrl().href;
	let hashIndex = currentURL.indexOf("#");
	let substring = currentURL.substr(hashIndex+1);

	if (hashIndex < 0 || !substring.length) {
		currentSource = null;
	} else {
		currentSource = eventPrefix + substring;
	}

	if (typeof prevSource == "undefined") {
		prevSource = currentSource;
	}

	return substring;
}



function getEventFilter(){
	const params = (new URL(window.location)).searchParams;
	return eventPrefix + params.get("source");
}

function clearArticles(){
	$("#page-feeds .bottom-loader").css("display", "none");
	$("#article-list > *").remove();
}

function addArticle(title, description, author, image, source, ts, content, href = null){
	let article = $(`
		<li class="informo-article">
			<div class="collapsible-header hoverable">
				<div>
					<div class="flow-text"><span class="informo-article-title">{{TITLE}}</span></div>
					<div class="informo-article-publication">
						<span class="informo-article-author">{{AUTHOR}}</span>
						<span class="informo-article-source">{{SOURCE}}</span>
						-
						<span class="informo-article-date">{{DATE}}</span>
					</div>
					<div class="informo-article-intro">
						{{DESCRIPTION}}
					</div>
				</div>
				<div class="informo-article-image hide-on-small-only valign-wrapper">
					<img src="">
				</div>

			</div>
			<div class="collapsible-body">
				<div class="informo-article-details informo-bg-green-light">
					<a class="informo-article-anchor" href="{{LINK}}"><i class="material-icons">link</i> Informo article link</a>
					<a class="informo-article-source" href="{{LINK}}" onclick="return externalLink(this)"><i class="material-icons">open_in_new</i> Original article</a>
				</div>
				<p class="informo-article-content">

				</p>
			</div>
		</li>`);

	if(image && image !== null){
		article.addClass("with-img");
		article.find(".informo-article-image img").attr("src", image);
	}
	else{
		article.find(".informo-article-image").remove();
	}

	// Author
	if (author) {
		article.find(".informo-article-author").html("by <em>" + author + "</em> for");
	} else {
		article.find(".informo-article-author").remove();
	}
	// Source
	article.find(":not(a).informo-article-source")
		.text(source);
	// Date
	let date = new Date(ts*1000);
	if (date) {
		article.find(".informo-article-date").text(`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`);
	} else {
		article.find(".informo-article-date").remove();
	}

	article.find(".informo-article-anchor").attr("href", "#"); //TODO add a link to this article on informo
	article.find(".informo-article-title").text(title);
	article.find("a.informo-article-source").attr("href", href);

	function setSanitizedHtmlContent(element, content){
		element.html(content);
		element.find("script").remove();
		element.find("a").attr("onclick", "return externalLink(this)");
	}
	setSanitizedHtmlContent(article.find(".informo-article-intro"), description);
	setSanitizedHtmlContent(article.find(".informo-article-content"), content);

	$("#article-list").append(article);
}