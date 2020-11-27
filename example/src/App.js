import React from 'react'

import {HttpService, RenderService, CoreService, StoreService, HashService} from 'wrcom'
import 'wrcom/dist/index.css'


import ExamplePage from './pages/example_page'

class App  extends React.Component{
	constructor (props){
		super(props);
		StoreService({
			database: {
				collections: [{
					name: 'user',
					opts: {
						query: {
							admin: (doc)=>{
								return doc.is.admin;
							}
						},
						groups: {
							admin: (doc)=>{
								return doc.is.admin;
							}
						}
					}
				}]
			}
		});
	}
	render(){
		return <div>
	{/*SERVICES*/}
	<HttpService/>
	<RenderService/>
	<HashService/>
	<CoreService/> 

{/*PAGES*/}
<ExamplePage />
</div>
}
}

export default App
