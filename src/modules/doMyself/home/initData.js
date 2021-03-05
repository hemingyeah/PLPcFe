// 部分需要权限数据的用户data  bodz
let initData = {
  customerAddress: {
    adProvince: '山东省',
    adCity: '青岛市',
    adDist: '市北区'
  },
  // 联客灰度控制
  openLinkC:true,
  isPhoneUnique: true,
  productConfig:{
    qrcodeEnabled:false
  },
  loginUser: {
    displayName: '薄德忠',
    tagIds: ['bda400f6-2ae1-11ea-bfc9-00163e304a25'],
    userId: '6839d043-683e-11ea-bfc9-00163e304a25',
    authorities: {
      TASK_ADD: 3,
      PRODUCT_CREATE: 3,
      CUSTOMER_CREATE: 3,
      VIP_PAYMENT_ONLINE: 3,
      TASK_BATCH_DISPATCH: 3,
      CASE_ADD: 3,
      SERVICE_CREATE: 3,
      CASE_VIEW: 3,
      TASK_EDIT: 3,
      TASK_FEEDBACK: 3,
      VIP_INFO_NOTICE_SELECT: 3,
      LOGIN_PC: 3,
      SMS_CONFIG: 3,
      VIP_INFO_NOTICE_CREATE: 3,
      SERVICE_EDIT: 3,
      PRODUCT_EDIT: 3,
      TASK_DISPATCH: 3,
      TASK_POOL: 3,
      VIP_REPORT_VIEW: 3,
      TASK_VIEW: 3,
      AUTH_STAFF: 3,
      AUTH_ROLE: 3,
      TASK_CLOSE: 3,
      TASK_BATCH_CLOSE: 3,
      VIP_SPAREPART_PERSION: 3,
      INFO_EDIT: 3,
      VIP_SPAREPART_INOUT: 3,
      TASK_AUDIT: 3,
      PRODUCT_VIEW: 3,
      CUSTOMER_DELETE: 3,
      CASE_DELETE: 3,
      INFO_VIEW: 3,
      EXPORT_IN: 3,
      VIP_APPROVE: 3,
      PART_EDIT: 3,
      SERVICE_VIEW: 3,
      CUSTOMER_VIEW: 3,
      VIP_SPAREPART_CREATE: 3,
      VIP_SPAREPART_VIEW: 3,
      CUSTOMER_PQRCODE: 3,
      TASK_DELETE: 3,
      VIP_TASK_PLAN: 3,
      PRODUCT_DELETE: 3,
      CASE_EDIT: 3,
      VIP_INFO_CREATE: 3,
      SYSTEM_SEETING: 3,
      LOGIN_YD: 3,
      VIP_SPAREPART_EDIT: 3,
      PART_VIEW: 3,
      AUTH_TAG: 3,
      VIP_SPAREPART_STOCK: 3,
      TASK_BATCH_AUDIT: 3,
      CUSTOMER_EDIT: 3
    },
    tagIdsWithChildTag: ['bda400f6-2ae1-11ea-bfc9-00163e304a25']
  },
  isDivideByTag: true,
  eventTypeList: [
    { name: '示例请求22', id: '23877caa-18b1-4ddb-a924-cb32bb9e1bcd' },
    { name: '示例服务请求', id: 'e7f21d83-9fe3-4559-8a61-5aa1b0743612' },
    { name: '客户报修', id: '4ee1f052-3aed-4836-bb90-5d12d6942e53' },
    { name: '客户问题反馈', id: '96e39dab-a18f-4750-9a28-1599a69c2634' },
    { name: '千一的事件类', id: '46272be1-ecc7-11e9-bfc9-00163e304a25' },
    { name: '示例服务请求', id: '817729dd-4345-4e75-90bc-3b7eee69923b' },
    { name: '移动端勿动2', id: '6dd88aab-d3ef-11e7-9070-00163e304a25' },
    { name: '事件关联产品', id: '1bbfe0af-51ae-11e8-8546-00163e304a25' },
    { name: '测试导出', id: '262110de-8353-11e8-8546-00163e304a25' },
    { name: '批量编辑测试', id: '2cacb95e-58f8-11e8-8546-00163e304a25' },
    { name: '用户报修', id: 'd53c53c1-3fd4-11e9-b3c6-00163e304a25' },
    { name: '服务请求', id: '01ec5304-d0ec-11e7-9070-00163e304a25' }
  ],
  taskTypeList: [
    { name: '6A', id: '4397bbbc-0596-4af6-9bb6-5c2d118fbfa6' },
    { name: '设备1', id: '8ec8db85-4913-4b60-be60-4414c134b1b3' },
    { name: '设备2', id: '6e026b55-2c38-40bc-8a92-e67f8edaec05' },
    { name: '临修', id: '2e946e41-f76f-4ed4-bf4b-4827c4e87959' },
    { name: '工单类型2', id: '31cdc36c-918d-4525-9ee8-73c89614a891' },
    { name: '设备维修', id: '379455d7-9fb1-426a-bbb9-aec5d54077d0' },
    { name: '测复制工单1', id: '15c10cee-a248-4bb8-bc1d-aa481da2dc41' },
    { name: '测复制工单2', id: '90167591-0f9e-4b04-8d38-78e713b19741' },
    { name: '设备巡检保养', id: 'da670a67-8891-4af3-b8bb-c86637600b78' },
    { name: '默认工单', id: '1' },
    { name: '工时记录测试', id: '9a4067e8-8d18-45d8-984d-52aa500da2fc' }
  ],
  id: 'cd876a41-8473-11ea-bfc9-00163e304a25',
  fieldInfo: [
    {
      id: 476,
      tenantId: '7416b42a-25cc-11e7-a500-00163e12f748',
      tableName: 'customer',
      isSystem: 1,
      fieldName: 'name',
      displayName: '客户',
      formType: 'text',
      defaultValue: null,
      isNull: 0,
      isSearch: 1,
      placeHolder: null,
      setting: { customerNameDuplicate: false },
      orderId: 0,
      isDelete: 0,
      guideProfessions: [],
      isGuideData: false,
      guideData: false
    },
    {
      id: 5460,
      tenantId: '7416b42a-25cc-11e7-a500-00163e12f748',
      tableName: 'customer',
      isSystem: 0,
      fieldName: 'field_qVjZ7ypyJwdgftRS',
      displayName: '客户信息',
      formType: 'separator',
      defaultValue: null,
      isNull: 1,
      isSearch: 0,
      placeHolder: null,
      setting: {},
      orderId: 1,
      isDelete: 0,
      guideProfessions: [],
      isGuideData: false,
      guideData: false
    },
    {
      id: 6402,
      tenantId: '7416b42a-25cc-11e7-a500-00163e12f748',
      tableName: 'customer',
      isSystem: 0,
      fieldName: 'field_bLPChW5va5UVisnz',
      displayName: '下拉菜单',
      formType: 'select',
      defaultValue: null,
      isNull: 1,
      isSearch: 1,
      placeHolder: null,
      setting: {
        isMulti: false,
        dataSource: ['选项1', '选项2', '选项3']
      },
      orderId: 2,
      isDelete: 0,
      guideProfessions: [],
      isGuideData: false,
      guideData: false
    },
    {
      id: 6424,
      tenantId: '7416b42a-25cc-11e7-a500-00163e12f748',
      tableName: 'customer',
      isSystem: 0,
      fieldName: 'field_bj1H8f8vueMCnRQp',
      displayName: '数字',
      formType: 'number',
      defaultValue: null,
      isNull: 1,
      isSearch: 0,
      placeHolder: null,
      setting: {},
      orderId: 3,
      isDelete: 0,
      guideProfessions: [],
      isGuideData: false,
      guideData: false
    },
    {
      id: 6408,
      tenantId: '7416b42a-25cc-11e7-a500-00163e12f748',
      tableName: 'customer',
      isSystem: 0,
      fieldName: 'field_U0smjGOSAh6wRyUK',
      displayName: '下拉菜单多选',
      formType: 'select',
      defaultValue: null,
      isNull: 1,
      isSearch: 0,
      placeHolder: null,
      setting: { isMulti: true, dataSource: ['选项1', '选项2'] },
      orderId: 4,
      isDelete: 0,
      guideProfessions: [],
      isGuideData: false,
      guideData: false
    },
    {
      id: 477,
      tenantId: '7416b42a-25cc-11e7-a500-00163e12f748',
      tableName: 'customer',
      isSystem: 1,
      fieldName: 'lmName',
      displayName: '联系人',
      formType: 'text',
      defaultValue: null,
      isNull: 0,
      isSearch: 1,
      placeHolder: null,
      setting: {},
      orderId: 5,
      isDelete: 0,
      guideProfessions: [],
      isGuideData: false,
      guideData: false
    },
    {
      id: 481,
      tenantId: '7416b42a-25cc-11e7-a500-00163e12f748',
      tableName: 'customer',
      isSystem: 1,
      fieldName: 'manager',
      displayName: '客户负责人',
      formType: 'user',
      defaultValue: null,
      isNull: 1,
      isSearch: 1,
      placeHolder: null,
      setting: {},
      orderId: 6,
      isDelete: 0,
      guideProfessions: [],
      isGuideData: false,
      guideData: false
    },
    {
      id: 475,
      tenantId: '7416b42a-25cc-11e7-a500-00163e12f748',
      tableName: 'customer',
      isSystem: 1,
      fieldName: 'serialNumber',
      displayName: '客户编号',
      formType: 'text',
      defaultValue: null,
      isNull: 0,
      isSearch: 1,
      placeHolder: null,
      setting: { autoSerialNumber: false },
      orderId: 7,
      isDelete: 0,
      guideProfessions: [],
      isGuideData: false,
      guideData: false
    },
    {
      id: 479,
      tenantId: '7416b42a-25cc-11e7-a500-00163e12f748',
      tableName: 'customer',
      isSystem: 1,
      fieldName: 'customerAddress',
      displayName: '地址',
      formType: 'address',
      defaultValue: null,
      isNull: 1,
      isSearch: 1,
      placeHolder: null,
      setting: {
        customerAddressConfig: {
          adCity: '青岛市',
          adDist: '市北区',
          adProvince: '山东省'
        }
      },
      orderId: 8,
      isDelete: 0,
      guideProfessions: [],
      isGuideData: false,
      guideData: false
    },
    {
      id: 6404,
      tenantId: '7416b42a-25cc-11e7-a500-00163e12f748',
      tableName: 'customer',
      isSystem: 0,
      fieldName: 'field_8VP8tn2kO7lRnEkv',
      displayName: '基础地址',
      formType: 'address',
      defaultValue: null,
      isNull: 1,
      isSearch: 1,
      placeHolder: null,
      setting: {},
      orderId: 9,
      isDelete: 0,
      guideProfessions: [],
      isGuideData: false,
      guideData: false
    },
    {
      id: 478,
      tenantId: '7416b42a-25cc-11e7-a500-00163e12f748',
      tableName: 'customer',
      isSystem: 1,
      fieldName: 'lmPhone',
      displayName: '电话',
      formType: 'phone',
      defaultValue: null,
      isNull: 0,
      isSearch: 1,
      placeHolder: null,
      setting: { phoneUnique: true },
      orderId: 10,
      isDelete: 0,
      guideProfessions: [],
      isGuideData: false,
      guideData: false
    },
    {
      id: 480,
      tenantId: '7416b42a-25cc-11e7-a500-00163e12f748',
      tableName: 'customer',
      isSystem: 1,
      fieldName: 'tags',
      displayName: '服务部门',
      formType: 'select',
      defaultValue: null,
      isNull: 0,
      isSearch: 1,
      placeHolder: null,
      setting: { isMulti: true, dataSource: ['选项1'] },
      orderId: 11,
      isDelete: 0,
      guideProfessions: [],
      isGuideData: false,
      guideData: false
    },
    {
      id: 6409,
      tenantId: '7416b42a-25cc-11e7-a500-00163e12f748',
      tableName: 'customer',
      isSystem: 0,
      fieldName: 'field_Plk9diJJ0YiKbRgy',
      displayName: '日期时间',
      formType: 'datetime',
      defaultValue: null,
      isNull: 1,
      isSearch: 1,
      placeHolder: null,
      setting: {},
      orderId: 12,
      isDelete: 0,
      guideProfessions: [],
      isGuideData: false,
      guideData: false
    },
    {
      id: 6426,
      tenantId: '7416b42a-25cc-11e7-a500-00163e12f748',
      tableName: 'customer',
      isSystem: 0,
      fieldName: 'field_FRLhMOVIYMJlsZBp',
      displayName: '邮箱',
      formType: 'email',
      defaultValue: null,
      isNull: 0,
      isSearch: 1,
      placeHolder: null,
      setting: {},
      orderId: 13,
      isDelete: 0,
      guideProfessions: [],
      isGuideData: false,
      guideData: false
    },
    {
      id: 6440,
      tenantId: '7416b42a-25cc-11e7-a500-00163e12f748',
      tableName: 'customer',
      isSystem: 0,
      fieldName: 'field_8kGakNxACnUMMd6a',
      displayName: '多行文本',
      formType: 'textarea',
      defaultValue: null,
      isNull: 1,
      isSearch: 0,
      placeHolder: null,
      setting: {},
      orderId: 14,
      isDelete: 0,
      guideProfessions: [],
      isGuideData: false,
      guideData: false
    },
    {
      id: 6441,
      tenantId: '7416b42a-25cc-11e7-a500-00163e12f748',
      tableName: 'customer',
      isSystem: 0,
      fieldName: 'field_M4rWkLWnKa2pCSi3',
      displayName: '单行文本',
      formType: 'text',
      defaultValue: null,
      isNull: 1,
      isSearch: 0,
      placeHolder: null,
      setting: {},
      orderId: 15,
      isDelete: 0,
      guideProfessions: [],
      isGuideData: false,
      guideData: false
    },
    {
      id: 6442,
      tenantId: '7416b42a-25cc-11e7-a500-00163e12f748',
      tableName: 'customer',
      isSystem: 0,
      fieldName: 'field_rkR1aZqksfhNtd6P',
      displayName: '电话',
      formType: 'phone',
      defaultValue: null,
      isNull: 1,
      isSearch: 0,
      placeHolder: null,
      setting: {},
      orderId: 16,
      isDelete: 0,
      guideProfessions: [],
      isGuideData: false,
      guideData: false
    },
    {
      id: 6445,
      tenantId: '7416b42a-25cc-11e7-a500-00163e12f748',
      tableName: 'customer',
      isSystem: 0,
      fieldName: 'field_qzAW7q9KarNYhzjq',
      displayName: '测试人员',
      formType: 'user',
      defaultValue: null,
      isNull: 1,
      isSearch: 0,
      placeHolder: null,
      setting: {},
      orderId: 17,
      isDelete: 0,
      guideProfessions: [],
      isGuideData: false,
      guideData: false
    },
    {
      id: 6443,
      tenantId: '7416b42a-25cc-11e7-a500-00163e12f748',
      tableName: 'customer',
      isSystem: 0,
      fieldName: 'field_tnvUH0mb46qYcrKW',
      displayName: '下拉菜单',
      formType: 'select',
      defaultValue: null,
      isNull: 1,
      isSearch: 0,
      placeHolder: null,
      setting: { isMulti: false, dataSource: ['选项1'] },
      orderId: 18,
      isDelete: 0,
      guideProfessions: [],
      isGuideData: false,
      guideData: false
    }
  ],
  isAddressAllowNull: true,
  planTaskEnabled: true
}
export default initData