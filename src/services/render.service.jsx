export const Render=()=>{
	const places = {};
	window.render = {
		call: (place='')=>{
			if(place && typeof places[place] == 'function') places[place]();
			else if(!place){
				for (let each in places){
				    if(typeof places[each] == 'function') places[each]();
				}
			}
		},
		add: (place, render)=>{
			if(places[place]){
				return console.log('You already have this place');
			}
			places[place] = render;
		}
	}
	return null
}