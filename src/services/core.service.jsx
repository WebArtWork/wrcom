
declare var window:any;
declare var cordova:any;

export const Core_Service =(router)=> {
	let host:any = window.location.host.toLowerCase();
	let	_afterWhile:any = {}; 
	let _cb:any = {};
	let _ids:any = {};
	let _done_next:any = {};
	let device:any;
	let version:any;

	var userAgent = navigator.userAgent || navigator.vendor || window.opera;
	if (/windows phone/i.test(userAgent)) {
		device = "windows";
	}else if (/android/i.test(userAgent)) {
		device = "android";
	}else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
		device = "ios";
	}else device = "web";

	window.core ={
	
		afterWhile:(doc, _cb, time=1000)=>{
			if(typeof doc == 'function'){
				_cb = doc;
				doc = 'common';
			}
			if(typeof doc == 'string'){
				if(!_afterWhile[doc]) _afterWhile[doc]={};
				doc = _afterWhile[doc];
			}
			if(typeof _cb == 'function' && typeof time == 'number'){
				clearTimeout(doc.__updateTimeout);
				doc.__updateTimeout = setTimeout(_cb, time);
			}
		},

		_serial_process: (i, arr, callback)=>{
			if(i>=arr.length) return callback();
			arr[i](()=>{
				_serial_process(++i, arr, callback);
			});
		},
		set_version:(version='1.0.0')=>{
			version = version;
			document.addEventListener('deviceready', () => {
				window.core.done('mobile');
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
			window.core._serial_process(0, arr, callback);
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
					window.core._serial_process(0, serialArr, callback);
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
					}
					let counter = arr.length;
					for (let i = 0; i < arr.length; i++) {
						serialArr.push(function(next){
							func(arr[i].each, arr[i].value, function(){
								if(--counter===0) callback();
								else next();
							}, i);
						});
					}
					window.core._serial_process(0, serialArr, callback);
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
		emit:(signal, doc:any={})=>{
			if(!_cb[signal]) _cb[signal] = {};
			for (let each in _cb[signal]){
				if(typeof _cb[signal][each] == 'function'){
					_cb[signal][each](doc);
				}
			}
		},
		on:(signal, _cb)=>{
			let id = Math.floor(Math.random() * Date.now()) + 1;
			if(_ids[id]) return on(signal, _cb);
			_ids[id]=true;
			if(!_cb[signal]) _cb[signal] = {};
			_cb[signal][id] = _cb;
			return ()=>{
				_cb[signal][id] = null;
			}
		},
		/* once Signal when something is ready */
		done:(signal)=> {
			_done_next[signal] = true;
		},
		ready:(signal)=>{ return _done_next[signal]; },
		next:(signal, _cb)=> {
			if(_done_next[signal]) _cb();
			else {
				return setTimeout(()=>{
					next(signal, _cb);
				}, 100);
			}
		}
	}
	window.core.set_version();
	return null

}
