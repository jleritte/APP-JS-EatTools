var appModel = require('datastore');

module.exports.getGUID = getGUID;
module.exports.callback = callback;
module.exports.parseHash = parseHash;

function getGUID() {
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random()*16)%16 | 0;
		d = Math.floor(d/16);
		return (c==='x' ? r : (r&0x3|0x8)).toString(16);
	});
	return uuid;
}

function callback(results, status, page) {
	if (status === google.maps.places.PlacesServiceStatus.OK) {
		var names = appModel.get('names'),
			locals = appModel.get('locals'),
			userKeys = Object.keys(names);

		results.forEach(function(result) {
			var name = result.name,
				id = result.place_id;
			locals[id] = {name:name, users:{}};
			userKeys.forEach(function(user) {
				locals[id].users[user] = "null";
			});
		});
		Object.assign(appModel.temp, locals);
		if (page.hasNextPage) {
			page.nextPage();
		} else {
			appModel.set('locals', locals);
		}
	}
}

function parseHash() {
	var hash = window.location.hash.replace('#','');

	if (hash.length > 0) {
		hash = hash.split(';');
		hash.forEach(function(elem) {
			elem = elem.split('=');
			appModel[elem[0]] = elem[1];
		});
	}
}