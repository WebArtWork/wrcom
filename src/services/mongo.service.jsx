import './http.service';
import './store.service';
import './render.service';

export const Mongo_Service =()=>{
	/*
	*	Data will be storage for all information we are pulling from waw crud.
	*	data['arr' + part] will host all docs from collection part in array form
	*	data['obj' + part] will host all docs from collection part in object form
	*		and all groups collecitons provided
	*	data['opts' + part] will host options for docs from collection part
	*		Will be initialized only inside get
	*		Will be used inside push
	*/
		//private data = {}; use from local
	/*
	*	waw crud connect functions
	*/
	window.mongo = {
		create: (part, doc=undefined, cb=undefined, opts:any={})=> {
			if (typeof doc == 'function') {
				if(cb) opts = cb;
				cb = doc;
				doc = {};
			}
			if(typeof opts == 'function'){
				opts = {
					err: opts
				};
			}
			if(typeof doc != 'object') doc={};
			if(doc.___created && !opts.allow_multiple) return;
			doc.___created = true;
			window.http.post(opts.url || '/api/' + part + '/create', doc || {}, resp => {
				if (resp) {
					// window.mongo.push(part, resp);
					if (typeof cb == 'function') cb(resp);
				}else if (typeof cb == 'function') {
					cb(false);
				}
			}, opts);
		},
		fetch:(part, opts=undefined, cb=undefined)=> {
			if (typeof opts == 'string') {
				opts = {
					query: {
						_id: opts
					}
				}
			}
			if (typeof opts == 'function') {
				cb = opts;
				opts = {};
			}
			if(opts._id){
				opts.query = {_id: opts._id};
			}
			if(!opts) opts={};
			if(!cb) cb=server_doc=>{};
			let url = '/api/' + part + '/fetch'+(opts.name||'');
			let doc = {};
			if(opts._id){
				doc = window.store.get_doc('user', opts._id);
			}
			window.http.post(opts.url || url, opts.query||{}, server_doc=>{
				cb(server_doc);
				// window.mongo.renew(part, server_doc);
				window.render.call();
			});
			return doc;
		},
		get:(part, opts=undefined, cb=undefined)=> {
			if (typeof opts == 'function') {
				cb = opts;
				opts = {};
			}
			if(!opts) opts={};
			let url = '/api/' + part + '/get'+(opts.name || '')+(opts.param||'');
			window.http.get(opts.url || url , resp => {
				window.store.set_docs(part, resp);
			}, opts);
			return {
				all: window.store.all(part),
				by_id: window.store.by_id(part),
				query: window.store.query(part),
				groups:  window.store.groups(part)
			};
		},
		_prepare_update:(part, doc, opts)=>{
		//	this.renew(part, doc);
			if(opts.fields){
				if(typeof opts.fields == 'string') opts.fields = opts.fields.split(' ');
				let _doc = {};
				for(let i = 0; i < opts.fields.length; i++){
					_doc[opts.fields[i]] = doc[opts.fields[i]];
				}
				doc = _doc;
			}
			if(typeof opts.replace == 'object' && Object.values(opts.replace).length){
				for(let key in opts.replace){
					this.replace(doc, key, opts.replace[key]);
				}
			}
			if(typeof opts.rewrite == 'object' && Object.values(opts.rewrite).length){
				doc = JSON.parse(JSON.stringify(doc));
				for(let key in opts.rewrite){
					this.replace(doc, key, opts.rewrite[key]);
				}
			}
			return doc;
		},
		update:(part, doc, opts=undefined, cb=undefined)=> {
			if (typeof opts == 'function'){
				cb = opts;
				opts = {};
			}
			if(typeof opts != 'object') opts = {};
			doc = window.mongo._prepare_update(part, doc, opts);
			let url = '/api/' + part + '/update' + (opts.name||'');
			window.http.post(opts.url || url, doc, resp => {
				if(resp){
					// this.socket.emit('update', {
					// 	_id: doc._id,
					// 	part: part
					// });
				}
				if (resp && typeof cb == 'function') {
					cb(resp);
				} else if (typeof cb == 'function') {
					cb(false);
				}
			}, opts);
		},
		unique:(part, doc, opts=undefined, cb=undefined)=> {
			if (typeof opts == 'function'){
				cb = opts;
				opts = {};
			}
			if(typeof opts != 'object') opts = {};
			doc = this._prepare_update(part, doc, opts);
			let url = '/api/' + part + '/unique' + (opts.name||'');
			window.http.post(opts.url || url, doc, resp => {
				if(resp){
					this.socket.emit('update', {
						_id: doc._id,
						part: part
					});
					let current_doc = data['obj' + part][doc._id];     //data - ?
					for (let each in doc){
						current_doc[each] = doc[each];
					}
					this.renew(part, current_doc);
				}
				if (resp && typeof cb == 'function') {
					cb(resp);
				} else if (typeof cb == 'function') {
					cb(false);
				}
			}, opts);
		},
		delete:(part, doc, opts=undefined, cb=undefined) => {
			if (typeof opts == 'function') {
				cb = opts;
				opts = {};
			}
			if(typeof opts !== 'object') opts = {};
			if(opts.fields){
				if(typeof opts.fields == 'string') opts.fields = opts.fields.split(' ');
				let _doc = {};
				for(let i = 0; i < opts.fields.length; i++){
					_doc[opts.fields[i]] = doc[opts.fields[i]];
				}
				doc = _doc;
			}else{
				doc={
					_id:doc._id
				}
			}
			let url = '/api/' + part + '/delete' + (opts.name||'');
			window.http.post(opts.url || url, doc, resp => {
				 if (resp) {
				 	console.log('here')
				 	window.store.remove(doc);
				 	//window.store.clear();
				 }
				if (resp && typeof cb == 'function') {
					cb(resp);
				} else if (typeof cb == 'function') {
					cb(false);
				}
			}, opts); //delete, but not onload date 

		},
		_id:(cb)=>{
			if(typeof cb == 'function'){
				window.http.get('/waw/newId', cb);
			}
		},
		on:(parts, cb)=> {
			if (typeof parts == 'string') {
				parts = parts.split(" ");
			}
			for (let i = 0; i < parts.length; i++) {
				if (!data['loaded'+parts[i]]) {
					return setTimeout( () => {
						on(parts, cb);
					}, 100);
				}
			}
			cb(data);
		},
	/*
	*	mongo local support functions
	*/
	renew:(part, doc)=>{
		if(!data['obj' + part][doc._id]) return this.push(part, doc);
		if(data['opts'+part].replace){
			for(let key in data['opts'+part].replace){
				replace(doc, key, data['opts'+part].replace[key]);
			}
		}
			// for (let each in data['obj' + part][doc._id]){
			// 	data['obj' + part][doc._id][each] = doc[each];
			// }
			// for (let each in doc){
			// 	data['obj' + part][doc._id][each] = doc[each];
			// }
			// if(this.data['opts'+part].groups){
			// 	for(let key in this.data['opts'+part].groups){
			// 		let to_have = true;
			// 		let g = this.data['opts'+part].groups[key];
			// 		if(typeof g.ignore == 'function' && g.ignore(doc)) to_have = false;
			// 		if(typeof g.allow == 'function' && !g.allow(doc)) to_have = false;
			// 		if(!this.data['obj' + part][key]){
			// 			this.data['obj' + part][key] = {};
			// 		}
			// 		let fields = {};
			// 		let set = field => {
			// 			fields[field] = true;
			// 			if(!field) return;
			// 			if(!Array.isArray(this.data['obj' + part][key][field])){
			// 				this.data['obj' + part][key][field] = [];
			// 			}
			// 			if(to_have){
			// 				for (let i = this.data['obj' + part][key][field].length-1; i >= 0; i--){
			// 				    if(this.data['obj' + part][key][field][i]._id == doc._id) return;
			// 				}
			// 				this.data['obj' + part][key][field].push(doc);
			// 			} else {
			// 				for (let i = this.data['obj' + part][key][field].length-1; i >= 0; i--){
			// 				    if(this.data['obj' + part][key][field][i]._id == doc._id){
			// 				    	this.data['obj' + part][key][field].splice(i, 1);
			// 				    }
			// 				}
			// 			}
			// 			if(typeof g.sort == 'function'){
			// 				this.data['obj' + part][key][field].sort(g.sort);
			// 			}
			// 		}
			// 		set(g.field(doc, set.bind(this)));
			// 		for (let field in this.data['obj' + part][key]){
			// 			if(fields[field]) continue;
			// 			for (let i = this.data['obj' + part][key][field].length-1; i >= 0; i--){
			// 				if(this.data['obj' + part][key][field][i]._id == doc._id){
			// 					this.data['obj' + part][key][field].splice(i, 1);
			// 				}
			// 			}
			// 		}
			// 	}
			// }
			// if(this.data['opts'+part].query){
			// 	for(let key in this.data['opts'+part].query){
			// 		let to_have = true;
			// 		let query = this.data['opts'+part].query[key];
			// 		if(typeof query.ignore == 'function' && query.ignore(doc)) to_have = false;
			// 		if(typeof query.allow == 'function' && !query.allow(doc)) to_have = false;
			// 		if(!this.data['obj' + part][key]){
			// 			this.data['obj' + part][key] = [];
			// 		}
			// 		if(to_have){
			// 			for (let i = this.data['obj' + part][key].length-1; i >= 0; i--){
			// 			    if(this.data['obj' + part][key][i]._id == doc._id) return;
			// 			}
			// 			this.data['obj' + part][key].push(doc);
			// 		} else {
			// 			for (let i = this.data['obj' + part][key].length-1; i >= 0; i--){
			// 			    if(this.data['obj' + part][key][i]._id == doc._id){
			// 			    	this.data['obj' + part][key].splice(i, 1);
			// 			    }
			// 			}
			// 		}
			// 		if(typeof query.sort == 'function'){
			// 			this.data['obj' + part][key].sort(query.sort);
			// 		}
			// 	}
			// }
		},
		push:(part, doc)=>{
			if(data['obj' + part][doc._id]) return this.renew(part, doc);
			if(data['opts'+part].replace){
				for(let key in this.data['opts'+part].replace){
					this.replace(doc, key, this.data['opts'+part].replace[key]);
				}
			}
			if(data['opts'+part].populate){
				let p = data['opts'+part].populate;
				if(Array.isArray(p)){
					for(let i = 0; i < p.length; i++){
						if(typeof p == 'object' && p[i].field && p[i].part){
							populate(doc, p[i].field, p[i].part);
						}
					}
				}else if(typeof p == 'object' && p.field && p.part){
					populate(doc, p.field, p.part);
				}
			}
			data['arr' + part].push(doc);
			if(data['opts'+part].sort){
				data['arr' + part].sort(data['opts'+part].sort);
			}
			data['obj' + part][doc._id] = doc;
			if(Array.isArray(data['opts'+part].use)){
				for (let i = 0; i < data['opts'+part].use.length; i++){
					data['obj' + part][doc[data['opts'+part].use[i]]] = doc;
				}
			}
			// if(data['opts'+part].groups){
			// 	for(let key in data['opts'+part].groups){
			// 		let groups = data['opts'+part].groups[key];
			// 		if(typeof groups.ignore == 'function' && groups.ignore(doc)) continue;
			// 		if(typeof groups.allow == 'function' && !groups.allow(doc)) continue;
			// 		if(!this.data['obj' + part][key]){
			// 			this.data['obj' + part][key] = {};
			// 		}
			// 		let set = field => {
			// 			if(!field) return;
			// 			if(!Array.isArray(this.data['obj' + part][key][field])){
			// 				this.data['obj' + part][key][field] = [];
			// 			}
			// 			this.data['obj' + part][key][field].push(doc);
			// 			if(typeof groups.sort == 'function'){
			// 				this.data['obj' + part][key][field].sort(groups.sort);
			// 			}
			// 		}
			// 		set(groups.field(doc, (field)=>{
			// 			set(field);
			// 		}));
			// 	}
			// }
			// if(.data['opts'+part].query){
			// 	for(let key in data['opts'+part].query){
			// 		let query = data['opts'+part].query[key];
			// 		if(typeof query.ignore == 'function' && query.ignore(doc)) continue;
			// 		if(typeof query.allow == 'function' && !query.allow(doc)) continue;
			// 		if(!data['obj' + part][key]){
			// 			data['obj' + part][key] = [];
			// 		}
			// 		data['obj' + part][key].push(doc);
			// 		if(typeof query.sort == 'function'){
			// 			data['obj' + part][key].sort(query.sort);
			// 		}
			// 	}
			// }
		},
		// remove:(part, doc)=>{
		// 	if(!Array.isArray(data['arr' + part])) return;
		// 	for (let i = 0; i < data['arr' + part].length; i++) {
		// 		if (data['arr' + part][i]._id == doc._id) {
		// 			data['arr' + part].splice(i, 1);
		// 			break;
		// 		}
		// 	}
		// 	delete data['obj' + part][doc._id];
		// 	if(data['opts'+part].groups){
		// 		for(let key in data['opts'+part].groups){
		// 			for(let field in data['obj' + part][key]){
		// 				for (let i = data['obj' + part][key][field].length-1; i >= 0 ; i--) {
		// 					if (data['obj' + part][key][field][i]._id == doc._id) {
		// 						data['obj' + part][key][field].splice(i, 1);
		// 					}
		// 				}
		// 			}
		// 		}
		// 	}
		// 	if(data['opts'+part].query){
		// 		for(let key in data['opts'+part].query){
		// 			for (let i = data['obj' + part][key].length-1; i >= 0 ; i--) {
		// 				if (data['obj' + part][key][i]._id == doc._id) {
		// 					data['obj' + part][key].splice(i, 1);
		// 					break;
		// 				}
		// 			}
		// 		}
		// 	}
		//}
	}
}