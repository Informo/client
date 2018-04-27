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



export class ArticleReader {

	constructor(container, showPrevNextButtons, showLoader = true, fixedTopBar = false) {
		this.body = template.clone();

		// Previous / Next buttons
		this.previousButton = this.body.find(".previous-article");
		this.nextButton = this.body.find(".next-article");

		if(showPrevNextButtons === false){
			this.previousButton.hide();
			this.nextButton.hide();
		}

		// Hide article empty content
		this.body.find(".article-reader-loaded").hide();

		this.body.find(".article-reader-loader").toggle(showLoader);

		if(fixedTopBar === true){
			this.body.find(".navbar").addClass("navbar-fixed");
		}


		container.append(this.body);
	}


	setContent(article){
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
		this.body.find("a.informo-article-anchor").attr("href", "#"); //TODO

		//Unread marker
		if(this.compact === true){
			// TODO
		}
		else{
			this.body.find(">i").text(article.unread ? "label" : "label_outline");
			if(article.unread === true)
				this.body.addClass("unread");
		}

		this.body.find(".article-title-bar").toggleClass("orange", article.allowed === false);
		this.body.find(".article-title-bar").toggleClass("grey", article.allowed === true);

		// Article content
		setSanitizedHtmlContent(this.body.find(".informo-article-intro"), article.description);
		setSanitizedHtmlContent(this.body.find(".informo-article-content"), article.content);
	}

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


	setPrevNextEnabled(previousEnabled, nextEnabled){
		this.previousButton.toggleClass("disabled", previousEnabled === false);
		this.nextButton.toggleClass("disabled", nextEnabled === false);
	}
}