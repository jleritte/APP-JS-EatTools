var appModel = require('datastore'),
	xtag = require('x-tag');

xtag.register('vote-toggle',{
	content: ['<input value="u" type="radio">',
		'<label class="icon-thumbs-up"></label>',
		'<input value="d" type="radio">',
		'<label class="icon-thumbs-down"></label>'
		].join(''),
	methods: {
		render: function(name,i,vote) {
			Array.prototype.forEach.call(this.childNodes,function(child) {
				child.setAttribute('name',name+i);
				if(child.tagName === 'INPUT'){
					child.setAttribute('id',name+i+child.value);
				} else {
					child.setAttribute('for',name+i+child.previousSibling.value);
				}
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
	if (id !== appModel.user) {
		toggle.className = 'disabled';
	}
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