import React from 'react'

export const User=()=>{
	const us = {
		is: {},
		data: {},
		users: [],
		update: ()=>{
			window.http.post('/api/user/update', {
				name: us.name,
				data: us.data
			}, (resp)=>{});
		},
		change_password: (oldPass, newPass)=>{
			window.http.post('/api/user/changePassword', {
				newPass: newPass,
				oldPass: oldPass
			}, resp => {
				if(resp) alert('successfully changed password');
				else alert('failed to change password');
			});
		},
		logout: ()=>{
			window.http.get('/api/user/logout');
			localStorage.removeItem('waw_user');
			window.render.call('logout');
		},
		create: (user)=>{
			window.http.post('/api/user/create', {email: user} ,(resp)=>{})
		},
		save: (user)=>{},
		delete: (id)=>{
			for (var i = us.users.length - 1; i >= 0; i--) {
				if(us.users[i]._id == id){
					us.users.splice(i, 1);
				}
			}	
			window.http.post('/api/user/deleteadmin',  {_id: id}, (resp)=>{
				window.render.call('user list');
			});
		},
		set: user=>{
			for(let each in user){
				us[each] = user[each];
			}
		}
	};
	window.us = us;
	if(localStorage.getItem("waw_user")){
		us.set(JSON.parse(localStorage.getItem("waw_user")));
		window.http.get('/api/user/me', us.set);
	}
	window.http.get('/api/user/get', users=>{
		us.users = users;
		us._users = {};
		for (var i = users.length - 1; i >= 0; i--) {
			us._users[users[i]._id] = users[i];
		}
		window.render.call('user list');
		//window.render.call('sing up');
	//	console.log(us);
	});
	return null
}