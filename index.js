module.exports.Service = class {
	constructor(){
		if(Service.instance instanceof Service) {
			return Service.instance;
		}
		Service.instance = this;
	}
}
