import React from 'react'
import styles from './styles.module.css'
import {HTTP} from './services/http.service'
import {Render} from './services/render.service'
import {Hash_Service} from './services/hash.service'
import {Core_Service} from './services/core.service'
import {Store_Service} from './services/store_service'

export const HttpService =()=>{
	return <HTTP />
}
export const RenderService =()=>{
	return <Render />
}
export const HashService =()=>{
	return <Hash_Service />
}
export const CoreService =()=>{
	return <Core_Service />
}
export const StoreService =()=>{
	return <Store_Service />
}