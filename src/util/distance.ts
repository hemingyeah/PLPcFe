import Log from '@src/util/log.ts'

/**
 * @description js计算两个经纬度之间的距离
 * -- 网上抄的
 * @param {Number} lat1 纬度1
 * @param {Number} lng1 经度度1
 * @param {Number} lat2 纬度2
 * @param {Number} lat2 纬度2
 * @author      huangbaocheng
 * @date       2020/12/21 5:50 下午
 * @exception null
 * @return {number | null} 距离(KM)
 */
export function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number | null {
  // 不存在经纬度
  if (!lat1 || !lng1 || !lat2 || !lng2) return null
  
  try {
    let radLat1 = lat1 * Math.PI / 180.0
    let radLat2 = lat2 * Math.PI / 180.0
    let a = radLat1 - radLat2;
    let b = (lng1 * Math.PI / 180.0) - (lng2 * Math.PI / 180.0)
    let s = (
      2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2)
        + (Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2))))
    )
    // EARTH_RADIUS 地球半径
    s = s * 6378.137
    s = Math.round(s * 10000) / 10000
    
    return s
  } catch (error) {
    Log.error(error, getDistance.name)
    return null
  }
}

export default {
  getDistance
}