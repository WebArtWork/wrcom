export  function Store_Service(config){
//export const Store_Service = function(config={}){
	let _db:any = null;
	let _data:any = {};
	let _id = '_id';
			if(!config.database) config.database={};
	if(config.database._id) _id = config.database._id;
	// /* SQL Management*/
	document.addEventListener('deviceready', () => {
		if(window.sqlitePlugin){
			_db = window.sqlitePlugin.openDatabase({
				location: 'default',
				name: 'data'
			});
			if(!_db) return;
			_db.transaction((tx) => {
				tx.executeSql('CREATE TABLE IF NOT EXISTS Data (hold, value)');
				tx.executeSql("INSERT INTO Data (hold, value) VALUES (?,?)", ["test", "100"], (tx, res) => {
							// Initialize
						}, (e) => {});
			}, (error) => {
			}, () => {});
		}
	})
	const sort = function(arr, sort){
		if(!Array.isArray(arr)) return;
		if(typeof sort == 'string' && typeof window.store[sort] == 'function') arr.sort(window.store[sort]);
		else if(typeof sort == 'function') arr.sort(sort);
	}
	window.store = {
		/* Storage Management */
		set: (hold, value, cb:any=()=>{}, errCb:any=()=>{})=>{
			if(window.sqlitePlugin){
				if(!_db){
					return setTimeout(()=>{
						window.store.set(hold, value, cb);
					}, 100);
				} 
				window.store.get(hold, resp=>{
					if(resp){
						_db.transaction((tx) => {
							tx.executeSql("UPDATE Data SET value=? WHERE hold=?", [value, hold], cb, cb);
						}, errCb);
					}
					else{
						_db.transaction((tx) => {
							tx.executeSql('INSERT INTO Data (hold, value) VALUES (?, ?)', [hold, value], cb, cb);
						}, errCb);
					}
				});
			}else{
				try { localStorage.setItem('waw_temp_storage_'+hold, value); }
				catch(e){ errCb(); }
				cb();
			}
		},
		get:(hold, cb:any=()=>{}, errcb:any=()=>{})=>{
			if(window.sqlitePlugin){
				if(!_db){
					return setTimeout(()=>{
						window.store.get(hold, cb);
					}, 100);
				} 
				_db.executeSql('SELECT value FROM Data where hold=?', [hold], (rs)=>{
					if(rs.rows && rs.rows.length){
						cb(rs.rows.item(0).value);
					}else{
						cb('');
					}
				}, errcb);	
			}else{
				cb(localStorage.getItem('waw_temp_storage_'+hold)||'');
			}
		},
		remove:(hold, cb:any=()=>{}, errcb:any=()=>{})=>{
			if(window.sqlitePlugin){
				if(!_db)
					return setTimeout(()=>{
						window.store.remove(hold);
					}, 100);
				_db.executeSql('DELETE FROM Data where hold=?', [hold], cb, errcb);	
			}else{
				localStorage.removeItem('waw_temp_storage_'+hold);
				cb();
			}
		},
		clear:(cb:any=()=>{}, errcb:any=()=>{})=>{
			localStorage.clear();
			if(window.sqlitePlugin){
				if(!db){
					return setTimeout(()=>{
						window.store.clear();
					}, 100);
				}
				_db.executeSql('DROP TABLE IF EXISTS Data', [], (rs)=>{
					_db.executeSql('CREATE TABLE IF NOT EXISTS Data (hold, value)', [], cb, errcb);
				}, errcb);
			}
		},
		/* Document Management */
		_set_docs:(type)=>{
			let docs = [];
			for (let each in _data[type].by_id){
				docs.push(each);
			}
			window.store.set(type+'_docs', JSON.stringify(docs));
		},
		// set_docs:(type:string, docs:any)=>{
		// 	for (let i = 0; i < docs.length; i++) {
		// 		window.store.set_doc(type, docs[i])
		// },
		_add_doc:(type, doc)=>{
			// replace existed
			for (let each in doc){
				// console.log(doc[each])
				_data[type].by_id[doc[_id]][each] = doc[each];
			}
			// manage all
			let add = true;
			_data[type].all.forEach(selected=>{
				if(selected[_id] == doc[_id]) add = false;
			});
			if(add) _data[type].all.push(_data[type].by_id[doc[_id]]);
			// sort all  
			if(_data[type].sort) sort(_data[type].all, _data[type].sort);
			// manage query
			if(_data[type].opts.query){
				for(let key in _data[type].opts.query){
					let query = _data[type].opts.query[key];
					if(typeof query.ignore == 'function' && query.ignore(doc)) continue;
					if(typeof query.allow == 'function' && !query.allow(doc)) continue;
					if(!_data[type].query[key]){
						_data[type].query[key] = [];
					}					
					add = true;
					_data[type].query.forEach(selected=>{
						if(selected[_id] == doc[_id]) add = false;
					});
					if(add) _data[type].query[key].push(_data[type].by_id[doc[_id]]);
					if(query.sort) sort(_data[type].query[key], query.sort);
				}
			}
			// manage groups
			if(_data[type].opts.groups){
				for(let key in _data[type].opts.groups){
					let groups = _data[type].opts.groups[key];
					if(typeof groups.ignore == 'function' && groups.ignore(doc)) continue;
					if(typeof groups.allow == 'function' && !groups.allow(doc)) continue;
					if(!_data[type].groups[key]){
						_data[type].groups[key] = {};
					}
					let set = field => {
						if(!field) return;
						if(!Array.isArray(_data[type].groups[key][field])){
							_data[type].groups[key][field] = [];
						}
						// if exists, skip push
						add = true;
						_data[type].groups.forEach(selected=>{
						if(selected[_id] == doc[_id]) add = false;
					});
						if(add) _data[type].groups[key][field].push(_data[type].by_id[doc[_id]]);
						if(groups.sort) sort(_data[type].groups[key][field], groups.sort);
					}
					set(groups.field(doc, (field)=>{
						set(field);
					}));
				}
			}
		},
		_initialize:(collection)=>{
			if(!collection.all) collection.all=[];
			if(!collection.opts) collection.opts={};
			if(!collection.by_id) collection.by_id={};
			if(!collection.groups) collection.groups={};
			if(!collection.query) collection.query=[];
			if(collection.opts.query){
				for(let key in collection.opts.query){
					if(typeof collection.opts.query[key] == 'function'){
						collection.opts.query[key] = {
							allow: collection.opts.query[key]
						}
					}
				}
			}
			if(collection.opts.groups){
				if(typeof collection.opts.groups == 'string'){
					collection.opts.groups = collection.opts.groups.split(' ');
				}
				for(let key in collection.opts.groups){
					if(typeof collection.opts.groups[key] == 'boolean' && collection.opts.groups[key]){
						collection.opts.groups[key] = {
							field: function(doc){
								return doc[key];
							}
						}
					}
					if(typeof collection.opts.groups[key] != 'object' || typeof collection.opts.groups[key].field != 'function'){
						delete collection.opts.groups[key];
						continue;
					}
					collection.groups[key] = {};
				}
			}
			_data[collection.name] = collection;
			window.store.get(collection.name+'_docs', docs=>{
				if(!docs) return;
				docs = JSON.parse(docs);
				for (let i = 0; i < docs.length; i++){
					window.store._add_doc(collection.name, window.store.get_doc(collection.name, docs[i]));
				}
			});
		},
		all: (type:string, doc:object)=>{ return _data[type].all; },
		query: (type:string, doc:object)=>{ return _data[type].query; },
		groups: (type:string, doc:object)=>{ return _data[type].groups; },
		get_doc:(type:string, _id:string)=>{
			if(!_data[type].by_id[_id]){
				_data[type].by_id[_id] = {};
				_data[type].by_id[_id][_id] = _id;
				window.store.get(type+'_'+_id, doc=>{
					if(!doc) return;
					for (let each in doc){
						_data[type].by_id[_id][each] = doc[each]
					}
				});
			}
			return _data[type].by_id[_id];
		},
		_replace:(doc, each, exe)=>{
			doc[each] = exe(doc, value=>{
				doc[each] = value;
			});
		},
		set_doc:(type:string, doc:object)=>{
			if(!_data[type].by_id[doc[_id]]){
				_data[type].by_id[doc[_id]] = {};
			}
			if(typeof _data[type].opts._replace == 'function'){
				doc = _data[type].opts._replace(doc);
			}else if(typeof _data[type].opts._replace == 'object'){
				for (let each in _data[type].opts._replace){
					if(typeof _data[type].opts._replace[each] == 'function'){
						window.store._replace(doc, each, _data[type].opts._replace[each]);
					}
				}
			}
			window.store.set(type+'_'+doc[_id], doc);
			window.store._add_doc(type, doc);
			window.store._set_docs(type);
			return _data[type].by_id[doc[_id]];
		},
		remove_doc(type:string, _id:string){
			window.store.remove(type+'_'+_id);
			delete data[type].by_id[_id];
			store_docs(type);
		},
		/*Sorts Management*/
		sortAscId:(id='_id')=>{
			return function(a,b){
				if(a[id]>b[id]) return 1;
				else return -1;
			}
		},
		sortDescId:(id='_id')=>{
			return function(a,b){
				if(a[id]<b[id]) return 1;
				else return -1;
			}
		},
		sortAscString:(opts)=>{
			if(typeof opts == 'string'){
				opts = {
					field: opts
				}
			}
			return function(a,b){
				if(a[opts.field].toLowerCase()>b[opts.field].toLowerCase()) return 1;
				else if(a[opts.field].toLowerCase()<b[opts.field].toLowerCase() || !opts.next) return -1;
				else return opts.next(a,b);
			}
		},
		sortDescString:(opts)=>{
			if(typeof opts == 'string'){
				opts = {
					field: opts
				}
			}
			return function(a,b){
				if(a[opts.field].toLowerCase()<b[opts.field].toLowerCase()) return 1;
				else if(a[opts.field].toLowerCase()>b[opts.field].toLowerCase() || !opts.next) return -1;
				else return opts.next(a,b);
			}
		},
		sortAscDate:(opts)=>{
			if(typeof opts == 'string'){
				opts = {
					field: opts
				}
			}
			return function(a,b){
				if(a[opts.field].getTime()>b[opts.field].getTime()) return 1;
				else if(a[opts.field].getTime()<b[opts.field].getTime() || !opts.next) return -1;
				else return opts.next(a,b);
			}
		},
		sortDescDate:(opts)=>{
			if(typeof opts == 'string'){
				opts = {
					field: opts
				}
			}
			return function(a,b){
				if(a[opts.field].getTime()<b[opts.field].getTime()) return 1;
				else if(a[opts.field].getTime()>b[opts.field].getTime() || !opts.next) return -1;
				else return opts.next(a,b);
			}
		},
		sortAscNumber:(opts)=>{
			if(typeof opts == 'string'){
				opts = {
					field: opts
				}
			}
			return function(a,b){
				if(a[opts.field]>b[opts.field]) return 1;
				else if(a[opts.field]<b[opts.field] || !opts.next) return -1;
				else return opts.next(a,b);
			}
		},
		sortDescNumber:(opts)=>{
			if(typeof opts == 'string'){
				opts = {
					field: opts
				}
			}
			return function(a,b){
				if(a[opts.field]<b[opts.field]) return 1;
				else if(a[opts.field]>b[opts.field] || !opts.next) return -1;
				else return opts.next(a,b);
			}
		},
		sortAscBoolean:(opts)=>{
			if(typeof opts == 'string'){
				opts = {
					field: opts
				}
			}
			return function(a,b){
				if(!a[opts.field]&&b[opts.field]) return 1;
				else if(a[opts.field]&&!b[opts.field] || !opts.next) return -1;
				else return opts.next(a,b);
			}
		},
		sortDescBoolean:(opts)=>{
			if(typeof opts == 'string'){
				opts = {
					field: opts
				}
			}
			return function(a,b){
				if(a[opts.field]&&!b[opts.field]) return 1;
				else if(!a[opts.field]&&b[opts.field] || !opts.next) return -1;
				else return opts.next(a,b);
			}
		}
	}

	if(Array.isArray(config.database.collections)){
		for (let i = 0; i < config.database.collections.length; i++){
			window.store._initialize(config.database.collections[i]);
		}
	}
	return null;
}

