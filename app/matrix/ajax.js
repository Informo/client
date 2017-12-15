export function req(method, homeserverURL, path, accessToken, body = {}) {
	return new Promise((resolve, reject) => {
		if(accessToken) {
			path = path + "?access_token=" + accessToken
		}

		let bodyStr
		if(method === "GET") {
			bodyStr = ""
			if(Object.keys(body).length) {
				if(!accessToken) {
					path += "?"
				}
				for(let key in body) {
					path += "&" + key + "=" + encodeURIComponent(body[key])
				}
			}
		} else {
			bodyStr = JSON.stringify(body)
		}

		resolve($.ajax({
			method: method,
			contentType: "application/json",
			url: homeserverURL + path,
			dataType: "json",
			data: bodyStr,
		})
		.catch(() => {
			throw "Could not connect to the Informo network"
		}));
	});
}
