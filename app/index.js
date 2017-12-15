"use strict;"

import Hammer from 'hammerjs'
import $ from 'jquery'
import 'materialize-css'

import storage from './storage'
import loader from './loader'
import informoSources from './sources'
import * as matrix from './matrix'

const eventPrefix = "network.informo.news.";


$( document ).ready(function(){
	$("#navbar-left-button").sideNav();
	$('.collapsible').collapsible();
	$('.modal').modal();

	matrix.initMatrixClient()
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
		clearArticles();
		loader.indeterminate()
		loader.reset();
		displayNews()
	});
})

function displayNews() {
	let currentSource = getCurrentSource()

	return matrix.getNews(currentSource)
	.then((news) => {
		news.sort((a, b) => a.content.date - b.content.date)

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
	})
}

function getCurrentSource() {
	let currentURL = window.location.href;
	let hashIndex = currentURL.indexOf("#");

	if (hashIndex < 0 || !currentURL.substr(hashIndex+1)) {
		return null
	}

	return eventPrefix + currentURL.substr(hashIndex+1);
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

			let li = document.createElement("li");
			li.classList.add("informo-source-link");

			let a = document.createElement("a");
			a.setAttribute("href", "#" + encodeURI(evName));
			a.appendChild(document.createTextNode(informoSources.sources[className].name));
			a.addEventListener("click", () => $('#navbar-left-button').sideNav('hide'))
			li.appendChild(a);

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
			<div class="collapsible-header">
				<div>
					<div class="flow-text"><span class="informo-article-title">{{TITLE}}</span><a class="informo-article-anchor" href=""><i class="material-icons">link</i></a></div>
					<div class="informo-article-publication">
						<a class="informo-article-source" href="{{LINK}}" onclick="return externalLink(this)">
							{{SOURCE}}
						</a>
						<span class="informo-article-date">{{DATE}}</span>
						<span class="informo-article-author">{{AUTHOR}}</span>
					</div>
					<div class="informo-article-description">
						{{DESCRIPTION}}
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

	if (author) {
		article.find(".informo-article-author").text("by " + author);
	} else {
		article.find(".informo-article-author").remove();
	}

	let date = new Date(ts*1000);

	if (date) {
		article.find(".informo-article-date").text(" - " + date.toLocaleDateString());
	} else {
		article.find(".informo-article-date").remove();
	}

	// article.find(".informo-article-anchor").attr("href", ); TODO add a link to this article on informo
	article.find(".informo-article-title").text(title);
	article.find(".informo-article-source").text(source);
	article.find(".informo-article-source").attr("href", href);

	article.find(".informo-article-description").html(description);
	article.find(".informo-article-description").find("script").remove();
	article.find(".informo-article-description").find("a").attr("onclick", "return externalLink(this)");

	article.find(".informo-article-content").html(content);
	article.find(".informo-article-content").find("script").remove();
	article.find(".informo-article-content").find("a").attr("onclick", "return externalLink(this)");

	$("#article-list").prepend(article);
}


document.externalLink = function(elmt){
	const modal = $("#external-link-confirm");
	modal.find(".link-target").text($(elmt).attr("href"));

	modal.find(".follow-link-button").attr("href", $(elmt).attr("href"));

	$("#external-link-confirm").modal('open');
	return false;
}
