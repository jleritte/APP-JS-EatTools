var places = require('datastore'),
	Selector = require('vote-toggle');


module.exports.getGUID = getGUID;
module.exports.NameTag = NameTag;
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

function NameTag(id,name) {
	var nTag = document.createElement('span'),
		text = document.createElement('span'),
		remove = document.createElement('div');

	text.innerHTML = name;
	remove.innerHTML = '&nbsp;X&nbsp;';
	remove.className = 'remove_user';
	remove.addEventListener('click', removeUser);
	nTag.id = id + 'Name';
	nTag.appendChild(text);
	nTag.appendChild(remove);
	nTag.addEventListener('dblclick', changeName);
	return nTag;
}

function changeName() {
	var who = this.id.replace('Name',''),
		input,
		p = this.firstChild,
		that = this,
		names = places.get('names'),
		method = function(){
			names[who] = this.value;
			p.innerHTML = this.value;
			that.replaceChild(p,this);
			places.set('names',names);
		  	// localStorage.places = JSON.stringify(places);
		};

	input = Input({value: names[who], event:{type: 'blur', method: method}});
	this.replaceChild(input,p);
	input.select();
}

function removeUser() {
	var name = this.parentNode.firstChild.innerHTML,
		guid = this.parentNode.id.replace('Name','');
	if(confirm('Are you sure you want to remove ' + name)){
		userCount--;
		var keys = Object.keys(places.locals);
		keys.forEach(function(elem){
			var place = places.locals[elem],
				contain = document.getElementById(elem),
				total = contain.children[contain.childElementCount - 1];
			delete place.users[guid];
			delete places.names[guid];
			contain.removeChild(document.getElementById(guid));
			paint(contain);
		});
		places.set('size',userCount);
		getNames();
		// localStorage.places = JSON.stringify(places);
	}
}

function callback(results, status) {
	if (status === google.maps.places.PlacesServiceStatus.OK) {
		var names = places.get('names'),
		userGuid = Object.keys(names)[0] || getGUID(),
		locals = places.get('locals');

		places.set('address',document.getElementsByClassName('address')[0].value);
		places.set('radius',+document.querySelector('.radius').value);
		places.set('meal',getGUID());
		for (var i = 0; i < results.length; i++){
			locals[results[i].name] = {name:results[i].name, users:{}};
			locals[results[i].name].users[userGuid] = null;
			names[userGuid] = names[userGuid] || 'User 1';
			if(i === results.length - 1){
				size = Object.keys(locals[results[i].name].users).length;
			}
		}
		places.set('names',names);
		places.set('locals', locals);
		places.set('size',size);
		getNames();
		fillList();
	}
}

