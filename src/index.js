import React from 'react'
import styles from './styles.module.css'
import {User} from './user_service'
import {HTTP} from './http.service'

// export const ExampleComponent = ({ text }) => {
//   return <div className={styles.test}>Example Component: {text}</div>
// }

export const UserList =()=>{
	return <User />
}

export const ExampleComponent =()=>{
	return <HTTP/>
}
