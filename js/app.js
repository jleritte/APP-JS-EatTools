var map, infowindow, service, geocoder, places = localStorage.places || {}, userCount, names = {};
initialize();

function initialize() {
	buildMenu();
	geocoder = new google.maps.Geocoder();
	if (typeof places == 'string'){
	  	places = JSON.parse(places);
	}
	if (!places.hasOwnProperty('size')){
		var center;
		navigator.geolocation.getCurrentPosition(function(position) {
		    center = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
			map = new google.maps.Map(document.getElementById('canvas'), {
			  center: center,
			  zoom: 15
			});

			var request = {
				location: center,
				radius: 1000,
				types: ['restaurant']
			};
			infowindow = new google.maps.InfoWindow();
			service = new google.maps.places.PlacesService(map);
		  	service.nearbySearch(request, callback);
		});
	} else {
		userCount = places.size;
		names = places.names;
		getNames();
 		fillList(places.locals);
	}
}

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
  	var userGuid = Object.keys(names)[0] || getGUID();

  	places = {};
  	places.meal = getGUID();
  	places.locals = {};
  	places.names = names;
  	for (var i = 0; i < results.length; i++){
  		places.locals[results[i].name] = {name:results[i].name, users:{}};
		places.locals[results[i].name].users[userGuid] = null;
		places.names[userGuid] = names[userGuid] || 'User 1';
		if(i === results.length - 1){
			places.size = Object.keys(places.locals[results[i].name].users).length;
		}
	}
  	localStorage.places = JSON.stringify(places);
  	getNames();
  	fillList(places.locals);
  }
}

function buildMenu() {
	var addressOptions = {className: 'address'},
		radiusOptions = {className: 'radius',
						 type: 'range',
						 min: 500,
						 max: 5000,
						 step: 100,
						 value: 1000,
						 event:{type: 'change', method: updateLabel}
					};

	menu.appendChild(Button('New Meal', newMeal));
	menu.appendChild(Label('Address: '));
	menu.appendChild(Input(addressOptions));
	menu.appendChild(Label('Radius: 1000'));
	menu.appendChild(Input(radiusOptions));
	menu.appendChild(Button('Get New List', getGrub));
	menu.appendChild(Button('Add New User', addUser));
	menu.appendChild(Button('Sort List', sortList));
}

function updateLabel() {
	var test = this.parentNode.children[3];

	test.innerHTML = 'Radius: ' + this.value;
}

function getGrub() {
	var address = document.getElementsByClassName('address')[0].value,
		radius = document.getElementsByClassName('radius')[0].value;

	geocoder.geocode( { 'address': address}, function(results, status) {
    	if (status == google.maps.GeocoderStatus.OK) {
    		var center = results[0].geometry.location;
			var request = {
				location: center,
				radius: radius,
				types: ['restaurant']
			};
			if(!service){
				map = new google.maps.Map(canvas, {
				  center: center,
				  zoom: 15
				});
				service = new google.maps.places.PlacesService(map);
			}
		  	service.nearbySearch(request, function(results, status) {
				while (vote.firstChild) {
				    vote.removeChild(vote.firstChild);
				}
				load = document.createElement('p');
				load.id = 'loading';
				load.innerHTML = 'Loading....';
				votes.appendChild(load);
		  		callback(results,status);
		  	});
      	} else {
        	alert("Geocode was not successful for the following reason: " + status);
    	}
    });
}

function addUser() {
	var userGuid = Object.keys(names)[userCount] || getGUID(),
		keys = Object.keys(places.locals);
	userCount++;
	keys.forEach(function(elem){
		var place = places.locals[elem],
			contain = document.getElementById(elem),
			total = contain.children[contain.childElementCount - 1];
		place.users[userGuid] = null;
		places.names[userGuid] = names[userGuid] || 'User ' + userCount;
		contain.insertBefore(Selector(elem,userCount,userGuid,null),total);
	});
	places.size = userCount;
	getNames();
	localStorage.places = JSON.stringify(places);
}

function sortList() {
	// alert('Sorting Coming Soon!');
	// return;
	var totals = {},
		places = document.getElementById('vote').children;
	Array.prototype.forEach.call(places, function(elem) {
		totals[elem.id] = parseInt(elem.lastChild.innerHTML);
	});
	console.log(totals);
}

function newMeal() {
	var message = 'Are you sure All users except the first will be lost.',
		keys = Object.keys(names),
		key = keys[0];

	if(confirm(message)){
		keys.forEach(function(elem) {
			if(elem !== key){
				delete names[elem];
			}
		});
		userCount = Object.keys(names).length;
		getGrub();
	} else {
		return;
	}
}

function getNames() {
	var nameContain = document.getElementById('names'),
		keys = Object.keys(names);

	while (nameContain.firstChild) {
		nameContain.removeChild(nameContain.firstChild);
	}
	keys.forEach(function(elem) {
		var tmp = NameTag(elem,names[elem]);
		nameContain.appendChild(tmp);
	});
}

function changeName() {
	var who = this.id.replace('Name',''),
		input,
		p = this.firstChild,
		that = this,
		method = function(){
			names[who] = this.value;
			p.innerHTML = this.value;
			that.replaceChild(p,this);
		  	localStorage.places = JSON.stringify(places);
		};

	input = Input({value: names[who], event:{type: 'blur', method: method}});
	this.replaceChild(input,p);
	input.select();
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
		places.size = userCount;
		getNames();
		localStorage.places = JSON.stringify(places);
	}
}

function fillList(places) {
	var voteContain = document.getElementById('votes'),
		keys = Object.keys(places),
		nUsers,
		load = document.getElementById('loading');

	if(typeof userCount == 'undefined'){
		userCount = this.places.size;
	}
	nUsers = userCount;
	if(load){
		voteContain.removeChild(load);
	}
	keys.forEach(function(elem,i){
		var place = places[elem];
		if (!place.hasOwnProperty('permanently_closed')){
			var temp = ListItem(place);
			voteContain.appendChild(temp);
		}
	});
	if(voteContain.children[0].childElementCount === 3 && userCount > 1){
		userCount = 1;
		for (var i = 1; i < nUsers;i++){
			addUser();
		}
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
						name: name +  x,
						value: value,
						event:{type:'click', method: vote}});

	return toggle;
}

function vote() {
	var restName = this.parentNode.parentNode.id,
		contain = this.parentNode.parentNode;

	paint(contain);
	places.locals[restName].users[this.parentNode.id] = this.value;
	localStorage.places = JSON.stringify(places);
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

function getGUID() {
	var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
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
		keys = 	Object.keys(options);

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

