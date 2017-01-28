var appModel = require('datastore'),
	xtag = require('x-tag'),
	ListItem = require('list-item');

xtag.register('vote-contain',{
	methods: {
		render: function() {
			var locals = appModel.get('locals')||{},
				keys = Object.keys(locals);
			while (this.firstChild) {
				this.removeChild(this.firstChild);
			}
			if(keys.length > 0){
				keys.forEach(function(elem) {
					var place = locals[elem];
					if(!place.hasOwnProperty('permanently_closed')){
						this.appendChild(ListItem(place,elem));
					}
				}.bind(this));
			} else {
				load = document.createElement('p');
				load.innerHTML = 'Loading....';
				this.appendChild(load);
			}
		}
	}
});

module.exports = function() {
	var votes = document.createElement('vote-contain');

	return votes;
};