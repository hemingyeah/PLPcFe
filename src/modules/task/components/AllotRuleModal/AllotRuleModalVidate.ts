/* interface */
import { RuleForm } from '@src/modules/task/components/AllotRuleModal/AllotRuleModalInterface'
import { RuleTypeEnum, AllotGroupEnum } from '@src/modules/task/components/AllotRuleModal/AllotRuleModalModel'

/* 效验方法 */
function validate(form: RuleForm): Promise<boolean> {
  let { name, groupType, groupData, order, type, typeData } = form
  return new Promise((resolve, reject) => {
    // 名称
    if (!name) {
      reject('请填写名称')
    }
    
    const NameReg = /^[a-zA-Z0-9\u4e00-\u9fa5]+$/
    if (!NameReg.test(name)) {
      reject('名称仅支持 中文、字母、数字')
    }
    
    // 规则类型
    if (!type) {
      reject('请选择规则类型')
    }
    
    // 规则类型 按照工单类型
    if (type === RuleTypeEnum.Type && typeData[RuleTypeEnum.Type].length <= 0) {
      reject('请选择工单类型条件')
    }
    
    // 规则类型 按照特定条件
    let { field, operator, value } = typeData[RuleTypeEnum.Select]
    if (type === RuleTypeEnum.Select && !(field && operator && value)) {
      reject('请选择条件')
    }
    
    // 规则类型 按客户所属团队
    let { tags } = typeData[RuleTypeEnum.Tag]
    if (type === RuleTypeEnum.Tag && tags.length <= 0) {
      reject('请选择客户团队')
    }
    
    // 分配给 指定人员
    if (groupType == AllotGroupEnum.User) {
      let isUsersEmpty = groupData[AllotGroupEnum.User].length <= 0
      isUsersEmpty ? reject('请选指定人员') : resolve(true)
    }
    
    // 分配给 指定角色
    if (groupType == AllotGroupEnum.Role) {
      let isRolesEmpty = groupData[AllotGroupEnum.Role].length <= 0
      isRolesEmpty ? reject('请选择指定角色') : resolve(true)
    }
    
    // 分配给 指定服务团队
    if (groupType == AllotGroupEnum.Tag) {
      let isTagsEmpty = groupData[AllotGroupEnum.Tag].length <= 0
      isTagsEmpty ? reject('请选择指定团队') : resolve(true)
    }
    
    // 分配给 指定服务团队主管
    if (groupType == AllotGroupEnum.TagLeader) {
      let isTagsEmpty = groupData[AllotGroupEnum.TagLeader].length <= 0
      isTagsEmpty ? reject('请选择团队主管所属团队') : resolve(true)
    }
    
    // 派单顺序
    if (!order) {
      reject('请选择派单顺序')
    }
    
    resolve(true)
  })
}

export default validate