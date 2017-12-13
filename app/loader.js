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

	refreshLoadingProgress(){
		if(this.percentage == 100) {
			$("#loader").css("display", "none");
			$("#main-content").css("display", "block");
			this.active = false;
		}

		if(this.message) {
			$("#loader-text").text(this.message);
		}

		$("#loader-progress-bar").css("width", this.percentage + "%");
	}
}

export default (new Loader)
