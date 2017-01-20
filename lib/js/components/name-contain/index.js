var appModel = require('datastore'),
	xtag = require('x-tag'),
	tag = require('name-tag');

xtag.register('name-contain',{
	methods: {
		render: function() {
			var names = appModel.get('names'),
				keys = Object.keys(names),
				frag = document.createDocumentFragment();
			keys.forEach(function(key) {
				var ntag = tag(key,names[key]);
				this.appendChild(ntag);
			}.bind(frag));
			while(this.firstElementChild){
				this.firstElementChild.remove();
			}
			this.appendChild(frag);
		}
	}
});

module.exports = function() {
	var contain = document.createElement('name-contain');

	return contain;
};