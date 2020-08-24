import { FieldNameMappingEnum } from '@src/model/enum/MappingEnum.ts';

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
  // 产品初始化数据
  productInitData: {},
  // 关联的工单数量数据
  relevanceTaskCountData: {
    [FieldNameMappingEnum.Customer]: { all: 0, unfinished: 0 },
    [FieldNameMappingEnum.Product]: { all: 0, unfinished: 0 },
  },
  // 当前选择的工单类型
  selectedType: {},
  // 工单字段列表
  taskFields: [],
  taskValue: {},
  taskType: '',
}