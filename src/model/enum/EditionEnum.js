/**
 * 版本信息
 */
import BaseEnum from './BaseEnum';

/**
 * @class 版本信息
 * @extends BaseEnum
 */
class Edition extends BaseEnum{
  /**
   * @constructor
   */
  constructor(){
    super();

    /**
     * 基础版
     */
    this.BASIC = {
      name: 'basic',
      value: 1
    };

    /**
     * vip版
     */
    this.VIP = {
      name: 'vip',
      value: 2
    };

    /**
     * 旗舰版
     */
    this.ULTIMATE = {
      name: 'ultimate',
      value: 3
    }
  }

  /**
   * 判断当前的版本是否包含指定的版本
   * @param {number} origin 当前版本
   * @param {number} target 要检测的版本
   */
  include(origin, target){
    return origin >= target;
  }
}

export default new Edition;