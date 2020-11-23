export const Store_Service =(config={})=> {
	let _db:any = null;
	let _data:any = {};
	let tempConfig = JSON.parse(JSON.stringify(config));
	let _id = '_id';
	if(!tempConfig.database) tempConfig.database={};
	if(tempConfig.database._id) _id = tempConfig.database._id;
	if(Array.isArray(tempConfig.database.collections)){
		for (let i = 0; i < tempConfig.database.collections.length; i++){
			_initialize(tempConfig.database.collections[i]);
		}
	}
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
	window.store = {
		/* Storage Management */
		set: (hold, value, cb:any=()=>{}, errCb:any=()=>{})=>{
			if(window.sqlitePlugin){
				if(!_db){
					return setTimeout(()=>{
						set(hold, value, cb);
					}, 100);
				} 
				get(hold, resp=>{
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
						get(hold, cb);
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
						remove(hold);
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
						clear();
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
			set(type+'_docs', JSON.stringify(docs));
		},
		_add_doc:(type, doc)=>{
			for (let each in doc){
				_data[type].by_id[doc[_id]][each] = doc[each];
			}
			let add = true;
			_data[type].all.forEach(selected=>{
				if(selected[_id] == doc[_id]) add = false;
			});
			if(add) _data[type].all.push(_data[type].by_id[doc[_id]]);
		},
		_initialize:(collection)=>{
			if(!collection.all) collection.all=[];
			if(!collection.by_id) collection.by_id={};
			_data[collection.name] = collection;
			get(collection.name+'_docs', docs=>{
				if(!docs) return;
				docs = JSON.parse(docs);
				for (let i = 0; i < docs.length; i++){
					_add_doc(collection.name, get_doc(collection.name, docs[i]));
				}
			});
		},
		get_docs:(type:string, doc:object)=>{
			return _data[type].all;
		},
		get_doc:(type:string, _id:string)=>{
			if(!_data[type].by_id[_id]){
				_data[type].by_id[_id] = {};
				_data[type].by_id[_id][this._id] = _id;
				get(type+'_'+_id, doc=>{
					if(!doc) return;
					for (let each in doc){
						_data[type].by_id[_id][each] = doc[each]
					}
				});
			}
			return _data[type].by_id[_id];
		},
		replace:(doc, each, exe)=>{
			doc[each] = exe(doc, value=>{
				doc[each] = value;
			});
		},
		set_doc:(type:string, doc:object)=>{
			if(!_data[type].by_id[doc[_id]]){
				_data[type].by_id[doc[_id]] = {};
			}
			if(typeof _data[type].opts.replace == 'function'){
				doc = _data[type].opts.replace(doc);
			}else if(typeof _data[type].opts.replace == 'object'){
				for (let each in _data[type].opts.replace){
					if(typeof _data[type].opts.replace[each] == 'function'){
						replace(doc, each, _data[type].opts.replace[each]);
					}
				}
			}
			set(type+'_'+doc[_id], doc);
			_add_doc(type, doc);
			_set_docs(type);
			return _data[type].by_id[doc[_id]];
		},
		remove_doc(type:string, _id:string){
			remove(type+'_'+_id);
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

	// waw.store.set_docs = (type:string, docs:any)=>{
	// 	for (var i = 0; i < docs.length; i++) {
	// 		waw.store.set_doc(type, docs[i]);
	// 	}		
	// }
	// // user service
	// window.http.get('/api/user/get', users=>{
	// 	window.store.set_docs('user', users);
	// });
	// // admin users page
	// let users = window.store.get_docs('user');
	return null;
}

