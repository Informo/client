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
import * as matrix from "../../matrix";
import {newsEventPrefix} from "../../const";

import {ArticleReader} from "./article-reader";



const template = [
	{
		// Paned / large view
		body: $(`
			<div class="feed-reader-fragment">
				<div class="reader-pane-list">
					<nav>
						<div class="nav-wrapper z-depth-1">
							<span class="brand-logo flow-text">News</span>
							<ul class="right">
								<li>
									<div class="switch">
										<label>All <input class="filter-unread-checkbox" type="checkbox"><span class="lever"></span> Unread</label>
									</div>
								</li>
								<li><a href="#"><i class="material-icons">settings</i></a></li>
							</ul>
						</div>
					</nav>
					<div class="feed-reader-loader center-align">
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
						<div class="text flow-text"></div>
					</div>
					<ul class="feed-reader-loaded-content collection scrollpane">

						<div class="feed-reader-article-list"></div>
						<li class="feed-reader-bottom-loader center-align">
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

				<div class="reader-pane-article z-depth-1"></div>
			</div>
		`),
		article: $(`
			<a class="informo-article collection-item informo-article-anchor" href="#">
				<i class="material-icons">label_outline</i>
				<span class="informo-article-title title flow-text"></span>
				<div class="informo-article-intro truncate"></div>
				<div>
					<span class="informo-article-author"></span><br class="if-has-author"/>
					<span class="informo-article-source"></span>
					<span class="right informo-article-date"></span>
				</div>
			</a>
		`),
	},
	{
		// Compact view
		body: $(`
			<div class="feed-reader-fragment compact">
				<div class="feed-reader-loader center-align">
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
					<div class="text flow-text"></div>
				</div>

				<ul class="feed-reader-article-list feed-reader-loaded-content collapsible popout" data-collapsible="accordion"></ul>

				<div class="feed-reader-bottom-loader feed-reader-loaded-content center-align">
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

export class FeedReader {
	/// container: where necessary HTML will be injected
	/// compact: false for a dual-pane reader, true for an expandable list
	constructor(container, compact){
		console.assert(container instanceof $);
		console.assert(typeof compact === "boolean");

		this.compact = compact;

		this.id = readerId++;
		this.scrollListener = null;
		this.articleReader = null;
		this.filterUnreadOnly = true;

		// Copy body
		this.body = template[this.compact === true ? 1 : 0].body.clone();

		// Reset component (will change this.body)
		this.reset();

		// Populate body
		container.append(this.body);


		if(this.compact === true){
			this.body.find(".feed-reader-article-list").collapsible();
		}
		else{

			// Filter unread setup
			this.filterUnreadOnly = window.localStorage.getItem("prefs.feed-reader.filterunread");
			if(this.filterUnreadOnly !== null)
				this.filterUnreadOnly = JSON.parse(this.filterUnreadOnly);
			this.body.find(".filter-unread-checkbox").prop("checked", this.filterUnreadOnly);



			this.articleReader = new ArticleReader(this.body.find(".reader-pane-article"), true, false);

			// TODO: handle unbind
			const body = this.body;
			$(window).bind("resize", function(){
				body.height($(window).height() - body.position().top);
			});
			this.body.height($(window).height() - this.body.position().top);

			this.articleReader.previousButton.bind("click", () => {
				if(this.activeArticleIndex !== null){
					this._selectArticle(this.activeArticleIndex - 1);
					//TODO: scroll to show selected article
				}
				return false;
			});
			this.articleReader.nextButton.bind("click", () => {
				if(this.activeArticleIndex !== null){
					this._selectArticle(this.activeArticleIndex + 1);
					//TODO: scroll to show selected article
				}
				return false;
			});

			// Callback when the article is changed from the reader
			this.articleReader.onArticleChange = (article) => {
				this._setReadVisualMarker(this.activeArticleNode, article.unread === false);
			};

			// Filter unread switch callback
			this.body.find(".filter-unread-checkbox").bind("change", (ev) => {
				this.filterUnreadOnly = ev.currentTarget.checked;
				window.localStorage.setItem("prefs.feed-reader.filterunread", JSON.stringify(this.filterUnreadOnly));

				const sourceClassNames = this.sourceClassNames;
				this.reset();
				this.setFeed(sourceClassNames);
			});
		}
	}
	/// Remove all feeds
	reset(){
		// Show loader & hide content
		this.body.find(".feed-reader-loader").show();
		this.body.find(".feed-reader-loaded-content").hide();
		if(this.articleReader !== null)
			this.articleReader.setContent(null);

		this.articleList = [];

		this.loaded = false;
		this.isLoadingBottom = false;
		this.noMorePosts = false;
		this.sourceClassNames = null;

		// Only used for large view
		this.activeArticleIndex = null;
		this.activeArticleNode = null;

		// Empty article list
		this.body.find(".feed-reader-article-list .informo-article").remove();
	}

	/// Call this when the reader is hidden
	deactivate(){
		// TODO: most of the time this is not called. See if it needs a activate() method too
		if(this.scrollListener !== null){
			$(window).unbind("scroll.readerBottomLoad");
		}
	}

	/// Same as setFeed but with source names (mysource) instead of full source class names (network.informo.news.mysource)
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
				this.body.find(".feed-reader-loader").hide();
				this.body.find(".feed-reader-loaded-content").show();


				// Bind bottom scroll
				this.scrollPane = this.compact === true ? $(window) : this.body.find(".reader-pane-list .scrollpane");
				if(this.scrollListener !== null){
					this.scrollPane.unbind("scroll.readerBottomLoad"+this.id.toString);
				}
				this.scrollPane.bind("scroll.readerBottomLoad"+this.id.toString, () => {
					this._loadMoreArticlesIfNeeded();
				});

				// This will trigger loading of more articles if the bottom loader is already on screen
				this._loadMoreArticlesIfNeeded();
			});
	}

	// Load more articles if bottom loader is visible on screen
	// Used mainly when scrolling
	_loadMoreArticlesIfNeeded(){
		const loader = this.body.find(".feed-reader-bottom-loader");
		if(loader.is(":hidden") === true)
			return;

		let loadBottom = false;
		if(this.loaded === true && this.isLoadingBottom === false){
			if(this.compact === true){
				// Scrollpane is the entire window
				let loaderPos = loader.position().top;
				loadBottom = window.scrollY + window.innerHeight >= loaderPos;
			}
			else{
				// Scrollpane is .reader-pane-list .scrollpane
				let loaderPos = loader.position().top - this.scrollPane.position().top;
				loadBottom = this.scrollPane.innerHeight() >= loaderPos;
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
					.then(() => {
						this.isLoadingBottom = false;
						// Calling this function again will allow to add articles until
						// either noMorePosts === true or the bottom loader becomes invisible
						this._loadMoreArticlesIfNeeded();
					});
			}
		}
	}

	// Fetch and append articles to the list
	_appendFeedArticles(resetPos, reportProgress = false) {
		const loaderText = this.body.find(".feed-reader-loader .text");
		if(reportProgress === true)
			loaderText.text("Waiting connection to Informo...");

		return matrix.getConnectedMatrixClient()
			.then(() => {
				if(reportProgress === true)
					loaderText.text("Fetching news...");

				return matrix.getNews(this.sourceClassNames, resetPos);
			})
			.then((news) => {
				if (!(news && news.length)) {
					this.noMorePosts = true;
					this.body.find(".feed-reader-bottom-loader").hide();
					return;
				}

				// Remove non allowed content
				news = news.filter((a) => a.allowed === true);

				// If filtered
				if(this.filterUnreadOnly === true){
					news = news.filter((a) => a.unread === true);
				}

				// Sort by date
				news = news.sort((a, b) => b.date - a.date);

				const offset = this.articleList.length;
				for(let [i, article] of news.entries()){
					this.articleList.push(article);
					this._appendArticleDOM(article, offset + i);
				}

				if(this.compact === false){
					// Select first article
					if(this.activeArticleIndex === null)
						this._selectArticle(0);
				}

				this.loaded = true;
				this.body.find(".feed-reader-bottom-loader").show();
			});
	}

	// Append an article to the DOM (only visual)
	_appendArticleDOM(article, articleIndex){
		let articleDOM = template[this.compact === true ? 1 : 0].article.clone();

		articleDOM.attr("data-article-index", articleIndex);

		// Set article content in the list
		this._setArticleDOMContent(article, articleDOM);

		// Set separated pane article content on large reader
		if(this.compact === false){
			// Setup article display on selection
			const reader = this;
			articleDOM.bind("click", () => {
				reader._selectArticle(articleIndex);
				return false;
			});
		}
		this.body.find(".feed-reader-article-list").append(articleDOM);
	}


	_setArticleDOMContent(article, targetDOM){
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
		targetDOM.find(".informo-article-title").text(article.title);
		// Image
		if(article.image && article.image !== null)
			targetDOM.addClass("with-img");
		targetDOM.find(".informo-article-image img, img.informo-article-image")
			.attr("src", article.image);
		// Author
		if (article.author) {
			targetDOM.find(".informo-article-author").text(article.author);
		} else {
			targetDOM.find(".informo-article-author").remove();
			targetDOM.find(".if-has-author").remove();
		}
		// Source
		targetDOM.find("a.informo-article-source").attr("href", article.externalLink);
		targetDOM.find(":not(a).informo-article-source").text(article.sourceName);
		// Date
		const date = new Date(article.date * 1000);
		const dateDiff = new Date() - date;
		targetDOM.find(".informo-article-date").text(getTimeAgoString(dateDiff) + " ago");

		// Link to this article on informo
		targetDOM.find("a.informo-article-anchor").attr("href", "#/article/"+encodeURI(article.id));

		// Unread marker
		if(this.compact === true){
			// TODO: unread marker
		}
		else{
			targetDOM.attr("href", "#/article/"+encodeURI(article.id));
			this._setReadVisualMarker(targetDOM, article.unread === false);

		}

		// Article content
		setSanitizedHtmlContent(targetDOM.find(".informo-article-intro"), article.description);
		setSanitizedHtmlContent(targetDOM.find(".informo-article-content"), article.content);
	}


	// Triggered by clicking on an article on the large reader
	_selectArticle(articleIndex){
		console.assert(this.compact === false, "_selectArticle called on non compact reader");

		if(articleIndex >= this.articleList.length || articleIndex < 0)
			return;

		// Deactivate previous article
		if(this.activeArticleIndex !== null){
			this.activeArticleNode.removeClass("active");
		}

		// Set new current article
		this.activeArticleIndex = articleIndex;
		this.activeArticleNode = this.body.find(".feed-reader-article-list > [data-article-index="+articleIndex+"]");

		// Update read status
		this.articleList[this.activeArticleIndex].setRead(true);
		this.activeArticleNode.removeClass("unread");
		this.activeArticleNode.find(">i").text("label_outline");

		// Mark article active in list
		this.activeArticleNode.addClass("active");
		this.articleReader.setContent(this.articleList[articleIndex]);

		// Previous / next buttons disabling
		this.articleReader.setPrevNextEnabled(
			this.activeArticleIndex > 0,
			this.activeArticleIndex < this.articleList.length - 1);
	}

	// Set the read/unread visual status in the article DOM
	_setReadVisualMarker(articleDOM, isRead){
		articleDOM.find(">i").text(isRead ? "label_outline" : "label");
		articleDOM.toggleClass("unread", isRead === false);
	}
}



