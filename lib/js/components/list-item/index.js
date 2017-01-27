var appModel = require('datastore'),
	xtag = require('x-tag'),
	toggle = require('vote-toggle');

xtag.register('list-item',{
	content: ['<label></label>',
		'<span class="total"></span>'
		].join(''),
		methods: {
			render: function(place,id) {
				var keys = Object.keys(place.users);
				this.local = id;
				this.querySelector('label').textContent = place.name;
				keys.forEach(function(elem,i) {
					var vote = place.users[elem];
					this.appendChild(toggle(elem,id,i+1,vote));
				}.bind(this));
				this.querySelector('span.total').textContent = getTotals(place.users).up;
			},
			paint: paint
		}
});

module.exports = function(place,id) {
	var item = document.createElement('list-item');

	item.render(place,id);
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

	this.vote = totals.total + totals.up - totals.down;
	if(totals.total === 0){
		return;
	}
	this.vote += 0.5;
	if ((totals.up - totals.down) < 0) {
		op = totals.down / totals.total;
		this.style.backgroundColor = 'rgba(244, 67, 54, '+op+')'; //Red
	} else {
		op = totals.up / totals.total;
		this.vote += 0.5;
		this.style.backgroundColor = 'rgba(76, 175, 80, '+op+')'; //Green
	}
	this.className = 'voted';
	this.querySelector('span.total').textContent = totals.up;
}