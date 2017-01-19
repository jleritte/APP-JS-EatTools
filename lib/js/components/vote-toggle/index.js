var appModel = require('datastore'),
	xtag = require('x-tag');

xtag.register('vote-toggle',{
	content: ['<input value="u" type="radio">',
		'<input value="d" type="radio">'
		].join(''),
	methods: {
		render: function(name,i,vote) {
			Array.prototype.forEach.call(this.childNodes,function(child) {
				child.setAttribute('name',name+i);
				if (child.value === vote) {
					child.checked = true;
				}
			});
		}
	},
	events: {
		'click': saveVote
	}
});

module.exports = function(id,name,i,vote) {
	var toggle = document.createElement('vote-toggle');

	toggle.render(name,i,vote);
	toggle.user = id;
	toggle.local = name;
	return toggle;
};

function saveVote(e) {
	if (e.target.tagName !== 'INPUT') {return;}
	var contain = this.parentNode,
		locals = appModel.get('locals');

	locals[this.local].users[this.user] = e.target.value;
	appModel.set('locals',locals);
	contain.paint();
}