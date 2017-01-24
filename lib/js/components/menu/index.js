var appModel = require('datastore'),
	xtag = require('x-tag'),
	getGUID = require('utils').getGUID,
	callback = require('utils').callback;

xtag.register('control-menu',{
	content: [
		'<button class="newMeal">New Meal</button>',
		'<label>Address: </label>',
		'<input class="address">',
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
				appModel.set('locals',{});
				document.querySelector('vote-contain').render();
				appModel.service.nearbySearch(request, function(results, status) {
					callback(results,status);
				});
			} else {
				alert("Geocode was not successful for the following reason: " + status);
		}
	});
}

function addUser() {
	var names = appModel.get('names'),
		locals = appModel.get('locals'),
		userGuid = Object.keys(names)[userCount] || getGUID(),
		keys = Object.keys(locals),
		userCount = appModel.get('size');
	userCount++;
	keys.forEach(function(elem){
		var place = locals[elem];
		place.users[userGuid] = null;
	});
	names[userGuid] = names[userGuid] || 'User ' + userCount;
	appModel.set('size',userCount);
	appModel.set('locals',locals);
	appModel.set('names',names);
	document.querySelector('name-contain').render();
	document.querySelector('vote-contain').render();
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
		appModel.set('size',1);
		getGrub();
	} else {
		return;
	}
}

module.exports = function() {
	var menu = document.createElement('control-menu');

	menu.render();
	// menu.querySelector('input[type=range]').value = appModel.get('radius')||1000;
	// menu.querySelector('.radiusLabel').value = appModel.get('radius')||1000;
	return menu;
};