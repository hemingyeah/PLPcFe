import PageModel from '@model/entity/PageModel'
import Condition from '@model/entity/Condition'

/* 基本查询 */
interface BaseSearchModel extends PageModel {
  // 自定义字段查询条件
  conditions: Condition[];
}

export default BaseSearchModel