import React from 'react'


class ExamplePage extends React.Component{
	state ={
		email: 'sadloborchuk@asdgmail.com', 
		pass: 'abs'
	}

	AddUser =()=>{
		let user = {email: this.state.email, password: this.state.pass}
		window.http.post('/api/user/status',{email: this.state.email}, (resp)=>{
			console.log(resp)
			if(!resp.email){		
				window.http.post('/api/user/signup', user, (resp)=>{});
			}
		});
	}
	render(){
		// window.http.post('/api/user/update', {
		// 	name: 'Alex',
		// 	data: 'abs'
		// }, (resp)=>{});

		// user service
		window.http.get('/api/user/get', users=>{
			window.store.set_docs('user', users);
		});
		// admin users page
		let allusers = window.store.all('user');
		//console.log(allusers);
		let queryusers = window.store.query('user');
		//console.log(queryusers);
		// let groupsusers = window.store.groups('user');
		// console.log(groupsusers);
		//window.location.hash = 'abs c'
		//let x = window.location.hash;
		// let tab = window.hash.get('tab') || 'Home';
		// console.log(tab);
		// window.hash.set('tab', 'Family');
		//window.hash.clear('tab');
		let getUser = window.store.get_doc('user', "5faaa89a99e7ef126489a0ea");
		//console.log(getUser);
		return  (<div>
			<button onClick ={this.AddUser}>Add User</button></div>)
	}

}

export default ExamplePage;