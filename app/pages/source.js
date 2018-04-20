// Source information and associated feeds

import Router from "../router";
import Sources from "../sources";
import * as matrix from "../matrix";
import {eventPrefix} from "../const";
import $ from "jquery";

export function init(){

	$("#page-source .content-loader").show();
	$("#page-source .content-loader .loader-text").text("Waiting connection to Informo...");

	matrix.getConnectedMatrixClient()
		.then(() => {
			const sourceClassName = eventPrefix + Router.getPathParamValue("sourceName");
			const source = Sources.sources[sourceClassName];

			if(!source){
				$("#page-source .name").text("Unknown source");
				$("#page-source .description").text("This source does not exist");
				$("#page-source .content-loader").hide();
				return;
			}

			$("#page-source .name").text(source.name);
			$("#page-source .description").text("This source use the following public key: " + source.publicKey);

			// TODO: fetch news from this source

			$("#page-source .content-loader").hide();
		});


}