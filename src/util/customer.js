//
function formatCustomer(originalCustomer) {
  const {
    name,
    serialNumber,
    lmName,
    lmPhone,
    tag,
    customerManager,
    customerAddress,
  } = originalCustomer;
  const keys = Object.keys(originalCustomer);
  const notSysFields = keys.filter(k => /^field_.+/g.test(k) && originalCustomer[k]);
  let customer = {};
  let attribute = {};

  notSysFields.forEach(key => {
    attribute[key] = originalCustomer[key];
  });

  customer = {
    id: null,
    name: name,
    serialNumber: serialNumber,
    lmName: lmName,
    lmPhone: lmPhone,
    attribute,
  };

  if (tag && Array.isArray(tag) && tag.length) {
    customer.tag = tag;
  }

  if (customerManager && customerManager.userId) {
    customer.customerManager = customerManager.userId;
    customer.customerManagerName = customerManager.displayName || null;
  }

  customer.customerAddress = {
    ...customerAddress,
    adCountry: '',
    addressType: 0,
  }

  return customer;
}

export default formatCustomer;

//
//
// let customer = {
//   attribute: {
//     field_6gOv2Tq7: ["选项1", "选项2"],
//     field_XzsqzdRe: [{
//       fileSize: "196.17KB",
//       filename: "20feb0043f4af27fdeb3b52b6f9103cc-董-2018-09-21.jpg",
//       id: "bc3d4d88-bd8a-11e8-b3c6-00163e304a25",
//       url: "/files/get?fileId=bc3d4d88-bd8a-11e8-b3c6-00163e304a25",
//       field_gF2uHmI4: "单选1"
//     }],
//     field_tdaMB58A: {
//       displayName: "null",
//       head: "",
//       staffId: "10161161493392903",
//       userId: "93d4b260-91ea-11e7-9789-00163e304a25",
//     }
//   },
//   customerAddress: {
//     adAddress: "延安西路889号",
//     adCity: "市辖区",
//     adCountry: "",
//     adDist: "长宁区",
//     adProvince: "上海市",
//     addressType: 0,
//   },
//   customerManager: "c05e1543-93d9-11e7-9789-00163e304a25",
//   customerManagerName: "13356880540",
//   id: null,
//   lmName: "客户test",
//   lmPhone: "13113131",
//   name: "客户test",
//   serialNumber: "客户编号",
//   tag: [{
//     id: "df24d049-4666-11e7-a318-00163e304a25",
//     tagName: "测试团队1"
//   }, {
//     id: "c0ff60df-61ff-11e7-a318-00163e304a25",
//     tagName: "巨龙客服深圳班"
//   }]
//
//
// };


