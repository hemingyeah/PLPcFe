import * as localForage from 'localforage'

localForage.config({
  name: 'shb',
  storeName: 'pc-fe'
})

export async function storageGet<T, K>(key: string, defaultValue: K): Promise<T | K | string | null>{
  try {
    // 如果 key 不存在，getItem() 将返回 null
    let value: T | K | string | null = await localForage.getItem(key)
    if (value === null) {
      value = localStorage.getItem(key) || defaultValue
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
export function storageSet(key: string, value: StorageSetType) {
  if(!key) return (
    console.warn('Caused: can not set storage, because not key')
  )
  
  try {
    localForage.setItem(key, value)
  } catch (error) {
    localStorage.setItem(key, JSON.stringify(value))
    console.error('stroageSet -> error', error)
  }
}