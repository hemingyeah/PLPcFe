/** 
 * @description 通用返回码枚举
 * -- 抄后端的
*/
enum CommonResultCodeEnum {
  请求成功 = 0,
  /**
   * 服务端-系统错误: 500000-500999
  */
  系统繁忙 = 500001,
  系统错误 = 500002,
  服务提供方不存在 = 500003,
  /**
   * 客户端-参数错误: 400000-449999
  */
  参数有误 = 400001,
  数量已达上限 = 400002,
  DATA_COUNT_LIMIT = 400003,
  未登录或登录身份已过期 = 401001,
  登录身份已过期 = 401002,
  无效登录身份 = 401003,
  不能识别登录身份 = 401004,
  不能识别微信用户身份 = 401005,
  不能识别员工身份 = 401006,
  无效ID = 401007,
  ID转换出错 = 401008,
  不能识别后台用户身份 = 401009,
  租户ID不能为空 = 401010,
  未知操作符 = 401011,
  无权操作该数据 = 410012,
  没有数据权限 = 401012,
  对象不存在 = 401013,
  禁止删除 = 401014, 
  已结束 = 401015,
  获取授权信息失败 = 401016,
  发送模版消息失败 = 401017,
  取消微信授权开放平台 = 401018
}

export default CommonResultCodeEnum
