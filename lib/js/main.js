var places = require('datastore'),
	userCount = 1,
	keys = require('keys');

//Util functions
var ListItem = require('list-item'),
	callback = require('utils').callback,
	Names = require('name-contain'),
	Menu = require('menu'),
	Votes = require('vote-contain');


initialize();

function initialize() {
	document.querySelector('.fixed').appendChild(Menu());
	document.querySelector('.fixed').appendChild(Names());
	document.body.appendChild(Votes());
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
				radius: places.get('radius')||1000,
				types: ['restaurant']
			};
			places.service = new google.maps.places.PlacesService(map);
			places.service.nearbySearch(request, callback);
		});
	} else {
		userCount = places.get('size');
		document.querySelector('name-contain').render();
		document.querySelector('vote-contain').render();
		document.querySelector('.sortList').click();
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
