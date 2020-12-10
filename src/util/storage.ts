import StorageModuleEnum from '@model/enum/StorageModuleEnum'
import * as localForage from 'localforage'

localForage.config({
  name: 'shb-pc-fe'
})

export async function storageGet<T, K>(key: string, defaultValue: K, module: StorageModuleEnum,): Promise<T | K | string | null>{
  localForage.config({
    storeName: module
  })
  
  try {
    // 如果 key 不存在，getItem() 将返回 null
    let value: T | K | string | null = await localForage.getItem(key)
    if (value === null) {
      value = localStorage.getItem(`${module}-${key}`) || defaultValue
    }
    
    return value
    
  } catch (error) {
    console.error(`storageGet -> error ${error}`)
    return defaultValue
  }
}

type StorageSetType  = (
  Array<any> 
  | ArrayBuffer 
  | Blob 
  | Float32Array 
  | Float64Array 
  | Int8Array 
  | Int16Array 
  | Int32Array 
  | Number 
  | Object 
  | Uint8Array 
  | Uint16Array 
  | Uint32Array 
  | Uint8ClampedArray 
  | String
)

/** 
 * @description 设置存储
 *  注意此方法是异步执行的
*/
export function storageSet(key: string, value: StorageSetType, module: StorageModuleEnum,) {
  if(!key) return (
    console.warn('Caused: can not set storage, because not key')
  )
  
  localForage.config({
    storeName: module
  })
  
  try {
    localForage.setItem(key, value)
  } catch (error) {
    localStorage.setItem(`${module}-${key}`, JSON.stringify(value))
    console.error('stroageSet -> error', error)
  }
}