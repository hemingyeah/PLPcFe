const catalogFieldFix = [
  {
    displayName: "目录层级",
    fieldName: "pathName",
    formType: "related_catalog",
    isExport: false,
    show: true,
    orderId: -1,
    isSystem: 1,
    onlyTable:true,
    tableName:"catalog",
  },
  {
    displayName: "产品视频",
    fieldName: "productVideo",
    formType: "attchment",
    isExport: false,
    show: true,
    orderId: -0.9,
    isSystem: 1,
    tableName:"catalog",
  },
  {
    displayName: "产品图片",
    fieldName: "productPic",
    formType: "attchment",
    isExport: false,
    show: true,
    orderId: -0.8,
    isSystem: 1,
    tableName:"catalog",
  },
  {
    displayName: "产品数量",
    fieldName: "productNum",
    formType: "text",
    isExport: true,
    show: true,
    isSystem: 1,
    tableName:"catalog",
  },
  {
    displayName: "创建人",
    fieldName: "createUserName",
    isExport: true,
    show: true,
    isSystem: 1,
    tableName:"catalog",
  },
  {
    displayName: "创建时间",
    fieldName: "createTime",
    isExport: true,
    show: true,
    isSystem: 1,
    tableName:"catalog",
  },
]

const catalogFieldFixForProduct = [
  {
    displayName: "产品视频",
    fieldName: "productVideo",
    formType: "attchment",
    isExport: false,
    show: true,
    orderId: -0.9,
    isSystem: 1,
    tableName:"catalog",
  },
  {
    displayName: "产品图片",
    fieldName: "productPic",
    formType: "attchment",
    isExport: false,
    show: true,
    orderId: -0.8,
    isSystem: 1,
    tableName:"catalog",
  },
  {
    displayName: "产品数量",
    fieldName: "productNum",
    formType: "text",
    isExport: true,
    show: true,
    isSystem: 1,
    tableName:"catalog",
  }
]

const productFieldFix = [
  {
    displayName: "最近更新",
    fieldName: "updateTime",
    formType: "date",
    isExport: false,
    isSystem: 1,
    tableName:"product",

  },
  {
    displayName: "产品模板",
    fieldName: "productTemplate",
    formType: "text",
    isExport: false,
    isSystem: 0,
    tableName:"product",
  },
  {
    displayName: "服务团队",
    fieldName: "tags",
    isExport: true,
    isSystem: 0,
    exportAlias: "customerTags",
    tableName:"product",
  },
  {
    displayName: "提醒数量",
    fieldName: "remindCount",
    isExport: false,
    isSystem: 0,
    tableName:"product",
  },
  {
    displayName: "创建人",
    fieldName: "createUser",
    isExport: true,
    isSystem: 0,
    tableName:"product",
  },
  {
    displayName: "创建时间",
    fieldName: "createTime",
    isExport: true,
    isSystem: 0,
    tableName:"product",
  },
]

export {
  catalogFieldFix,
  productFieldFix,
  catalogFieldFixForProduct
}