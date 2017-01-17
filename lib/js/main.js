var map, infowindow, service,
	places = require('datastore'),
	userCount = 1,
	locals = {},
	names = {},
	keys = require('keys');

//Util functions
var getGUID = require('utils').getGUID,
	Label = require('utils').Label,
	Input = require('utils').Input,
	Selector = require('utils').Selector,
	Toggle = require('utils').Toggle,
	NameTag = require('utils').NameTag,
	ListItem = require('utils').ListItem,
	ItemTotal = require('utils').ItemTotal,
	callback = require('utils').callback,
	Menu = require('menu');


initialize();

function initialize() {
	document.body.replaceChild(Menu(),document.querySelector('control-menu'));
	places.geocoder = new google.maps.Geocoder();
	if (!places.get('size')){
		var center;
		places.set('names',{});
		places.set('locals',{});
		navigator.geolocation.getCurrentPosition(function(position) {
			console.log(position);
			ajax('https://maps.googleapis.com/maps/api/geocode/json?latlng='+position.coords.latitude+','+position.coords.longitude+'&key='+keys.geocode+'&result_type=street_address',function(res) {
				document.querySelector('control-menu .address').value = res.results[0].formatted_address;
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
			places.service = new google.maps.places.PlacesService(map);
			places.service.nearbySearch(request, callback);
		});
	} else {
		userCount = places.get('size');
		names = places.get('names');
		locals = places.get('locals');
		getNames();
		fillList();
		document.querySelector('control-menu .address').value = places.get('address');
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

function fillList() {
	var voteContain = document.getElementById('votes'),
		keys = Object.keys(locals),
		nUsers,
		load = document.getElementById('loading');

	if(typeof userCount === 'undefined'){
		userCount = locals.size;
	}
	nUsers = userCount;
	if(load){
		voteContain.removeChild(load);
	}
	keys.forEach(function(elem,i){
		var place = locals[elem];
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
