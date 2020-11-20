import React from 'react'

export  const Hash_Service =()=>{
	const replaces = [{
		from: '%20',
		to: ' '
	}];
		 hash = {};
		 let done = false;
	window.hash = {
		on: (field, cb = resp=>{})=>{
			if(!done) return setTimeout(()=>{ on(field, cb); }, 100);
			cb(hash[field]);
		},
		save: ()=>{
			let hash = '';
			for(let each in hash){
				if(hash) hash += '&';
				hash += each + '=' + hash[each];
			}
			window.location.hash = hash;
		},
		set: (field, value)=>{
			hash[field] = value;
			save();
		},
		get: (field)=>{
			return hash[field];
		},
		clear: (field)=>{
			delete hash[field];
			save();
		}
	}

	if(!window.location.hash){
		done = true;
		return null;
	}

	let hash:any = window.location.hash.replace('#!#', '').replace('#', '').split('&');
	for(let i = 0; i < hash.length; i++){
		let holder = hash[i].split('=')[0];
		let value = hash[i].split('=')[1];
		for(let j = 0; j < replaces.length; j++){
			holder = holder.split(replaces[j].from).join(replaces[j].to);
			value = value.split(replaces[j].from).join(replaces[j].to);
		}
		hash[holder] = value;
	}
	done = true;	
	return null
}
