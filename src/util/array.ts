/** 
 * @description 取两个对象数组的交集
 * -- 临时写的，不是最优的方案
*/
export function objectArrayIntersection<T, U>(arr1: T[], arr2: U[], key: string = 'id', perferedLeft: boolean = false): any[] {
  if (arr1.length > arr2.length) return objectArrayIntersection(arr1, arr2, key, perferedLeft)
  
  let arr1Map: { [x: string]: T } = arr1.reduce((acc: any, item: any, index: number): any => {
    acc[item[key]] = item
    return acc
  }, {})
  
  let arr2Map: { [x: string]: U } = arr2.reduce((acc: any, item: any, index: number): any => {
    acc[item[key]] = item
    return acc
  }, {})
  
  let result: any[] = []
  
  for (let arr1Key in arr1Map) {
    let arr1MapItem: T = arr1Map[arr1Key]
    let arr2MapItem: U = arr2Map[arr1Key]
    
    if (arr2MapItem) {
      result.push(perferedLeft ? arr1MapItem : arr2MapItem)
      continue
    }
  }
  
  return result
}