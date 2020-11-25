import React from 'react'

export  function Hash_Service(){
	const _replaces = [{
		from: '%20',
		to: ' '
	}];
	let hash:any = window.location.hash.replace('#!#', '').replace('#', '').split('&');
	for(let i =hash.length-1; i >=0 ; i--){
		if(!hash[i]){
			hash.splice(i, 1);
			continue;
		}
		let holder = hash[i].split('=')[0];
		let value = hash[i].split('=')[1];
		for(let j = 0; j < _replaces.length; j++){
			holder = holder.split(_replaces[j].from).join(_replaces[j].to);
			value = value.split(_replaces[j].from).join(_replaces[j].to);
		}
		hash[holder] = value;

	}
	window.hash = {
		save: ()=>{
			let new_hash = '';
			for(const each in hash){	
				//console.log(each)
				if(new_hash) new_hash += '&';
				new_hash += each+'='+hash[each];
			}
			if(history.pushState) {
				history.pushState(null,null,'#'+new_hash); 
			}
			else {
				location.hash = '#' + new_hash;
			}
		},
		set: (field, value)=>{
			hash[field] = value;
			window.hash.save();
		}, 
		get: (field)=>{
			return hash[field];
		},
		clear: (field)=>{
			delete hash[field];
			window.hash.save();
		}
	}
	return null
}
