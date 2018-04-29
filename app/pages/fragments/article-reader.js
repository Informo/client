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


// Reader fragment to read a single article

import $ from "jquery";
import * as matrix from "../../matrix";

const template = $(`
	<div class="article-reader-fragment">
		<div class="navbar">
			<nav>
				<div class="nav-wrapper">
					<ul>
						<li><a href="#"><i class="material-icons">format_size</i></a></li>
					</ul>
					<a class="brand-logo center" href="#">
						<img src="static/img/logo-round-white-128.png" title="Informo - Making information accessible"/>
					</a>
					<ul class="right">
						<li><a class="markunread-button" href="#"><i class="material-icons">markunread</i></a></li>
						<li><a class="bookmark-button" href="#"><i class="material-icons">bookmark</i></a></li>
						<li>
							<a class="share-button" href="#"><i class="material-icons">share</i></a>
							<ul class="share-button-dropdown dropdown-content">
								<li class="link-single-article line-link">
									<span>Single article</span>
									<input value="">
									<a class="copy-button btn-floating waves-effect waves-light"><i class="material-icons">content_copy</i></a>
								</li>
								<li class="link-feed line-link">
									<span>Article in feed</span>
									<input value="">
									<a class="copy-button btn-floating waves-effect waves-light"><i class="material-icons">content_copy</i></a>
								</li>
								<li class="link-informo-path line-link">
									<span>Informo path</span>
									<input value="">
									<a class="copy-button btn-floating waves-effect waves-light"><i class="material-icons">content_copy</i></a>
								</li>
							</ul>
						</li>
					</ul>
				</div>
			</nav>
		</div>
		<div class="article-reader-loaded scrollpane">
			<div class="article-title-bar z-depth-1 grey lighten-3">
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
		<div class="article-reader-loader center-align">
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
		<a class="previous-article btn-floating waves-effect waves-light left disabled" href="#"><i class="material-icons">navigate_before</i></a>
		<a class="next-article btn-floating waves-effect waves-light right disabled" href="#"><i class="material-icons">navigate_next</i></a>
	</div>`);


let uid = 0;

export class ArticleReader {

	/// container: JQuery object where HTML will be injected
	///
	constructor(container, showPrevNextButtons, showLoader = true, fixedTopBar = false) {
		this.body = template.clone();
		this.currentArticle = null;
		this.onArticleChange = null;

		// Previous / Next buttons
		this.previousButton = this.body.find(".previous-article");
		this.nextButton = this.body.find(".next-article");

		if(showPrevNextButtons === false){
			this.previousButton.hide();
			this.nextButton.hide();
		}


		// Hide article empty content
		this.showLoader = showLoader;
		this.body.find(".article-reader-loaded").hide();
		this.body.find(".article-reader-loader").toggle(this.showLoader);

		// Fixed toolbar setup
		if(fixedTopBar === true)
			this.body.find(".navbar").addClass("navbar-fixed");
		else
			this.body.find(".navbar .nav-wrapper").addClass("z-depth-1");

		// Share button
		this.body.find(".share-button-dropdown").attr("id", "reader-share-dropdown-"+uid);
		this.body.find(".share-button").attr("data-activates", "reader-share-dropdown-"+uid);
		uid++;

		this._setControls(false);

		container.append(this.body);


		// Mark unread button
		this.body.find(".markunread-button").bind("click", (ev) => {
			if($(ev.currentTarget).hasClass("disabled") === false && this.currentArticle !== null){
				// TODO: markunread-button should behave like a switch
				this.currentArticle.setRead(false);
				if(this.onArticleChange !== null)
					this.onArticleChange(this.currentArticle);
			}
			return false;
		});


		// Share buttons
		this.body.find(".share-button").bind("click", (ev) => {
			if($(ev.currentTarget).hasClass("disabled") && this.currentArticle !== null){
				// Ugly hack: if button is active it the dropdown will try to close
				// itself instead of opening.
				// Closing while already closed does not appear to have side effects
				$(ev.currentTarget).addClass("active");
			}
		});
		this.body.find(".share-button").dropdown({
			inDuration: 300,
			outDuration: 225,
			constrainWidth: false,
			hover: false,
			gutter: 0,
			belowOrigin: false,
			alignment: "right",
			stopPropagation: true,
		});

		this.body.find(".share-button-dropdown .copy-button").bind("click", (ev) => {
			const field = $(ev.currentTarget.parentNode).find("input");
			field.focus();
			field.select();
			document.execCommand("copy");
		});
	}

	_setControls(enabled){
		this.body.find(".markunread-button").toggleClass("disabled", enabled === false);
		this.body.find(".bookmark-button").toggleClass("disabled", enabled === false);
		this.body.find(".share-button").toggleClass("disabled", enabled === false);
	}


	/// Fills the reader with the given Article object
	setContent(article){
		this.currentArticle = article;

		if(article === null){
			this.body.find(".article-reader-loader").toggle(this.showLoader);
			this.body.find(".article-reader-loaded").hide();
			return;
		}

		this.body.find(".article-reader-loader").hide();
		this.body.find(".article-reader-loaded").show();


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
		this.body.find(".informo-article-title").text(article.title);
		// Image
		if(article.image && article.image !== null)
			this.body.addClass("with-img");
		this.body.find(".informo-article-image img, img.informo-article-image")
			.attr("src", article.image);
		// Author
		if (article.author) {
			this.body.find(".informo-article-author").text(article.author);
		} else {
			this.body.find(".informo-article-author").remove();
		}
		// Source
		this.body.find("a.informo-article-source").attr("href", article.externalLink);
		this.body.find(":not(a).informo-article-source").text(article.sourceName);
		// Date
		const date = new Date(article.date * 1000);
		const dateDiff = new Date() - date;
		this.body.find(".informo-article-date").text(getTimeAgoString(dateDiff) + " ago");

		// Link to this article on informo
		this.body.find("a.informo-article-anchor").attr("href", "#/article/"+encodeURI(article.id));

		//Unread marker
		// TODO ?

		this.body.find(".article-title-bar").toggleClass("orange", article.allowed === false);
		this.body.find(".article-title-bar").toggleClass("grey", article.allowed === true);

		// Article content
		setSanitizedHtmlContent(this.body.find(".informo-article-intro"), article.description);
		setSanitizedHtmlContent(this.body.find(".informo-article-content"), article.content);



		// Share button
		const singleArticle = this.body.find(".link-single-article");
		const singleArticleUrl = singleArticle.find("input");
		singleArticleUrl.attr("value", window.location.origin + "#/article/" + encodeURI(article.id));

		const feedArticle = this.body.find(".link-feed");
		const feedArticleUrl = feedArticle.find("input");
		feedArticleUrl.attr("value", "TODO");

		const informoArticle = this.body.find(".link-informo-path");
		const informoArticleUrl = informoArticle.find("input");
		informoArticleUrl.attr("value", "#/article/" + encodeURI(article.id));


		// Enable controls
		this._setControls(true);
	}

	/// Fills the content of the reader by fetching a specific article on Informo
	fetchContent(eventID){
		this.body.find(".article-reader-loaded").hide();
		this.body.find(".article-reader-loader").show();

		const loaderText = this.body.find(".article-reader-loader .text");
		loaderText.text("Waiting connection to Informo...");

		matrix.getConnectedMatrixClient()
			.then(() => {
				loaderText.text("Fetching article...");
				return matrix.getSingleArticle(eventID);
			})
			.then((article) => {
				this.setContent(article);
			});
	}

	/// Set to true to enable/disable previous and next buttons
	/// If null, the button will keep its current state
	setPrevNextEnabled(previousEnabled, nextEnabled){
		if(previousEnabled !== null)
			this.previousButton.toggleClass("disabled", previousEnabled === false);
		if(nextEnabled !== null)
			this.nextButton.toggleClass("disabled", nextEnabled === false);
	}
}