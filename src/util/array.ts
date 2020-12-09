/** 
 * @description 取两个对象数组的交集
 * -- 临时写的，不是最优的方案
*/
export function objectArrayIntersection<T, U>(arr1: T[], arr2: U[], key: string = 'id', perferedLeft: boolean = false): any[] {
  if (arr1.length > arr2.length) return objectArrayIntersection(arr1, arr2, key, perferedLeft)
  
  let arr1Map: { [x: string]: T } = arr1.reduce((acc: any, item: any): any => {
    acc[item[key]] = item
    return acc
  }, {})
  
  let arr2Map: { [x: string]: U } = arr2.reduce((acc: any, item: any): any => {
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

function setIntersection<T>(set1: Set<T>, set2: Set<T>): T[] {
  if (set1.size > set2.size) return setIntersection(set2, set1)
  
  const intersection = new Set<T>()
  
  for (let item of set1) {
    if (set2.has(item)) {
      intersection.add(item)
    }
  }
  
  return [...intersection]
}

/** 
 * @description 取两个字符串数组的交集
 * -- 临时写的，不是最优的方案
*/
export function stringArrayIntersection(arr1: string[], arr2: string[]): string[] {
  const set1 = new Set<string>(arr1)
  const set2 = new Set<string>(arr2)
  
  return setIntersection<string>(set1, set2)
}
