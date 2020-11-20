import React from 'react'

import {HttpService, RenderService, HashService, CoreService} from 'wrcom'
import 'wrcom/dist/index.css'

const App = () => {
 	return <div>
	 	<HttpService/>
	 	<RenderService/>
	 	<HashService/>
	 	<CoreService/>
 	 </div>
}

export default App
