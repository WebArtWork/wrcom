import React from 'react'
import styles from './styles.module.css'
import {HTTP} from './services/http.service'
import {Render} from './services/render.service'
import {Hash_Service} from './services/hash.service'
import {Core_Service} from './services/core.service'
import {Store_Service} from './services/store.service'
import {Mongo_Service} from './services/mongo.service'

export const HttpService =()=>{
	return HTTP ()
}
export const RenderService =()=>{
	return Render ()
}
export const HashService =()=>{
	return Hash_Service ()
}
export const CoreService =(router)=>{
	return Core_Service(router)
}
export const StoreService =(config)=>{
	return Store_Service(config)
}
export const MongoService =()=>{
	return Mongo_Service ()
}