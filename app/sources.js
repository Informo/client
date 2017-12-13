class Sources {
	constructor(){
		this.sources = [];
	}

	setSources(sources){
		this.sources = sources;
	}

	hasSources(){
		return this.sources.length > 0
	}
}

export default (new Sources)
