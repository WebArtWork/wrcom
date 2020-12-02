import './http.service';
import './store.service';
import './render.service';

export const Mongo_Service =()=>{
	/*
	*	waw crud connect functions
	*/
	const _get = {};
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
					 window.store.add_doc(part, doc);
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
				window.store.add_doc(part, server_doc);
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

				_get[part] = true;
			}, opts);

			return {
				all: window.store.all(part),
				by_id: window.store.by_id(part),
				query: window.store.query(part),
				groups:  window.store.groups(part)
			};
		},
		_prepare_update:(part, doc, opts)=>{
		 window.store.add_doc(part, doc)
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
		 		replace(doc, key, opts.replace[key]);
		 	}
		 }
		 if(typeof opts.rewrite == 'object' && Object.values(opts.rewrite).length){
		 	doc = JSON.parse(JSON.stringify(doc));
		 	for(let key in opts.rewrite){
		 		replace(doc, key, opts.rewrite[key]);
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
					window.store.add_doc(part, doc);
					window.render.call();
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
			doc = window.mongo._prepare_update(part, doc, opts);
			console.log(doc);
			let url = '/api/' + part + '/unique' + (opts.name||'');
			window.http.post(opts.url || url, doc, resp => {
				if(resp){
					window.store.add_doc(part, doc);
					window.render.call();
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
					window.store.remove_doc(part, doc._id);
				 }
				 if (resp && typeof cb == 'function') {
				 	cb(resp);
				 } else if (typeof cb == 'function') {
				 	cb(false);
				 }
			}, opts); 
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
				if (!_get[parts[i]]) {
					return setTimeout( () => {
						window.mongo.on(parts, cb);
					}, 100);
				}
			}
			cb();
		},
}
}