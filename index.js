class Service {
	constructor() {
		if (Service.instance instanceof Service) {
			return Service.instance;
		}
		Service.instance = this;
	}
}
class CrudService extends Service {
	private config:any = {};
	constructor() {
		super();
	}
	create(module) {
		return new Promise(function (resolve, reject) {
		});
	}
	config(module, config) {
		config[module] = config;
	}
	get(module, config) {
		return new Promise(function (resolve, reject) {
		});
	}
	fetch(module, config) {
		return new Promise(function (resolve, reject) {
		});
	}
	update(module, doc, config) {
		return new Promise(function (resolve, reject) {
		});
	}
	unique(module, doc, config) {
		return new Promise(function (resolve, reject) {
		});
	}
	delete(module, doc, config) {
		return new Promise(function (resolve, reject) {
		});
	}
}
class HttpService extends Service {
	constructor() {
		super();
	}
	get(url) {
		return new Promise(function (resolve, reject) {
		});
	}
	put(url, obj) {
		return new Promise(function (resolve, reject) {
		});
	}
	post(url, obj) {
		return new Promise(function (resolve, reject) {
		});
	}
	patch(url, obj) {
		return new Promise(function (resolve, reject) {
		});
	}
	delete(url, obj) {
		return new Promise(function (resolve, reject) {
		});
	}
}
class StoreService extends Service {
	private data: any = {};
	get(holder: string) {
		return new Promise(function (resolve, reject) {
			resolve(data[holder] || '');
		});
	}
	set(holder: string, data: any) {
		return new Promise(function (resolve, reject) {
			data[holder] = data;
			resolve(data[holder] || '');
		});
	}
	constructor() {
		super();
	}
}
class RenderService extends Service {
	constructor() {
		super();
	}
	private pipes: any = {};
	on(event: string) {
		return new Promise(function (resolve, reject) {
			if (!this.pipes[event]) this.pipes[event] = [];
			this.pipes[event].push(resolve);
		});
	}
	render(event: string, param = null) {
		if (!this.pipes[event]) return;
		for (let i = 0; i < this.pipes[event].length; i++) {
			if (typeof this.pipes[event][i] === 'function') {
				this.pipes[event][i](param);
			}
		}
	}
}
module.exports = {
	CrudService,
	RenderService,
	StoreService,
	HttpService,
	Service
}
