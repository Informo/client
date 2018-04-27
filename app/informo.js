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


import informoSources from "./sources"

export class Article {

	constructor(id, title, description, author, image, sourceName, date, content, externalLink, unread = false, allowed = true){
		this.id = id;
		this.title = title;
		this.description = description;
		this.author = author;
		this.image = image;
		this.sourceName = sourceName;
		this.date = date;
		this.content = content;
		this.externalLink = externalLink;
		this.unread = unread;
		this.allowed = allowed;
	}

	static fromEvent(eventData){
		return new Article(
			eventData.event_id,
			eventData.content.headline,
			eventData.content.description,
			eventData.content.author,
			eventData.content.thumbnail,
			informoSources.sources[eventData.type].name,
			eventData.content.date,
			eventData.content.content,
			eventData.content.link,

			Math.floor(Math.random() * 2) == 0,//TODO: handle unread status
			informoSources.canPublish(eventData.sender, eventData.type)
		);
	}

	setRead(read = true){
		this.unread = read !== true;
		//TODO: store in DB
	}
}