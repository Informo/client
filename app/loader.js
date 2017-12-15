export class Loader {
	constructor(){
		this.message = "";
		this.percentage = 0;
		this.active = true;
	}

	update(percentage, message){
		if (this.active) {
			this.percentage = percentage;
			this.message = message;

			this.refreshLoadingProgress();
		}
	}

	refreshLoadingProgress(reset = false){
		console.log(this.message);
		console.log(this.percentage);
		if(this.percentage == 100) {
			$("#loader").css("display", "none");
			$("#main-content").css("display", "block");
			this.active = false;
		}

		if(reset) {
			$("#loader").css("display", "block");
			$("#main-content").css("display", "none");
		}

		if(this.message) {
			$("#loader-text").text(this.message);
		}

		$("#loader-progress-bar").css("width", this.percentage + "%");
	}

	reset(){
		this.message = "";
		this.percentage = 0;
		this.active = true;

		this.refreshLoadingProgress(true);
	}
}

export default (new Loader)
