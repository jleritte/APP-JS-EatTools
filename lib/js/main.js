var places = require('datastore'),
	keys = require('keys'),
	firebase = require('firebase');

//Util functions and UI pieces
var callback = require('utils').callback,
	Names = require('name-contain'),
	Menu = require('menu'),
	Votes = require('vote-contain');

//Firebase Config
var config = {
	apiKey: 'AIzaSyAcTPtfkk1LnNRY3SHtwZmzvgluHDXSt3g',
	authDmain: 'eat-tools-1484253475992.firebaseapp.com',
	databaseURL: 'https://eat-tools-1484253475992.firebaseio.com',
	storageBucket: 'gs://eat-tools-1484253475992.appspot.com'
};

firebase.initializeApp(config);
initialize();

function initialize() {
	document.querySelector('.fixed').appendChild(Menu());
	document.querySelector('.fixed').appendChild(Names());
	document.body.appendChild(Votes());

	places.database = firebase.database();

	places.geocoder = new google.maps.Geocoder();
	if (!places.get('size')){
		var center;
		places.set('names',{});
		places.set('locals',{});
		navigator.geolocation.getCurrentPosition(function(position) {
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
				types: ['restaurant'],
				openNow: true
			};
			places.service = new google.maps.places.PlacesService(map);
			places.service.nearbySearch(request, callback);
		});
	} else {
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
