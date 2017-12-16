class Sources {
	constructor(){
		this.sources = {};
	}

	setSources(sources){
		for (let source of sources) {
			this.sources[source.className] = {
				publishers: source.publishers,
				name: source.name,
				unread: 0,//TODO
			}
		}
	}

	setSourceUnreadCount(sourceClassName, count){
		this.sources[sourceClassName].unread = count;
	}

	hasSources(){
		return Object.keys(this.sources).length > 0
	}

	canPublish(publisher, className){
		let cp = false

		for (let p of this.sources[className].publishers) {
			if (p === publisher) {
				cp = true;
				break;
			}
		}

		return cp;
	}
}

export default (new Sources)
