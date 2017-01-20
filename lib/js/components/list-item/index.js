var appModel = require('datastore'),
	xtag = require('x-tag'),
	toggle = require('vote-toggle');

xtag.register('list-item',{
	content: ['<label></label>',
		'<span class="total"></span>'
		].join(''),
		methods: {
			render: function(place) {
				var keys = Object.keys(place.users);
				this.local = place.name;
				this.className = 'ListItem';
				this.querySelector('label').textContent = place.name;
				keys.forEach(function(elem,i) {
					var vote = place.users[elem];
					this.appendChild(toggle(elem,place.name,i+1,vote));
				}.bind(this));
				this.querySelector('span.total').textContent = getTotals(place.users).up;
			},
			paint: paint
		}
});

module.exports = function(place) {
	var item = document.createElement('list-item');

	item.render(place);
	item.paint();
	return item;
};

function getTotals(votes) {
	var x = 0, y = 0, z = 0,
		keys = Object.keys(votes);

	keys.forEach(function(elem){
		var vote = votes[elem];
		if(vote){
			z++;
			if(vote === 'u'){
				x++;
			} else if (vote === 'd') {
				y++;
			}
		}
	});
	return {up:x,down:y,total:z};
}

function paint() {
	var	votes = appModel.get('locals')[this.local].users,
		totals = getTotals(votes),
		op;

	if(totals.total === 0){
		return;
	}
	if ((totals.up - totals.down) < 0) {
		op = totals.down / totals.total;
		this.style.backgroundColor = 'rgba(192, 57, 43, '+op+')';
	} else {
		op = totals.up / totals.total;
		this.style.backgroundColor = 'rgba(22, 160, 133, '+op+')';
	}
	this.className += ' voted';
	this.querySelector('span.total').textContent = totals.up;
}