// Copyright 2017 Informo core team <core@informo.network>
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


import informoSources from "./sources";
import database from "./database";


export class Article {

	constructor(id, title, description, author, image, sourceName, date, content, externalLink, allowed = true){
		this.id = id;
		this.title = title;
		this.description = description;
		this.author = author;
		this.image = image;
		this.sourceName = sourceName;
		this.date = date;
		this.content = content;
		this.externalLink = externalLink;
		this.allowed = allowed;

		this.unread = null;
	}

	/// Returns a promise that resolves into an article
	static fromEvent(eventData){
		return new Promise((resolve, reject) => {
			const article = new Article(
				eventData.event_id,
				eventData.content.headline,
				eventData.content.description,
				eventData.content.author,
				eventData.content.thumbnail,
				informoSources.sources[eventData.type].name,
				eventData.content.date,
				eventData.content.content,
				eventData.content.link,
				informoSources.canPublish(eventData.sender, eventData.type)
			);

			// Get read status
			database.getArticleRead(article.id)
				.then((isRead) => {
					article.unread = isRead === false;
					resolve(article);
				},
				(err) => {
					console.error("Cannot get article", article.id, "read status:", err);
					reject(err);
				});
		});

	}
	setRead(read = true){
		this._isRead = read;
		database.setArticleRead(this.id, read);
	}

}