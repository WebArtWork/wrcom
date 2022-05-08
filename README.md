# wrcom
## Services
import Service from 'wrcom';
class UserService extends Service {
	public rand = Math.floor(Math.random() * 5000); // this will be same for all instances and any other property of this class
	constructor(){
		super();
	}
}
export default UserService
