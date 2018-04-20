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

class Sources {
	constructor(){
		this.sources = {};
	}

	setSources(sources){
		for (let source of sources) {
			this.sources[source.className] = {
				publishers: source.publishers,
				name: source.name,
				publicKey: source.publicKey,
				unread: 0,//TODO
			};
		}
	}

	setSourceUnreadCount(sourceClassName, count){
		this.sources[sourceClassName].unread = count;
	}

	hasSources(){
		return Object.keys(this.sources).length > 0;
	}

	canPublish(publisher, className){
		let cp = false;

		for (let p of this.sources[className].publishers) {
			if (p === publisher) {
				cp = true;
				break;
			}
		}

		return cp;
	}
}

export default (new Sources);
