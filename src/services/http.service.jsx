export const HTTP =()=>{
	window.http ={ 
			post: (url, doc, callback=(resp:any) => {}, opts:any={})=>{
				fetch(url, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(doc)
				}).then((resp)=>{
					return resp.json();
				}).then(callback);
			},
			get: (url, callback=(resp:any) => {}, opts:any={})=>{
				fetch(url, {
					method: 'GET'
				}).then((resp)=>{
					return resp.json();
				}).then(callback);
			}
	}
	return null;
}