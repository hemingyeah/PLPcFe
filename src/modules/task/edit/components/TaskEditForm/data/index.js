import { TaskFieldNameMappingEnum } from '@model/enum/FieldMappingEnum.ts';

export default {
  // 新建客户弹窗
  addCustomerDialog: false,
  // 新建产品弹窗
  addProductDialog: false,
  // 客户初始化数据
  customerInitData: {},
  // 是否创建客户
  isCreateCustomer: false,
  // 加载状态
  loading: false,
  planTimeDatePickeroptions: {
    disabledDate(time) {
      return time.getTime() < new Date(new Date().toLocaleDateString()).getTime()
    }
  },
  // 产品初始化数据
  productInitData: {},
  // 关联的工单数量数据
  relevanceTaskCountData: {
    [TaskFieldNameMappingEnum.Customer]: { all: 0, unfinished: 0 },
    [TaskFieldNameMappingEnum.Product]: { all: 0, unfinished: 0 },
  },
  // 当前选择的工单类型
  selectedType: {},
  // 工单字段列表
  taskFields: [],
  taskValue: {},
  taskType: '',
}