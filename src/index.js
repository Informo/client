import * as sdk from 'matrix-js-sdk'


const roomAlias = '#informo:matrix.org';


var client;
var room;
var informoSources;//[]

var timeline;

var selectedFilter;

sdk.createClient({ baseUrl: 'https://matrix.org' })
.registerGuest()
.then((data) => {
	console.log("Guest data", data);
	return sdk.createClient({
		baseUrl: 'https://matrix.org',
		accessToken: data.access_token,
		userId: data.user_id,
		deviceId: data.device_id,
	});
})
.then((c) => {
	client = c;
	console.log("client", client);
	return client.getRoomIdForAlias(roomAlias);
})
.then((data) => {
	room = new sdk.Room(data.room_id);
	console.log("room", room);

	client.peekInRoom(room.roomId)
	.then((data) => {
		console.log("peekInRoom callback", data);
		timeline = data.timeline;

		onFilterChange(document.getElementById("filter-select"));// yolo
	});

	return client.roomState(room.roomId);
})
.then((state) => {
	console.log("state", state);

	for(let stateEv of state){
		if(stateEv.type === "network.informo.sources"){
			informoSources = stateEv.content.sources;
		}
	}

	if(!informoSources){
		console.err("Cound not find informo source list");
	}
})
.then(() => {
	var select = document.getElementById("filter-select");
	for(let source of informoSources){

		var opt = document.createElement("option");

		opt.setAttribute("value", source.className);
		opt.appendChild(document.createTextNode(source.name));

		select.appendChild(opt);
	}
})







global.onFilterChange = function(elmt){
	if(!client)
		return;

	selectedFilter = elmt[elmt.selectedIndex].getAttribute("value");

	if(timeline){
		var content = document.getElementById("content");
		content.innerHTML = "";


		for(let ev of timeline){
			if(ev.event.type === selectedFilter){
				content.appendChild(document.createElement("hr"));

				var h = document.createElement("h2");
				h.appendChild(document.createTextNode(ev.event.content.headline));
				content.appendChild(h);

				var p = document.createElement("p");
				p.appendChild(document.createTextNode(ev.event.content.content));
				content.appendChild(p);
			}
		}
	}


}