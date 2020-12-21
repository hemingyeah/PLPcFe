/* enum */
import StorageModuleEnum from '@model/enum/StorageModuleEnum'
/* util */
import * as localForage from 'localforage'
import { getRootWindow } from '@src/util/dom'
import Log from '@src/util/log.ts'

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

localForage.config({
  name: 'shb-pc-fe'
})

/** 
 * @description 获取用户id
*/
function getUserId(): string | null {  
  try {
    const RootWindow: any = getRootWindow(window)
    const RootWindowInitData = JSON.parse(RootWindow._init)
    
    return RootWindowInitData?.user?.userId || null
  } catch (error) {
    Log.error(error, getUserId.name)
    return null
  }
}

/** 
 * @description 获取存储key
*/
function getStorageKey(key: string): string {
  const userId: string | null = getUserId()
  return userId ? `${userId}-${key}` : key
}

export async function storageGet<T, K>(key: string, defaultValue: K, module: StorageModuleEnum,): Promise<T | K | string | null>{  
  try {
    localForage.config({
      storeName: module
    })
    
    let storageKey = getStorageKey(key)
    // 如果 key 不存在，getItem() 将返回 null
    let value: T | K | string | null = await localForage.getItem(storageKey)
    if (value === null) {
      value = localStorage.getItem(`${module}-${storageKey}`) || defaultValue
    }
    
    return value
    
  } catch (error) {
    console.error(`storageGet -> error ${error}`)
    return defaultValue
  }
}

/** 
 * @description 设置存储
 *  注意此方法是异步执行的
*/
export async function storageSet(key: string, value: StorageSetType, module: StorageModuleEnum): Promise<any> {
  if(!key) return (
    Log.warn('Caused: can not set storage, because not key', storageSet.name)
  )
  
  localForage.config({
    storeName: module
  })
  
  const storageKey = getStorageKey(key)
  
  Log.info(storageKey, `${storageSet.name} -> storageKey`)
  
  try {
    await localForage.setItem(storageKey, value, (error, value) => {
      Log.error(error, 'localForage.setItem')
      Log.info(value, 'localForage.setItem')
    })
  } catch (error) {
    localStorage.setItem(`${module}-${storageKey}`, JSON.stringify(value))
    console.error('stroageSet -> error', error)
  }
}