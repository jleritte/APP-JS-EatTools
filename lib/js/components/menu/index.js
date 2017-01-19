var appModel = require('datastore'),
	xtag = require('x-tag'),
	getGUID = require('utils').getGUID,
	toggle = require('vote-toggle'),
	callback = require('utils').callback;

xtag.register('control-menu',{
	content: [
		'<button class="newMeal">New Meal</button>',
		'<label>Address: </label>',
		'<input class="address">',
		'<label class="radiusLabel">Radius: 5000</label>',
		'<input class="radius" min="500" max="5000" step="100" type="range">',
		'<button class="newList">Get New List</button>',
		'<button class="newUser">Add New User</button>',
		'<button class="sortList">Sort List</button>'
	].join(''),
	events: {
		'click:delegate(.newMeal)': newMeal,
		'click:delegate(.newList)': getGrub,
		'click:delegate(.newUser)': addUser,
		'click:delegate(.sortList)': sortList,
		'input:delegate(.radius)':updateLabel
	}
});

function updateLabel() {
	var test = this.parentNode.children[3];

	test.textContent = 'Radius: ' + this.value;
}

function getGrub() {
	var address = document.querySelector('.address').value,
		radius = document.querySelector('.radius').value;

	appModel.geocoder.geocode( { 'address': address}, function(results, status) {
			if (status === google.maps.GeocoderStatus.OK) {
				var center = results[0].geometry.location,
					request = {
						location: center,
						radius: radius,
					types: ['restaurant']
				};
				if(!appModel.service){
					map = new google.maps.Map(canvas, {
						center: center,
						zoom: 15
					});
					appModel.service = new google.maps.places.PlacesService(map);
				}
				appModel.service.nearbySearch(request, function(results, status) {
					while (votes.firstChild) {
						votes.removeChild(votes.firstChild);
					}
					load = document.createElement('p');
					load.id = 'loading';
					load.innerHTML = 'Loading....';
					votes.appendChild(load);
					appModel.set('locals',{});
					callback(results,status);
				});
			} else {
				alert("Geocode was not successful for the following reason: " + status);
		}
	});
}

function addUser() {
//REWRITE

	var names = appModel.get('names'),
		locals = appModel.get('locals'),
		userGuid = Object.keys(names)[userCount] || getGUID(),
		keys = Object.keys(locals),
		userCount = appModel.get('size');
	userCount++;
	keys.forEach(function(elem){
		var place = locals[elem],
			contain = document.getElementById(elem),
			total = contain.children[contain.childElementCount - 1];
		place.users[userGuid] = null;
		names[userGuid] = names[userGuid] || 'User ' + userCount;
		contain.insertBefore(toggle(userGuid,elem,userCount,null),total);
	});
	appModel.set('size',userCount);
	appModel.set('locals',locals);
	appModel.set('names',names);
	getNames();
}

function sortList() {
	alert('Sorting Coming Soon!');
	return;
	// var totals = {},
	// 	places = document.querySelector('#votes').children;
	// Array.prototype.forEach.call(places, function(elem) {
	// 	totals[elem.id] = parseInt(elem.lastChild.innerHTML);
	// });
	// console.log(totals);
}

function newMeal() {
	var message = 'Are you sure All users except the first will be lost.',
		names = appModel.get('names'),
		keys = Object.keys(names);

	if(confirm(message)){
		var newNames = {};
		newNames[keys[0]] = names[keys[0]];
		appModel.set('names',newNames);
		appModel.set('size',1);
		getGrub();
	} else {
		return;
	}
}

module.exports = function() {
	var menu = document.createElement('control-menu');

	return menu;
};