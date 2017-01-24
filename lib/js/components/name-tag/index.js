var appModel = require('datastore'),
	xtag = require('x-tag');

xtag.register('name-tag',{
	content: ['<span class="name"></span>',
		'<span class="remove_user"></span>'
		].join(''),
	methods: {
		render: function(id,name) {
			this.user = id;
			this.querySelector('.name').textContent = name;
		}
	},
	events: {
		'click:delegate(.remove_user)': removeUser,
		'dblclick:delegate(.name)': changeName
	}
});

module.exports = function(id,name) {
	var tag = document.createElement('name-tag');

	tag.render(id,name);
	return tag;
};

function changeName(e) {
	var who = e.currentTarget.user,
		names = appModel.get('names'),
		method = function(){
			names[who] = this.textContent;
			appModel.set('names',names);
			this.contentEditable = false;
			this.removeEventListener('blur',method);
		};
	this.contentEditable = true;
	this.addEventListener('blur',method);
}

function removeUser(e) {
	var guid = e.currentTarget.user,
		names = appModel.get('names'),
		name = names[guid],
		userCount = appModel.get('size'),
		locals = appModel.get('locals');
	if(confirm('Are you sure you want to remove ' + name)){
		userCount--;
		var keys = Object.keys(locals);
		keys.forEach(function(elem){
			var place = locals[elem];
			delete place.users[guid];
		});
		delete names[guid];
		appModel.set('size',userCount);
		appModel.set('locals',locals);
		appModel.set('names',names);
		document.querySelector('name-contain').render();
		document.querySelector('vote-contain').render();
		document.querySelector('.sortList').click();
	}
}