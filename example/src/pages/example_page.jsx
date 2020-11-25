import React from 'react'


class ExamplePage extends React.Component{
	render(){
		window.http.post('/api/user/update', {
			name: 'loborchukoasdw@gmail.com',
			data: 'abs'
		}, (resp)=>{});

		window.store.set_docs = (type:string, docs:any)=>{
			for (var i = 0; i < docs.length; i++) {
				window.store.set_docs(type, docs[i]);
			}		
		}
		// user service
		window.http.get('/api/user/get', users=>{
		//	console.log(users)
		window.store.set_docs('user', users);
	});
		// admin users page
		let users = window.store.all('user');
		//console.log(users);
		//window.location.hash = 'abs c'
		//let x = window.location.hash;
		let tab = window.hash.get('tab') || 'Home';
		console.log(tab);
		window.hash.set('tab', 'Family');
		//window.hash.clear('tab');


		return  (<div>work</div>)
	}

}

export default ExamplePage;