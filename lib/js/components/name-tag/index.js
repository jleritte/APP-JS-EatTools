var appModel = require('datastore'),
	xtag = require('x-tag');

xtag.register('name-tag',{
	content: ['<span class="name"></span>',
		'<span class="remove_user"></span>'
		].join(''),
		methods: {
			render: function(id,name) {
				this.id = id+'Name';
				this.querySelector('.name').textContent = name;
			}
		},
		events: {
			'click:delegate(.remove_user)': removeUser
		}
});

module.exports = function(id,name) {
	var tag = document.createElement('name-tag');

	tag.render(id,name);
	return tag;
};

function changeName() {
	var who = this.id.replace('Name',''),
		input,
		p = this.firstChild,
		that = this,
		names = places.get('names'),
		method = function(){
			names[who] = this.value;
			p.innerHTML = this.value;
			that.replaceChild(p,this);
			places.set('names',names);
		  	// localStorage.places = JSON.stringify(places);
		};

	input = Input({value: names[who], event:{type: 'blur', method: method}});
	this.replaceChild(input,p);
	input.select();
}

function removeUser() {
	debugger;
	var name = this.parentNode.firstChild.innerHTML,
		guid = this.parentNode.id.replace('Name','');
	if(confirm('Are you sure you want to remove ' + name)){
		userCount--;
		var keys = Object.keys(places.locals);
		keys.forEach(function(elem){
			var place = places.locals[elem],
				contain = document.getElementById(elem),
				total = contain.children[contain.childElementCount - 1];
			delete place.users[guid];
			delete places.names[guid];
			contain.removeChild(document.getElementById(guid));
			paint(contain);
		});
		places.set('size',userCount);
		getNames();
		// localStorage.places = JSON.stringify(places);
	}
}