"use strict;"

import storage from './storage'
import loader from './loader'
import informoSources from './sources'
import * as matrix from './matrix'

let matrixClient;
const eventPrefix = "network.informo.news.";


$( document ).ready(function(){
	$("#navbar-left-button").sideNav();
	$('.collapsible').collapsible();

	matrix.initMatrixClient()
	.then(matrix.loadInformo)
	.then(() => {
		loader.update(100);
		updateSources();
	})
	.then(matrix.getNews)
	.then((news) => {
		for(let n of news) {
			let content = n.content;
			addArticle(content.headline, null, n.type, content.date, content.content, content.link);
		}
	})
	.catch((reason) => {
		console.error(reason);
		loader.update(0, reason)
	})

	$(window).bind('hashchange', function() {
		console.log("HashChange", window.location);
		//TODO: query getEventFilter() events and reload articles
	});
})

function updateSources(){
	$(".informo-source-link").remove();
	let appender = $("#sourcelist-append");

	for(let source of informoSources.sources){

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
			console.warn("network.informo.sources contains '" + source.className + "' that does not match 'network.informo.news.*' format");
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
