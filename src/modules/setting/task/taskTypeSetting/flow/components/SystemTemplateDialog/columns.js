/** 公司字段 */
export const companyColumns = [
  {
    label: '名称',
    key: 'name',
  },
  {
    label: '电话',
    key: 'phone',
  },
  {
    label: '邮箱',
    key: 'email',
  },
  {
    label: '地址',
    key: 'address',
  },
  {
    label: '自助门户',
    key: 'portal',
  },
];

/** 客户字段 */
export const customerSysColumns = [
  {
    label: '产品',
    key: 'product',
  },
  {
    label: '地址',
    key: 'address',
  },
  {
    label: '联系人',
    key: 'linkman',
  }
];

/** 工单字段 */
export const taskColumns = [
  {
    label: '工单类型',
    key: 'templateName',
  },
  {
    label: '工单状态',
    key: 'state',
  },
  {
    label: '创建人',
    key: 'createUser',
  },
  {
    label: '派单人',
    key: 'allotUser',
  },
  {
    label: '负责人',
    key: 'executor',
  },
  {
    label: '协同人',
    key: 'synergies',
  },
  {
    label: '派单时间',
    key: 'allotTime',
  },
  {
    label: '创建时间',
    key: 'createTime',
  },
  {
    label: '开始时间',
    key: 'startTime',
  },
  {
    label: '完成时间',
    key: 'completeTime',
  },
];

/** 回执字段 */
export const receiptColumns = [
  {
    label: '备件',
    key: 'sparepart',
  },
  {
    label: '服务项目',
    key: 'service',
  },
  {
    label: '客户签名',
    key: 'autograph',
  }
];

/** 附加组件字段 */
export const cardSysColumns = [
  {
    label: '操作人',
    key: 'userName',
  },
  {
    label: '操作时间',
    key: 'updateTime',
  },
  {
    label: '行程距离',
    key: 'distance',
  }
];
