
declare var window:any;
declare var cordova:any;

export const Core_Service =()=> {

		let host:any = window.location.host.toLowerCase();
		let	_afterWhile:any = {}; 
		let cb:any = {};
		let _ids:any = {};
		let done_next:any = {};
	window.core ={
		serial_process: (i, arr, callback)=>{
			if(i>=arr.length) return callback();
			arr[i](()=>{
				serial_process(++i, arr, callback);
			});
		},
		set_version:(version='1.0.0')=>{
			version = version;
			document.addEventListener('deviceready', () => {
				done('mobile');
				if(cordova && cordova.getAppVersion){
					cordova.getAppVersion.getVersionNumber((version)=>{
						version = version;
					});
				}
			});
		},
	
		parallel:(arr, callback)=>{
			let counter = arr.length;
			if(counter===0) return callback();
			for (let i = 0; i < arr.length; i++) {
				arr[i](function(){
					if(--counter===0) callback();
				});
			}
		},
		serial:(arr, callback)=>{
			serial_process(0, arr, callback);
		},
		each:(arrOrObj, func, callback, isSerial=false)=>{
			if(typeof callback == 'boolean'){
				isSerial = callback;
				callback = ()=>{};
			}
			if(Array.isArray(arrOrObj)){
				let counter = arrOrObj.length;
				if(counter===0) return callback();
				if(isSerial){
					let serialArr = [];
					for (let i = 0; i < arrOrObj.length; i++) {
						serialArr.push(function(next){
							func(arrOrObj[i], function(){
								if(--counter===0) callback();
								else next();
							}, i);
						});
					}
					serial_process(0, serialArr, callback);
				}else{
					for (let i = 0; i < arrOrObj.length; i++) {
						func(arrOrObj[i], function(){
							if(--counter===0) callback();
						}, i);
					}
				}
			}else if(typeof arrOrObj == 'object'){
				if(isSerial){
					let serialArr = [];
					let arr = [];
					for(let each in arrOrObj){
						arr.push({
							value: arrOrObj[each],
							each: each
						});
					}this
					let counter = arr.length;
					for (let i = 0; i < arr.length; i++) {
						serialArr.push(function(next){
							func(arr[i].each, arr[i].value, function(){
								if(--counter===0) callback();
								else next();
							}, i);
						});
					}
					serial_process(0, serialArr, callback);
				}else{
					let counter = 1;
					for(let each in arrOrObj){
						counter++;
						func(each, arrOrObj[each], function(){
							if(--counter===0) callback();
						});
					}
					if(--counter===0) callback();
				}
			}else callback();
		},
	
		afterWhile:(doc, cb, time=1000)=>{
			if(typeof doc == 'function'){
				cb = doc;
				doc = 'common';
			}
			if(typeof doc == 'string'){
				if(!_afterWhile[doc]) _afterWhile[doc]={};
				doc = _afterWhile[doc];
			}
			if(typeof cb == 'function' && typeof time == 'number'){
				clearTimeout(doc.__updateTimeout);
				doc.__updateTimeout = setTimeout(cb, time);
			}
		},

		emit:(signal, doc:any={})=>{
			if(!cb[signal]) cb[signal] = {};
			for (let each in cb[signal]){
				if(typeof cb[signal][each] == 'function'){
					cb[signal][each](doc);
				}
			}
		},
	
		on:(signal, cb)=>{
			let id = Math.floor(Math.random() * Date.now()) + 1;
			if(_ids[id]) return on(signal, cb);
			_ids[id]=true;
			if(!cb[signal]) cb[signal] = {};
			cb[signal][id] = cb;
			return ()=>{
				cb[signal][id] = null;
			}
		},
		/* once Signal when something is ready */
	
		done:(signal)=> {
			done_next[signal] = true;
		},
		ready:(signal)=>{ return done_next[signal]; },
		next:(signal, cb)=> {
			if(done_next[signal]) cb();
			else {
				return setTimeout(()=>{
					next(signal, cb);
				}, 100);
			}
		}
	}
		//constructor(router: Router) {
			var userAgent = navigator.userAgent || navigator.vendor || window.opera;
			if (/windows phone/i.test(userAgent)) {
				device = "windows";
			}else if (/android/i.test(userAgent)) {
				device = "android";
			}else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
				device = "ios";
			}else device = "web";
			core.set_version();
			let device:any;
			let version:any;
	// //}	
	return null

}
