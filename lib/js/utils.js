var places = require('datastore');


module.exports.getGUID = getGUID;
module.exports.Label = Label;
module.exports.Button = Button;
module.exports.Input = Input;
module.exports.Selector = Selector;
module.exports.Toggle = Toggle;
module.exports.NameTag = NameTag;
module.exports.ListItem = ListItem;
module.exports.ItemTotal = ItemTotal;
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

function Label(inner) {
	var label = document.createElement('label');

	label.innerHTML = inner;
	return label;
}

function Button(value, method) {
	var button = Input({type: 'button',
		value: value,
		event: {type: 'click', method: method}});

	return button;
}

function Input(options) {
	var input = document.createElement('input'),
		keys = Object.keys(options);

	keys.forEach(function(elem) {
		if (elem === 'event') {
			var type = options[elem].type,
				method = options[elem].method;
			input.addEventListener(type, method);
		} else {
			input[elem] = options[elem];
		}
	});
	return input;
}

function Selector(name,x,id,vote) {
	var selector = document.createElement('span'),
		up = Toggle(name,'u',x),
		down = Toggle(name,'d',x);

	selector.className = 'binSelector';
	selector.id = id;
	if(vote === 'u'){
		up.checked = 'checked';
	} else if(vote === 'd'){
		down.checked = 'checked';
	}
	selector.appendChild(up);
	selector.appendChild(down);
	return selector;
}

function Toggle(name,value,x) {
	var toggle = Input({type: 'radio',
		name: name + x,
		value: value,
		event:{type:'click', method: vote}});

	return toggle;
}

function vote() {
	var restName = this.parentNode.parentNode.id,
		contain = this.parentNode.parentNode;

	paint(contain);
	places.locals[restName].users[this.parentNode.id] = this.value;
	// localStorage.places = JSON.stringify(places);
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

function ListItem(place) {
	var contain = document.createElement('div'),
		label = Label(place.name),
		total = ItemTotal(place.users),
		keys = Object.keys(place.users);

	contain.id = place.name;
	contain.className = 'ListItem';
	contain.appendChild(label);
	keys.forEach(function(elem, i){
		var vote = place.users[elem];
		contain.appendChild(Selector(place.name,i+1,elem,vote));
	});
	contain.appendChild(total);
	paint(contain);
	return contain;
}

function ItemTotal(votes) {
	var total = document.createElement('span'),
		x = 0,
		keys = Object.keys(votes);

	keys.forEach(function(elem){
		var vote = votes[elem];
		if(vote === 'u'){
			x++;
		}
	});
	total.className = "total";
	total.innerHTML = x;
	return total;
}

function paint(contain) {
	var	votes = contain.children,
		vCount,
		up = 0,
		down = 0,
		op;

	Array.prototype.forEach.call(votes, function(elem){
		if(elem.className === 'binSelector'){
			var value = getSelectorValue(elem.children);
			if (value === 'u') {
				up++;
			} else if (value === 'd') {
				down++;
			}
		}
	});
	vCount = up + down;
	if(vCount === 0){
		return;
	}
	if ((up - down) < 0) {
		op = down / vCount;
		contain.style.backgroundColor = 'rgba(192, 57, 43, '+op+')';
	} else {
		op = up / vCount;
	  	contain.style.backgroundColor = 'rgba(22, 160, 133, '+op+')';
	}
	contain.className += ' voted';
	contain.lastChild.innerHTML = up;
}

function getSelectorValue(selector) {
	var value,
		keys = Object.keys(selector);

	keys.forEach(function(elem){
		var radio = selector[elem];
		if(radio.checked){
			value = radio.value;
		}
	});
	return value;
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

