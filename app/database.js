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


class Database {

	constructor(){
		this.connection = null;

		const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

		const dbOpenReq = indexedDB.open("informo");
		dbOpenReq.onupgradeneeded = () => {
			let db = dbOpenReq.result;
			let store = db.createObjectStore("read_articles");
			// store.createIndex("read_articles_idx", "value", {unique: true});
		};
		dbOpenReq.onerror = (event) => {
			console.error("Could not request DB connection:", event);

		};
		dbOpenReq.onsuccess = () => {
			this.database = dbOpenReq.result;
		};

	}

	getArticleRead(articleID){
		return new Promise((resolve, reject) => {
			let transaction = this.database.transaction("read_articles");
			let objectStore = transaction.objectStore("read_articles");

			let req = objectStore.get(articleID);
			req.onsuccess = function(event) {
				resolve(typeof event.target.result !== "undefined" && event.target.result === true);
			};
			req.onerror = function(event) {
				console.error("Request error for ", articleID, ":", event);
				reject();
			};
		});
	}

	setArticleRead(articleID, read){
		let transaction = this.database.transaction("read_articles", "readwrite");
		let objectStore = transaction.objectStore("read_articles");

		let req = objectStore.put(read, articleID);
		req.onerror = function(event) {
			objectStore.add(read, articleID);
		};
	}

}

export default (new Database);