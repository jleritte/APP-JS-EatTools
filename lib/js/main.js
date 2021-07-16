import keys from 'keys.js'

//Util functions and UI pieces
var callback = require('utils').callback,
	getGUID = require('utils').getGUID,
	parseHash = require('utils').parseHash,
	Names = require('name-contain'),
	Menu = require('menu'),
	Votes = require('vote-contain');


function initialize() {
	parseHash();
	var menu = Menu(),
		nameContain = Names(),
		voteContain = Votes();

	appModel.database = firebase.database();
	document.querySelector('.fixed').appendChild(menu);
	document.querySelector('.fixed').appendChild(nameContain);
	document.body.appendChild(voteContain);

	appModel.geocoder = new google.maps.Geocoder();
	if (!appModel.meal){
		var center, names = {},userID = getGUID();

		names[userID] = 'User 1';

		appModel.set('names', names);
		appModel.set('locals',{});
		appModel.meal = getGUID();
		appModel.temp = {};

		window.location.hash = 'meal='+appModel.meal+';user='+userID;
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
				radius: 1000,
				types: ['restaurant']
			};
			appModel.service = new google.maps.places.PlacesService(map);
			appModel.service.nearbySearch(request, callback);
		});
	}

	appModel.database.ref('meals/'+appModel.meal).on('value',function(data) {
		appModel.set('',data.val());
		menu.render();
		nameContain.render();
		voteContain.render();
		menu.querySelector('.sortList').click();
	});
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
