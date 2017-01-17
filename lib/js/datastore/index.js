var data = {},
	scope = 'places';

data.set = function(key,value) {
	data[scope][key] = value;
	sync();
};

data.get = function(key) {
	return data[scope][key];
};

function sync(){
	var stored = JSON.parse(localStorage.getItem(scope)) || {};
	data[scope] = data[scope] || {};

	data[scope] = Object.assign(stored, data[scope]);
	localStorage.setItem(scope, JSON.stringify(data[scope]));
}


sync();

module.exports = data;