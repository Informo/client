"use strict;"

import storage from './storage'
import loader from './loader'
import informoSources from './sources'
import * as matrix from './matrix'

const eventPrefix = "network.informo.news.";


$( document ).ready(function(){
	$("#navbar-left-button").sideNav();
	$('.collapsible').collapsible();

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
		loader.reset();
		loader.update(50, "Fetching news")
		displayNews()
	});
})

function displayNews() {
	let currentSource = getCurrentSource()

	return matrix.getNews(currentSource)
	.then((news) => {
		loader.update(100);
		for(let n of news) {
			let content = n.content;
			if (informoSources.canPublish(n.sender, n.type)) {
				addArticle(
					content.headline,
					null,
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

	if (hashIndex < 0) {
		return null
	}

	return eventPrefix + currentURL.substr(hashIndex+1);
}

function updateSources(){
	$(".informo-source-link").remove();
	let appender = $("#sourcelist-append");

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

function addArticle(title, image, source, ts, content, href = null){
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

	let date = new Date(ts*1000);
	$(content).find("script").remove()

	article.find(".informo-article-anchor").attr("href", href);
	article.find(".informo-article-title").text(title);
	article.find(".informo-article-source").text(source);
	article.find(".informo-article-date").text(date.toString());
	article.find(".informo-article-content").html(content);

	$("#article-list").prepend(article);
}
