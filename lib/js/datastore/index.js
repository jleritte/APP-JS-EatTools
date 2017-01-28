var data = {},
	scope = 'places';

data.database = undefined;
data.meal = undefined;

data.set = function(key,value) {
	if(key === '') {
		data[scope] = value;
	} else {
		data[scope][key] = value;
	}
	sync();
};

data.get = function(key) {
	var rtrn = data[scope];
	if (key.length > 0){
		rtrn = rtrn[key];
	}
	return rtrn;
};

function sync(){
	var stored = JSON.parse(localStorage.getItem(scope)) || {};
	data[scope] = data[scope] || {};

	data[scope] = Object.assign(stored, data[scope]);
	localStorage.setItem(scope, JSON.stringify(data[scope]));
	data.database.ref('meals/'+data.meal).update(data[scope]);
}

module.exports = data;