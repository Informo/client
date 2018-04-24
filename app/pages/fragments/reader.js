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


// Reader fragment to read feed articles


import $ from "jquery";
import informoSources from "../../sources";
import * as matrix from "../../matrix";
import {newsEventPrefix} from "../../const";



const template = [
	{
		// Paned / large view
		body: $(`
			<div class="reader-fragment">
				<div class="reader-pane-list">

					<ul class="collection with-header">
						<div class="reader-request-loader center-align">
							<div class="preloader-wrapper active">
								<div class="spinner-layer spinner-green-only">
									<div class="circle-clipper left">
										<div class="circle"></div>
									</div><div class="gap-patch">
										<div class="circle"></div>
									</div><div class="circle-clipper right">
										<div class="circle"></div>
									</div>
								</div>
							</div>
						</div>
						<div class="article-list"></div>
						<li class="reader-bottom-loader reader-loaded-content collection-item center-align">
							<div class="preloader-wrapper active">
								<div class="spinner-layer spinner-green-only">
									<div class="circle-clipper left">
										<div class="circle"></div>
									</div><div class="gap-patch">
										<div class="circle"></div>
									</div><div class="circle-clipper right">
										<div class="circle"></div>
									</div>
								</div>
							</div>
						</li>
					</ul>
				</div>

				<div class="reader-pane-article z-depth-1">
					<div class="container">
						<div class="reader-request-loader center-align">
							<div class="preloader-wrapper active">
								<div class="spinner-layer spinner-green-only">
									<div class="circle-clipper left">
										<div class="circle"></div>
									</div><div class="gap-patch">
										<div class="circle"></div>
									</div><div class="circle-clipper right">
										<div class="circle"></div>
									</div>
								</div>
							</div>
							<div class="reader-request-loader-text flow-text"></div>
						</div>
						<div class="reader-article reader-loaded-content">
							<h3></h3>
							<p>
							</p>
						</div>
					</div>
				</div>
			</div>
		`),
		article: $(`
			<a class="informo-article collection-item" href="#">
				<i class="material-icons">label_outline</i>
				<span class="informo-article-title title flow-text">Praise Raptor Jesus and the FSM will grant you eternal life</span>
				<div class="informo-article-intro truncate">
					Every day, you need to address a prayer<br>
					Because yolo
				</div>
				<div>
					<span class="informo-article-author">PirateCaptain</span>
					<span class="informo-article-source">Real church</span>
					<span class="right informo-article-date">01/02/2018</span>
				</div>
			</a>
		`),
	},
	{
		// Compact view
		body: $(`
			<div style="reader-fragment compact">
				<div class="reader-request-loader center-align">
					<div class="preloader-wrapper active">
						<div class="spinner-layer spinner-green-only">
							<div class="circle-clipper left">
								<div class="circle"></div>
							</div><div class="gap-patch">
								<div class="circle"></div>
							</div><div class="circle-clipper right">
								<div class="circle"></div>
							</div>
						</div>
					</div>
					<div class="reader-request-loader-text flow-text"></div>
				</div>

				<ul class="article-list reader-loaded-content collapsible popout" data-collapsible="accordion"></ul>

				<div class="reader-bottom-loader reader-loaded-content center-align">
					<div class="preloader-wrapper active">
						<div class="spinner-layer spinner-green-only">
							<div class="circle-clipper left">
								<div class="circle"></div>
							</div><div class="gap-patch">
								<div class="circle"></div>
							</div><div class="circle-clipper right">
								<div class="circle"></div>
							</div>
						</div>
					</div>
				</div>
			</div>`),
		article: $(`
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
			</li>`),
	},
];

let readerId = 0;


export class Reader {
	/// container: where necessary HTML will be injected
	/// compact: true to make
	constructor(container, compact){
		console.assert(container instanceof $);
		console.assert(typeof compact === "boolean");

		this.compact = compact;

		this.id = readerId++;
		this.scrollListener = null;

		this.body = template[this.compact === true ? 1 : 0].body.clone();

		this.reset();

		container.append(this.body);

		if(this.compact === true){
			this.body.find(".article-list").collapsible();
		}
		else{
			// TODO: handle unbind
			const body = this.body;
			$(window).bind("resize", function(){
				body.height($(window).height() - body.position().top);
			});
			this.body.height($(window).height() - this.body.position().top);


		}
	}
	/// Remove all feeds
	reset(){
		this.loaded = false;
		this.isLoadingBottom = false;
		this.noMorePosts = false;
		this.sourceClassNames = null;
		this.showUnreadOnly = false;

		this.body.find(".reader-request-loader").show();
		this.body.find(".reader-loaded-content").hide();
		this.body.find(".article-list .informo-article").remove();
	}

	deactivate(){
		if(this.scrollListener !== null){
			$(window).unbind("scroll.readerBottomLoad");
		}
	}

	/// If called, this reader will only show unread feeds. Call this.reset() to undo.
	setOnlyUnread(){
		this.showUnreadOnly = true;
	}

	setFeedNames(sourceNames){
		let sourceClassNames = [];
		for(let sourceName of sourceNames){
			sourceClassNames.push(newsEventPrefix + sourceName);
		}
		this.setFeed(sourceClassNames);
	}

	/// Make the reader fetch news from multiple feeds
	/// sourceClassNames: array of SourceClassName
	setFeed(sourceClassNames){
		console.assert(sourceClassNames.constructor === Array);
		for(let sourceClassName of sourceClassNames)
			console.assert(sourceClassName.startsWith(newsEventPrefix), "wrong class prefix for "+sourceClassName);

		if(this.loaded === true)
			this.reset();

		this.sourceClassNames = sourceClassNames;

		this._appendFeedArticles(true, true)
			.then(() => {
				this.body.find(".reader-request-loader").hide();
				this.body.find(".reader-loaded-content").show();


				// Bind bottom scroll
				if(this.scrollListener !== null){
					$(window).unbind("scroll.readerBottomLoad"+this.id.toString);
				}
				$(window).bind("scroll.readerBottomLoad"+this.id.toString, () => {
					let loaderPos = this.body.find(".reader-bottom-loader").position().top;

					if (this.loaded === true && window.scrollY + window.innerHeight >= loaderPos && this.isLoadingBottom === false && this.noMorePosts === false) {
						this.isLoadingBottom = true;
						this._appendFeedArticles(false)
							.then(() => this.isLoadingBottom = false);
					}
				});
			});
	}



	_appendFeedArticles(resetPos, reportProgress = false) {
		if(reportProgress === true)
			this.body.find(".reader-request-loader .reader-request-loader-text").text("Waiting connection to Informo...");

		return matrix.getConnectedMatrixClient()
			.then(() => {
				if(reportProgress === true)
					this.body.find(".reader-request-loader .reader-request-loader-text").text("Fetching news...");

				return matrix.getNews(this.sourceClassNames, resetPos);
			})
			.then((news) => {
				if (!(news && news.length)) {
					this.noMorePosts = true;
					this.body.find(".reader-bottom-loader").hide();
					return;
				}

				news.sort((a, b) => b.content.date - a.content.date);

				for(let article of news) {
					//TODO: handle unread
					if (informoSources.canPublish(article.sender, article.type)) {
						let content = article.content;
						this._addArticle(
							content.headline,
							content.description,
							content.author,
							content.thumbnail,
							informoSources.sources[article.type].name,
							content.date,
							content.content,
							content.link
						);
					}
				}

				this.loaded = true;
				this.body.find(".reader-bottom-loader").show();
			});
	}


	/// Add a single article to the list.
	/// title: title of the article
	/// description: short description / introduction
	/// author: author name
	/// image: main image to display (null if none)
	/// source: article source name
	/// ts: timestamp the article has been posted
	/// content: HTML content
	/// href: original article link (on the news site)
	_addArticle(title, description, author, image, source, ts, content, href){
		let article = template[this.compact === true ? 1 : 0].article.clone();

		if(image && image !== null){
			article.addClass("with-img");
			article.find(".informo-article-image img").attr("src", image);
		}
		else{
			article.find(".informo-article-image").remove();
		}

		// Author
		if (author) {
			article.find(".informo-article-author").html("by <em></em> for");
			article.find(".informo-article-author > em").text(author);
		} else {
			article.find(".informo-article-author").remove();
		}
		// Source
		article.find(":not(a).informo-article-source").text(source);
		article.find("a.informo-article-source").attr("href", href);
		// Date
		let date = new Date(ts*1000);
		if (date) {
			article.find(".informo-article-date").text(`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`);
		} else {
			article.find(".informo-article-date").remove();
		}

		article.find(".informo-article-anchor").attr("href", "#"); //TODO add a link to this article on informo
		article.find(".informo-article-title").text(title);

		function setSanitizedHtmlContent(element, content){
			element.html(content);
			element.find("script").remove();
			element.find("a").attr("onclick", "return externalLink(this)");
		}
		if(this.compact === true){
			setSanitizedHtmlContent(article.find(".informo-article-intro"), description);
			setSanitizedHtmlContent(article.find(".informo-article-content"), content);
		}
		else
			article.find(".informo-article-intro").text(description);//TODO: remove HTML element from description


		//Unread marker
		if(this.compact === true){
			// TODO
		}
		else{
			const isUnread = Math.floor(Math.random() * 2) == 0;//TODO
			article.find(">i").text(isUnread ? "label" : "label_outline");
			if(isUnread === true)
				article.addClass("unread");

		}

		// Article selection on large reader
		if(this.compact === false){
			const articleContent = this.body.find(".reader-article");
			article.bind("click", () => {
				articleContent.find("h3").text(title);
				setSanitizedHtmlContent(articleContent.find("p"), content);
				return false;
			});
		}

		this.body.find(".article-list").append(article);
	}
}



