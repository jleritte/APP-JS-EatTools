var map, geocoder, infowindow, service, places = localStorage.places || {}, userCount, names = {}, keys = require('keys');

//Util functions
var getGUID = require('utils').getGUID,
	Label = require('utils').Label,
	Button = require('utils').Button,
	Input = require('utils').Input,
	Selector = require('utils').Selector,
	Toggle = require('utils').Toggle,
	NameTag = require('utils').NameTag,
	ListItem = require('utils').ListItem,
	ItemTotal = require('utils').ItemTotal;

initialize();

function initialize() {
	buildMenu();
	geocoder = new google.maps.Geocoder();
	if (typeof places === 'string'){
			places = JSON.parse(places);
	}
	if (!places.hasOwnProperty('size')){
		var center;
		navigator.geolocation.getCurrentPosition(function(position) {
			console.log(position);
			ajax('https://maps.googleapis.com/maps/api/geocode/json?latlng='+position.coords.latitude+','+position.coords.longitude+'&key='+keys.geocode+'&result_type=street_address',function(res) {
				document.getElementsByClassName('address')[0].value = res.results[0].formatted_address;
			});
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
		document.getElementsByClassName('address')[0].value = places.address;
	}
}

function callback(results, status) {
	if (status === google.maps.places.PlacesServiceStatus.OK) {
		var userGuid = Object.keys(names)[0] || getGUID();

		places.address = document.getElementsByClassName('address')[0].value;
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
						 event:{type: 'input', method: updateLabel}
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

	test.textContent = 'Radius: ' + this.value;
}

function getGrub() {
	var address = document.getElementsByClassName('address')[0].value,
		radius = document.getElementsByClassName('radius')[0].value;

	geocoder.geocode( { 'address': address}, function(results, status) {
			if (status === google.maps.GeocoderStatus.OK) {
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

function fillList(places) {
	var voteContain = document.getElementById('votes'),
		keys = Object.keys(places),
		nUsers,
		load = document.getElementById('loading');

	if(typeof userCount === 'undefined'){
		userCount = places.size;
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

function ajax(url,callback) {
	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function() {
		if (xhr.readyState === XMLHttpRequest.DONE) {
			if(xhr.status === 200) {
				console.log(JSON.parse(xhr.responseText));
				if(callback) {
					callback(JSON.parse(xhr.responseText));
				}
			}
		}
	};
	if("withCredentials" in xhr) {
		xhr.open('GET',url);
		xhr.send();
	}
}
