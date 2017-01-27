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
			userCount = appModel.get('size') || 1,
			userKeys = Object.keys(names);

		results.forEach(function(result) {
			var name = result.name,
				id = result.place_id;
			locals[id] = {name:name, users:{}};
			userKeys.forEach(function(user) {
				locals[id].users[user] = "null";
			});
		});
		appModel.set('locals', locals);
		appModel.set('address',document.getElementsByClassName('address')[0].value);
		appModel.set('radius',+document.querySelector('.radius').value);
		appModel.set('size',userCount);
		if (page.hasNextPage) {
			page.nextPage();
		} else {
			document.querySelector('name-contain').render();
			document.querySelector('vote-contain').render();
			document.querySelector('.sortList').click();
			appModel.database.ref('meals/'+appModel.meal).set(appModel.get(''));
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