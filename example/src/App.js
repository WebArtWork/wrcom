import React from 'react'

import {HttpService, RenderService, HashService, CoreService, StoreService} from 'wrcom'
import 'wrcom/dist/index.css'

class App  extends React.Component{
	constructor (props){
		super(props)
		HttpService();
	}
	render(){
		return <div>
			{/*SERVICES*/}
			<HttpService/>
			<RenderService/>
			<HashService/>
			<CoreService/> 
			<StoreService/>

			{/*PAGES*/}

		</div>
	}
}

export default App
