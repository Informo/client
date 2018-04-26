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
					<nav>
						<div class="nav-wrapper z-depth-1">
							<span class="brand-logo flow-text">News</span>
							<ul class="right">
								<li>
									<div class="switch">
										<label>Unread <input type="checkbox"><span class="lever"></span> All</label>
									</div>
								</li>
								<li><a href="#"><i class="material-icons">settings</i></a></li>
							</ul>
						</div>
					</nav>
					<ul class="reader-loaded-content collection scrollpane">

						<div class="article-list"></div>
						<li class="reader-bottom-loader center-align">
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
				</div>

				<div class="reader-pane-article z-depth-1">
					<nav>
						<div class="nav-wrapper z-depth-1">
							<ul>
								<li><a href="#"><i class="material-icons">format_size</i></a></li>
							</ul>
							<a class="brand-logo center" href="#">
								<img src="static/img/logo-round-white-128.png" title="Informo - Making information accessible"/>
							</a>
							<ul class="right">
								<li><a href="#"><i class="material-icons">markunread</i></a></li>
								<li><a href="#"><i class="material-icons">bookmark</i></a></li>
								<li><a href="#"><i class="material-icons">share</i></a></li>
							</ul>
						</div>
					</nav>
					<div class="reader-loaded-content scrollpane">
						<div class="article-title-bar z-depth-1">
							<div class="container">
								<h3 class="informo-article-title flow-text">{{TITLE}}</h3>
								<div class="informo-article-publication">
									<span class="informo-article-author">{{AUTHOR}}</span>
									<span class="informo-article-source">{{SOURCE}}</span>
									-
									<span class="informo-article-date">{{DATE}}</span>
								</div>

								<div class="informo-article-details">
									<a class="informo-article-anchor" href="{{LINK}}"><i class="material-icons">link</i> Informo article link</a>
									<a class="informo-article-source" href="{{LINK}}" onclick="return externalLink(this)"><i class="material-icons">open_in_new</i> Original article</a>
								</div>
							</div>
						</div>
						<div class="informo-article-container container">
							<p class="informo-article-intro">
								{{DESCRIPTION}}
							</p>
							<p class="informo-article-content">
							<div class="end-spacer"></div>
						</div>
					</div>
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
					<a class="previous-article btn-floating waves-effect waves-light left disabled" href="#"><i class="material-icons">navigate_before</i></a>
					<a class="next-article btn-floating waves-effect waves-light right disabled" href="#"><i class="material-icons">navigate_next</i></a>
				</div>
			</div>
		`),
		article: $(`
			<a class="informo-article collection-item informo-article-anchor" href="#">
				<i class="material-icons">label_outline</i>
				<span class="informo-article-title title flow-text"></span>
				<div class="informo-article-intro truncate"></div>
				<div>
					<span class="informo-article-author"></span>
					<span class="informo-article-source"></span>
					<span class="right informo-article-date"></span>
				</div>
			</a>
		`),
	},
	{
		// Compact view
		body: $(`
			<div class="reader-fragment compact">
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
					<div class="article-header-text">
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
					<div class="article-header-image hide-on-small-only valign-wrapper">
						<img class="informo-article-image"/>
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

			this.body.find(".previous-article").bind("click", () => {
				if(this.currentArticleIndex !== null){
					this._selectArticle(this.currentArticleIndex - 1);
				}
				return false;
			});
			this.body.find(".next-article").bind("click", () => {
				if(this.currentArticleIndex !== null){
					this._selectArticle(this.currentArticleIndex + 1);
				}
				return false;
			});
		}
	}
	/// Remove all feeds
	reset(){
		this.articleList = [];

		this.loaded = false;
		this.isLoadingBottom = false;
		this.noMorePosts = false;
		this.sourceClassNames = null;
		this.showUnreadOnly = false;

		// Only used for large view
		this.currentArticleIndex = null;
		this.currentArticleNode = null;

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
				const scrollPane = this.compact === true ? $(window) : this.body.find(".reader-pane-list .scrollpane");
				if(this.scrollListener !== null){
					scrollPane.unbind("scroll.readerBottomLoad"+this.id.toString);
				}
				scrollPane.bind("scroll.readerBottomLoad"+this.id.toString, () => {
					const loader = this.body.find(".reader-bottom-loader");
					if(loader.is(":hidden") === true)
						return;

					let loadBottom = false;
					if(this.loaded === true && this.isLoadingBottom === false){
						if(this.compact === true){
							let loaderPos = loader.position().top;
							loadBottom = window.scrollY + window.innerHeight >= loaderPos
						}
						else{
							let loaderPos = loader.position().top - scrollPane.position().top;
							loadBottom = scrollPane.innerHeight() >= loaderPos;
						}
					}

					if(loadBottom === true){
						if(this.noMorePosts === true){
							// hide loader
							loader.hide();
						}
						else{
							this.isLoadingBottom = true;
							this._appendFeedArticles(false)
								.then(() => this.isLoadingBottom = false);
						}
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
				for(let articleMxEvent of news) {
					//TODO: handle unread
					if (informoSources.canPublish(articleMxEvent.sender, articleMxEvent.type)) {
						let content = articleMxEvent.content;

						this.articleList.push({
							id: articleMxEvent.event_id,
							title: content.headline,
							description: content.description,
							author: content.author,
							image: content.thumbnail,
							sourceName: informoSources.sources[articleMxEvent.type].name,
							date: content.date,
							content: content.content,
							externalLink: content.link,

							unread: Math.floor(Math.random() * 2) == 0,
						});
					}
				}

				for(let [i, article] of this.articleList.entries()){
					this._appendArticle(article, i);
				}

				// Select first article
				if(this.compact === false){
					if(this.currentArticleIndex === null)
						this._selectArticle(0);
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
	_appendArticle(article, articleIndex){
		let articleDOM = template[this.compact === true ? 1 : 0].article.clone();

		articleDOM.attr("data-article-index", articleIndex);

		// Set article content in the list
		this._setArticleDOMContent(article, articleDOM);

		// Set separated pane article content on large reader
		if(this.compact === false){
			const articlePane = this.body.find(".reader-pane-article");

			// Setup article display on selection
			const reader = this;
			articleDOM.bind("click", () => {
				reader._selectArticle(articleIndex);
				return false;
			});
		}

		this.body.find(".article-list").append(articleDOM);
	}

	// Triggered by clicking on an article on the large reader
	_selectArticle(articleIndex){
		console.assert(this.compact === false, "_selectArticle called on non compact reader");

		if(articleIndex >= this.articleList.length || articleIndex < 0)
			return;

		if(this.currentArticleIndex !== null){
			// TODO: mark this.currentArticleEventID as read if !== null
			this.currentArticleNode.removeClass("active");
		}

		this.currentArticleIndex = articleIndex;
		this.currentArticleNode = this.body.find(".article-list > [data-article-index="+articleIndex+"]");

		this.currentArticleNode.addClass("active");
		this._setArticleDOMContent(
			this.articleList[articleIndex],
			this.body.find(".reader-pane-article"));

		// Previous / next buttons disabling
		this.body.find(".previous-article").toggleClass("disabled", this.currentArticleIndex <= 0);
		this.body.find(".next-article").toggleClass("disabled", this.currentArticleIndex >= this.articleList.length - 1);
	}


	_setArticleDOMContent(articleData, targetDOM){
		function getTimeAgoString(dateDiff){
			const seconds = dateDiff / 1000;
			var interval = Math.floor(seconds / 31536000);
			if (interval > 1)
				return interval + " years";
			interval = Math.floor(seconds / 2592000);
			if (interval > 1)
				return interval + " months";
			interval = Math.floor(seconds / 86400);
			if (interval > 1)
				return interval + " days";
			interval = Math.floor(seconds / 3600);
			if (interval > 1)
				return interval + " hours";
			interval = Math.floor(seconds / 60);
			if (interval > 1)
				return interval + " minutes";
			return Math.floor(seconds) + " seconds";
		}
		function setSanitizedHtmlContent(element, content){
			element.html(content);
			element.find("script").remove();
			element.find("a").attr("onclick", "return externalLink(this)");
		}

		// Title
		targetDOM.find(".informo-article-title").text(articleData.title);
		// Image
		if(articleData.image && articleData.image !== null)
			targetDOM.addClass("with-img");
		targetDOM.find(".informo-article-image img, img.informo-article-image")
			.attr("src", articleData.image);
		// Author
		if (articleData.author) {
			targetDOM.find(".informo-article-author").text(articleData.author);
		} else {
			targetDOM.find(".informo-article-author").remove();
		}
		// Source
		targetDOM.find("a.informo-article-source").attr("href", articleData.externalLink);
		targetDOM.find(":not(a).informo-article-source").text(articleData.sourceName);
		// Date
		const date = new Date(articleData.date * 1000);
		const dateDiff = new Date() - date;
		targetDOM.find(".informo-article-date").text(getTimeAgoString(dateDiff) + " ago");

		// Link to this article on informo
		targetDOM.find("a.informo-article-anchor").attr("href", "#"); //TODO

		//Unread marker
		if(this.compact === true){
			// TODO
		}
		else{
			targetDOM.find(">i").text(articleData.unread ? "label" : "label_outline");
			if(articleData.unread === true)
				targetDOM.addClass("unread");
		}

		// Article content
		setSanitizedHtmlContent(targetDOM.find(".informo-article-intro"), articleData.description);
		setSanitizedHtmlContent(targetDOM.find(".informo-article-content"), articleData.content);
	}
}



