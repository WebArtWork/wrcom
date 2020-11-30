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
		// let get = window.mongo.get('user');
		// let users = get.all;
		// console.log(users)


		// let posts = window.mongo.get('post');
		// console.log(posts.all);
		// window.mongo.create('post', {name: 'Alex'});


		// let posts = window.mongo.get('post');
		// console.log(posts.all);
		// window.mongo.delete('post',{_id: "5fc5111065154606d00579c3"});  //delete, but not onload date 

		let posts = window.mongo.get('post');
		console.log(posts.all);
		window.mongo.update('post',{_id: "5fc4f56fba35c81ad4ef651e", name: "sadads"});

		// let  user = window.mongo.fetch('user', {_id: '5faaa89a99e7ef126489a0ea'})
		// console.log(user)


				// window.http.get('/api/user/get', users=>{
				// 	window.store.set_docs('user', users);
				// });

		// admin users page
		//let allusers = window.store.all('user');
		//console.log(allusers);

		//let queryusers = window.store.query('user');
		//console.log(queryusers);

		// let groupsusers = window.store.groups('user');
		// console.log(groupsusers);

		// let tab = window.hash.get('tab') || 'Home';
		// console.log(tab);
		// window.hash.set('tab', 'Family');
		//window.hash.clear('tab');

		//let getUser = window.store.get_doc('user', "5faaa89a99e7ef126489a0ea");
		//console.log(getUser);

		return  (<div>
			<button onClick ={this.AddUser}>Add User</button></div>)
	}

}

export default ExamplePage;