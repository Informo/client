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
		function defVal(val, def = null){
			return (typeof val === "undefined") ? def : val;
		}

		this.id = defVal(id);
		this.title = defVal(title);
		this.description = defVal(description);
		this.author = defVal(author);
		this.image = defVal(image);
		this.sourceName = defVal(sourceName);
		this.date = defVal(date);
		this.content = defVal(content);
		this.externalLink = defVal(externalLink);
		this.allowed = defVal(allowed);//TODO: never set, unused

		this.unread = null;
		this.signature = null;
		this.verified = false;
	}

	setRead(read = true){
		this._isRead = read;
		database.setArticleRead(this.id, read);
	}

}