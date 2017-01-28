var appModel = require('datastore'),
	xtag = require('x-tag'),
	getGUID = require('utils').getGUID,
	callback = require('utils').callback;

xtag.register('control-menu',{
	content: [
		'<button class="newMeal">New Meal</button>',
		'<label>Address: </label>',
		'<input class="address" type="text">',
		'<label class="radiusLabel">Radius: </label>',
		'<input class="radius" min="500" max="5000" step="100" type="range">',
		'<button class="newList">Get New List</button>',
		'<button class="newUser">Add New User</button>',
		'<button class="sortList">Sort List</button>'
	].join(''),
	methods: {
		render: function() {
			var radius = appModel.get('radius') || 1000,
				address = appModel.get('address') || '';

			this.querySelector('.radiusLabel').textContent = 'Radius: ' + radius;
			this.querySelector('.radius').value = radius;
			this.querySelector('.address').value = address;
		}
	},
	events: {
		'click:delegate(.newMeal)': newMeal,
		'click:delegate(.newList)': getGrub,
		'click:delegate(.newUser)': addUser,
		'click:delegate(.sortList)': sortList,
		'input:delegate(.radius)':updateLabel,
		'change:delegate(.address)': function() {
			appModel.set('address',this.value);
		}
	}
});

function updateLabel() {
	var test = this.parentNode.children[3];
	test.textContent = 'Radius: ' + this.value;
	appModel.set('radius',+this.value);
}

function getGrub() {
	var address = document.querySelector('.address').value,
		radius = document.querySelector('.radius').value;

	appModel.temp = {};
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
				appModel.set('locals',{});
				document.querySelector('vote-contain').render();
				appModel.set('radius',+radius);
				appModel.service.nearbySearch(request, callback);
			} else {
				alert("Geocode was not successful for the following reason: " + status);
		}
	});
}

function addUser() {
	var names = appModel.get('names'),
		locals = appModel.get('locals'),
		keys = Object.keys(locals),
		userGuid = getGUID();
	keys.forEach(function(elem){
		var place = locals[elem];
		place.users[userGuid] = 'null';
	});
	names[userGuid] = names[userGuid] || 'User ' + (Object.keys(names).length+1);
	appModel.set('locals',locals);
	appModel.set('names',names);
}

function sortList() {
	var contain = document.querySelector('vote-contain'),
		places = [].slice.call(document.querySelectorAll('list-item'));
	places.sort(function(a,b) {
		return b.vote - a.vote;
	});
	while(contain.firstChild){
		contain.removeChild(contain.firstChild);
	}
	places.forEach(function(elem) {
		contain.appendChild(elem);
	});
}

function newMeal() {
	var message = 'Are you sure All users except the first will be lost.',
		names = appModel.get('names'),
		first = Object.keys(names)[0];

	if(confirm(message)){
		var newNames = {};
		newNames[first] = names[first];
		appModel.set('names',newNames);
		getGrub();
	} else {
		return;
	}
}

module.exports = function() {
	var menu = document.createElement('control-menu');

	return menu;
};