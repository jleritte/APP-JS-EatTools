var appModel = require('datastore'),
	keys = require('keys'),
	firebase = require('firebase');

//Util functions and UI pieces
var callback = require('utils').callback,
	getGUID = require('utils').getGUID,
	parseHash = require('utils').parseHash,
	Names = require('name-contain'),
	Menu = require('menu'),
	Votes = require('vote-contain');

firebase.initializeApp(keys.firebase);
initialize();

function initialize() {
	parseHash();

	appModel.database = firebase.database();
	appModel.database.ref('meals/'+appModel.meal).on('value',function(data) {
		appModel.set('',data.val());
		document.querySelector('name-contain').render();
		document.querySelector('vote-contain').render();
		document.querySelector('.sortList').click();
	});

	document.querySelector('.fixed').appendChild(Menu());
	document.querySelector('.fixed').appendChild(Names());
	document.body.appendChild(Votes());

	appModel.geocoder = new google.maps.Geocoder();
	if (!appModel.meal){
		var center, names = {},userID = getGUID();

		names[userID] = 'User 1';

		appModel.set('names', names);
		appModel.set('locals',{});
		appModel.set('meal',getGUID());

		window.location.hash = 'meal='+appModel.get('meal')+';user='+userID;
		parseHash();

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
				radius: appModel.get('radius')||1000,
				types: ['restaurant']
			};
			appModel.service = new google.maps.places.PlacesService(map);
			appModel.service.nearbySearch(request, callback);
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
