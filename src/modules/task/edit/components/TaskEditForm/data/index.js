import { TaskFieldNameMappingEnum } from '@model/enum/FieldMappingEnum.ts';

export default {
  // 新建客户弹窗
  addCustomerDialog: false,
  // 新建产品弹窗
  addProductDialog: false,
  // 客户初始化数据
  customerInitData: {},
  // 客户地址数据列表
  customerAddressOptions: [],
  // 客户联系人数据地址
  customerLinkmanOptions: [],
  // 是否创建客户
  isCreateCustomer: false,
  // 加载状态
  loading: false,
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