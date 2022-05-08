class Service {
	constructor(){
		if(Service.instance instanceof Service) {
			return Service.instance;
		}
		Service.instance = this;
	}
}

export default Service
