import React from 'react'


class ExamplePage extends React.Component{
	state ={
		email: 'lobo@agmail.com', 
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
	AddPost =()=>{
		let posts = window.mongo.get('post');
		console.log(posts.all);
		window.mongo.create('post', {name: 'Alex'});
	}
	render(){
		// window.http.post('/api/user/update', {
		// 	name: 'Alex',
		// 	data: 'abs'
		// }, (resp)=>{});

		// user service
		// let get = window.mongo.get('user');
		// console.log(get.all)


		// let posts = window.mongo.get('post');
		// console.log(posts.all);
		// window.mongo.create('post', {name: 'Alex'});


		let posts = window.mongo.get('post');
		console.log(posts.groups);
		window.mongo.delete('post', {_id: "5fc781653a8df812900717b8"}); 

		// let posts_update = window.mongo.get('post');
		// console.log(posts_update.all);
		// window.mongo.update('post',{_id: "5fc781653a8df812900717b9", name: "Lego"});

		// let posts = window.mongo.get('post');
		// console.log(posts.all);
		// let url = "asdasd2wsaddw"+Date.now();
		// window.mongo.unique('post', {
		// 	_id: "5fc4f3f9ba35c81ad4ef651c",
		// 	url: url});
		// window.mongo.unique('post', {
		// 	_id: "5fc5110e65154606d00579c1",
		// 	url: url
		// });

		// window.mongo.on('post', ()=>{
		// 	console.log('posts was loaded');
		// })

		// let  user = window.mongo.fetch('user', {_id: ''})
		// console.log(user)

		// window.http.get('/api/user/get', users=>{
		// 	window.store.set_docs('user', users);

		// //core 
		// 	console.log('success');
		// 	window.core.afterWhile(()=>{
		// 		console.log('success');
		// 	})
		// });
		


		//admin users page
		// let all_users = window.store.all('user');
		// console.log(all_users);

		// let by_id_users = window.store.by_id('user');
		// console.log(by_id_users);

		// let query_users = window.store.query('user');
		// console.log(query_users);

		// let groups_users = window.store.groups('user');
		// console.log(groups_users);

		// console.log(posts.all);
		// window.mongo.update('post',{_id: "5fc4f56fba35c81ad4ef651e", name: "asd322113sadsad"});

		// let tab = window.hash.get('tab') || 'Home';
		// console.log(tab);
		// window.hash.set('tab', 'Family');
		//window.hash.clear('tab');

		//let getUser = window.store.get_doc('user', "5faaa89a99e7ef126489a0ea");
		//console.log(getUser);

		return  (<div>
			<button onClick ={this.AddUser}>Add User</button>
			<button onClick ={this.AddPost}>Add Post</button>
			</div>)
	}

}

export default ExamplePage;