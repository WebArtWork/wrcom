# wrcom
## Services
```
import Service from 'wrcom';
class UserService extends Service {
	// this will be same for all instances and any other property of this class
	public rand = Math.floor(Math.random() * 5000);
	constructor(){
		super();
	}
}
export default UserService
```
