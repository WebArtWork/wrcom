import React from 'react'

import {HttpService, RenderService, HashService, CoreService, StoreService} from 'wrcom'
import 'wrcom/dist/index.css'
import DefaultPage from './pages/default_page'

class App  extends React.Component{
	constructor (props){
		super(props)
		HttpService();
	}
	render(){
		return <div>
			<HttpService/>
			<RenderService/>
			<HashService/>
			<CoreService/> 
			<StoreService/>

			<DefaultPage />
		</div>
	}
}

export default App
