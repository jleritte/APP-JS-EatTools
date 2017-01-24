var appModel = require('datastore');

module.exports.getGUID = getGUID;
module.exports.callback = callback;

function getGUID() {
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random()*16)%16 | 0;
		d = Math.floor(d/16);
		return (c==='x' ? r : (r&0x3|0x8)).toString(16);
	});
	return uuid;
}

function callback(results, status) {
	if (status === google.maps.places.PlacesServiceStatus.OK) {
		var names = appModel.get('names'),
			locals = appModel.get('locals'),
			userCount = appModel.get('size') || 1,
			userKeys = Object.keys(names);

		if(userKeys.length === 0){
			names[getGUID()] = 'User 1';
			userKeys = Object.keys(names);
		}
		for (var i = 0; i < results.length; i++){
			var name = results[i].name;
			locals[name] = {name:name, users:{}};
			userKeys.forEach(function(user) {
				locals[name].users[user] = null;
			});
		}
		appModel.set('address',document.getElementsByClassName('address')[0].value);
		appModel.set('radius',+document.querySelector('.radius').value);
		appModel.set('meal',getGUID());
		appModel.set('names',names);
		appModel.set('locals', locals);
		appModel.set('size',userCount);
		document.querySelector('name-contain').render();
		document.querySelector('vote-contain').render();
		document.querySelector('.sortList').click();
	}
}

