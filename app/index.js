"use strict;"

import Hammer from 'hammerjs'
import $ from 'jquery'
import 'materialize-css'

import storage from './storage'
import loader from './loader'
import informoSources from './sources'
import * as matrix from './matrix'

const eventPrefix = "network.informo.news.";
const homeserverURL = 'https://matrix.org';

var isLoading = false;
var noMorePosts = false;
var currentSource = null;

$( document ).ready(function(){
	const navBarHeight = 64;

	$("#navbar-left-button").sideNav({closeOnClick: true});
	$('#article-list').collapsible();
	$('.modal').modal();

	updateEndpointUrl(homeserverURL);

	matrix.initMatrixClient(homeserverURL)
	.then(matrix.loadInformo)
	.then(updateSources)
	.then(() => {
		loader.update(80, "Fetching latest news");
		displayNews();
	})
	.catch((reason) => {
		console.error(reason);
		loader.update(0, reason)
	})

	$(window).bind('hashchange', () => {
		let prevSource = null;
		getCurrentSource();

		if (prevSource != currentSource) {
			noMorePosts = false;
			clearArticles();
			loader.indeterminate()
			loader.reset();
			displayNews(true);
		}
	});

	$(window).bind('scroll', () => {
		let loaderPos = $("#bottom-loader").position().top;

		if (!loader.active && window.scrollY + window.innerHeight >= loaderPos && !isLoading && !noMorePosts) {
			isLoading = true;
			displayNews(false, true)
			.then(() => isLoading = false);
		}
	});
})

function updateEndpointUrl(url){
	$("#navbar-left .endpoint-url").text(url);
}

function displayNews(resetPos = false, bottomLoad = false) {
	return matrix.getNews(currentSource, resetPos)
	.then((news) => {
		if (!(news && news.length)) {
			noMorePosts = true;
			$("#bottom-loader").css("display", "none");
			return
		}

		news.sort((a, b) => b.content.date - a.content.date)

		loader.update(100);
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

		$("#bottom-loader").css('display', 'block');
	})
}

function getCurrentSource() {
	let currentURL = window.location.href;
	let hashIndex = currentURL.indexOf("#");

	if (hashIndex < 0 || !currentURL.substr(hashIndex+1).length) {
		currentSource = null;
		return;
	}

	currentSource = eventPrefix + currentURL.substr(hashIndex+1);
}

function updateSources(){
	$(".informo-source-link").remove();
	let appender = $("#sourcelist-append");

	let load = $("#sourcelist-load");
	if (load.css("display") != "none") {
		load.css("display", "none");
	}

	for(let className in informoSources.sources){

		if(className.startsWith(eventPrefix)){
			let evName = className.substr(eventPrefix.length);

			let li = $(`
				<li class="informo-source-link">
					<a href="{{LINK}}"><span class="link">{{NAME}}</span><span class="new badge informo-bg-green" data-badge-caption="unread">{{UNREAD_CNT}}</span></a>
				</li>`);

			li.find("a")
				.attr("href", "#" + encodeURI(evName))
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
}

function getEventFilter(){
	const params = (new URL(window.location)).searchParams;
	return eventPrefix + params.get("source");
}

function clearArticles(){
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
		.text(source)
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


document.externalLink = function(elmt){
	const modal = $("#external-link-confirm");
	const linkTarget = $(elmt).attr("href");
	modal.find(".link-target").text(linkTarget);

	if(new URL(linkTarget).protocol === "https:")
		modal.find(".http-warning").addClass("hide");
	else
		modal.find(".http-warning").removeClass("hide");

	modal.find(".follow-link-button").attr("href", linkTarget);

	$("#external-link-confirm").modal('open');
	return false;
}
