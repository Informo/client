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



const template = [
	{
		// Paned / large view
		body: $(``),// TODO
		article: $(``),// TODO
	},
	{
		// Compact view
		body: $(`
			<div>
				<div class="request-loader center-align">
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
					<div class="request-loader-text flow-text"></div>
				</div>

				<ul class="article-list collapsible popout" data-collapsible="accordion"></ul>

				<div class="bottom-loader center-align">
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

		this.loaded = false;
		this.scrollListener = null;
		this.isLoadingBottom = false;
		this.noMorePosts = false;

		this.body = template[this.compact === true ? 1 : 0].body.clone();
		this.body.find(">:not(.request-loader)").hide();


		container.append(this.body);
		this.body.find(".article-list").collapsible();
	}
	/// Call this before removing the reader. Will unbind scroll event
	destroy(){
		if(this.scrollListener !== null){
			$(window).unbind("scroll.readerBottomLoad");
		}

		this.body.parent().remove(this.body);
	}

	/// Make the reader fetch news from multiple feeds
	/// sourceClassNames: array of SourceClassName
	setFeed(sourceClassNames){
		console.assert(sourceClassNames.constructor === Array);

		this.sourceClassNames = sourceClassNames;

		this._appendFeedArticles(true, true)
			.then(() => {
				this.body.find(">.request-loader").hide();
				this.body.find(">:not(.request-loader)").show();

				// Bind bottom scroll
				if(this.scrollListener !== null){
					$(window).unbind("scroll.readerBottomLoad"+this.id.toString);
				}
				$(window).bind("scroll.readerBottomLoad"+this.id.toString, () => {
					let loaderPos = this.body.find(".bottom-loader").position().top;

					if (this.loaded === true && window.scrollY + window.innerHeight >= loaderPos && this.isLoadingBottom === false && this.noMorePosts === false) {
						this.isLoadingBottom = true;
						this._appendFeedArticles(false)
							.then(() => this.isLoadingBottom = false);
					}
				});
			});
	}

	/// Remove all feeds
	clear(){
		this.body.find(".article-list").empty();
	}


	_appendFeedArticles(resetPos = false, reportProgress = false) {
		if(reportProgress === true)
			this.body.find(".request-loader .request-loader-text").text("Waiting connection to Informo...");

		return matrix.getConnectedMatrixClient()
			.then(() => {
				if(reportProgress === true)
					this.body.find(".request-loader .request-loader-text").text("Fetching news...");

				return matrix.getNews(this.sourceClassNames[0], resetPos);// TODO: display all sourceClassNames
			})
			.then((news) => {
				if (!(news && news.length)) {
					this.noMorePosts = true;
					this.body.find(".bottom-loader").hide();
					return;
				}

				news.sort((a, b) => b.content.date - a.content.date);

				for(let article of news) {
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
				this.body.find(".bottom-loader").show();
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

		this.body.find(".article-list").append(article);
	}
}



