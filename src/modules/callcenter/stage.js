import Vue from '@src/common/entry';
import CallCenter from './views/Stage.vue';
import http from '@src/util/http';

Vue.prototype.$http = http;
Vue.prototype.$eventBus = new Vue();
// 处理注入的参数
let initData = {};

try {
  initData = {'eventTypeList':[
    {
      'name':'示例请求22',
      'id':'23877caa-18b1-4ddb-a924-cb32bb9e1bcd'
    }
  ],
  'taskTypeList':[
    {
      'name':'移动端测试',
      'id':'2aa27be8-bd40-4e38-9669-26bc956e263b'
    }
  ], 'customerAddress':{'adProvince':'山东省', 'adCity':'青岛市', 'adDist':'市北区'}, 'isPhoneUnique':false, 'teamsWithChildTag':[], 'loginUser':{'displayName':'蔡大海', 'tagIds':[], 'userId':'5316a99d-14ac-11ea-a9f3-506b4b2bb4ae', 'authorities':{'TASK_ADD':3, 'PRODUCT_CREATE':3, 'CUSTOMER_CREATE':3, 'VIP_PAYMENT_ONLINE':3, 'TASK_BATCH_DISPATCH':3, 'CASE_ADD':3, 'SERVICE_CREATE':3, 'CASE_VIEW':3, 'TASK_EDIT':3, 'TASK_FEEDBACK':3, 'VIP_INFO_NOTICE_SELECT':3, 'LOGIN_PC':3, 'VIP_INFO_NOTICE_CREATE':3, 'SERVICE_EDIT':3, 'PRODUCT_EDIT':3, 'TASK_DISPATCH':3, 'TASK_POOL':3, 'VIP_REPORT_VIEW':3, 'TASK_VIEW':3, 'AUTH_STAFF':3, 'AUTH_ROLE':3, 'TASK_CLOSE':3, 'TASK_BATCH_CLOSE':3, 'VIP_SPAREPART_PERSION':3, 'INFO_EDIT':3, 'VIP_SPAREPART_INOUT':3, 'TASK_AUDIT':3, 'PRODUCT_VIEW':3, 'CUSTOMER_DELETE':3, 'CASE_DELETE':3, 'INFO_VIEW':3, 'EXPORT_IN':3, 'VIP_APPROVE':3, 'PART_EDIT':3, 'SERVICE_VIEW':3, 'CUSTOMER_VIEW':3, 'VIP_SPAREPART_CREATE':3, 'VIP_SPAREPART_VIEW':3, 'CUSTOMER_PQRCODE':3, 'TASK_DELETE':3, 'VIP_TASK_PLAN':3, 'PRODUCT_DELETE':3, 'CASE_EDIT':3, 'VIP_INFO_CREATE':3, 'SYSTEM_SEETING':3, 'LOGIN_YD':3, 'VIP_SPAREPART_EDIT':3, 'PART_VIEW':3, 'AUTH_TAG':3, 'VIP_SPAREPART_STOCK':3, 'TASK_BATCH_AUDIT':3, 'CUSTOMER_EDIT':3}, 'tagIdsWithChildTag':[]}, 'isDivideByTag':true, 'isCustomerNameDuplicate':false, 'isAutoSerialNumber':true, 'action':'create', 'fieldInfo':[{'id':50, 'tenantId':'7416b42a-25cc-11e7-a500-00163e12f748', 'tableName':'customer', 'isSystem':1, 'fieldName':'serialNumber', 'displayName':'客户编号', 'formType':'text', 'defaultValue':null, 'isNull':0, 'isSearch':1, 'placeHolder':null, 'setting':{'autoSerialNumber':true, 'serialNumberUnique':false}, 'orderId':0, 'isDelete':0, 'guideProfessions':[], 'isGuideData':false, 'guideData':false}, {'id':51, 'tenantId':'7416b42a-25cc-11e7-a500-00163e12f748', 'tableName':'customer', 'isSystem':1, 'fieldName':'name', 'displayName':'客户', 'formType':'text', 'defaultValue':null, 'isNull':0, 'isSearch':1, 'placeHolder':null, 'setting':{'customerNameDuplicate':false}, 'orderId':1, 'isDelete':0, 'guideProfessions':[], 'isGuideData':false, 'guideData':false}, {'id':53, 'tenantId':'7416b42a-25cc-11e7-a500-00163e12f748', 'tableName':'customer', 'isSystem':1, 'fieldName':'lmPhone', 'displayName':'电话', 'formType':'phone', 'defaultValue':null, 'isNull':0, 'isSearch':1, 'placeHolder':null, 'setting':{'phoneUnique':false}, 'orderId':2, 'isDelete':0, 'guideProfessions':[], 'isGuideData':false, 'guideData':false}, {'id':178534, 'tenantId':'7416b42a-25cc-11e7-a500-00163e12f748', 'tableName':'customer', 'isSystem':0, 'fieldName':'field_4f9h5nGAlIBiIpi0', 'displayName':'日期', 'formType':'date', 'defaultValue':null, 'isNull':1, 'isSearch':0, 'placeHolder':null, 'setting':{}, 'orderId':3, 'isDelete':0, 'guideProfessions':[], 'isGuideData':false, 'guideData':false}, {'id':178874, 'tenantId':'7416b42a-25cc-11e7-a500-00163e12f748', 'tableName':'customer', 'isSystem':0, 'fieldName':'field_ey6xgu2cBNou4oZS', 'displayName':'附件', 'formType':'attachment', 'defaultValue':null, 'isNull':1, 'isSearch':0, 'placeHolder':null, 'setting':{}, 'orderId':4, 'isDelete':0, 'guideProfessions':[], 'isGuideData':false, 'guideData':false}, {'id':178535, 'tenantId':'7416b42a-25cc-11e7-a500-00163e12f748', 'tableName':'customer', 'isSystem':0, 'fieldName':'field_56hPg7y4hTg8lXkI', 'displayName':'这个字段', 'formType':'text', 'defaultValue':null, 'isNull':1, 'isSearch':0, 'placeHolder':null, 'setting':{}, 'orderId':5, 'isDelete':0, 'guideProfessions':[], 'isGuideData':false, 'guideData':false}, {'id':52, 'tenantId':'7416b42a-25cc-11e7-a500-00163e12f748', 'tableName':'customer', 'isSystem':1, 'fieldName':'lmName', 'displayName':'联系人', 'formType':'text', 'defaultValue':null, 'isNull':0, 'isSearch':1, 'placeHolder':null, 'setting':{}, 'orderId':6, 'isDelete':0, 'guideProfessions':[], 'isGuideData':false, 'guideData':false}, {'id':54, 'tenantId':'7416b42a-25cc-11e7-a500-00163e12f748', 'tableName':'customer', 'isSystem':1, 'fieldName':'customerAddress', 'displayName':'地址', 'formType':'address', 'defaultValue':null, 'isNull':0, 'isSearch':1, 'placeHolder':null, 'setting':{'customerAddressConfig':{'adCity':'青岛市', 'adDist':'市北区', 'adProvince':'山东省'}}, 'orderId':7, 'isDelete':0, 'guideProfessions':[], 'isGuideData':false, 'guideData':false}, {'id':165186, 'tenantId':'7416b42a-25cc-11e7-a500-00163e12f748', 'tableName':'customer', 'isSystem':0, 'fieldName':'field_iQvCdFadYDXAY6U6', 'displayName':'人员', 'formType':'user', 'defaultValue':null, 'isNull':1, 'isSearch':0, 'placeHolder':null, 'setting':{}, 'orderId':8, 'isDelete':0, 'guideProfessions':[], 'isGuideData':false, 'guideData':false}, {'id':169746, 'tenantId':'7416b42a-25cc-11e7-a500-00163e12f748', 'tableName':'customer', 'isSystem':0, 'fieldName':'field_a04juKtIZiG8PSbA', 'displayName':'科室', 'formType':'text', 'defaultValue':null, 'isNull':1, 'isSearch':1, 'placeHolder':null, 'setting':{}, 'orderId':9, 'isDelete':0, 'guideProfessions':[], 'isGuideData':false, 'guideData':false}, {'id':164999, 'tenantId':'7416b42a-25cc-11e7-a500-00163e12f748', 'tableName':'customer', 'isSystem':0, 'fieldName':'field_o4hkgYKKb3bHTlQj', 'displayName':'送货日期', 'formType':'date', 'defaultValue':null, 'isNull':1, 'isSearch':0, 'placeHolder':null, 'setting':{}, 'orderId':10, 'isDelete':0, 'guideProfessions':[], 'isGuideData':false, 'guideData':false}, {'id':56, 'tenantId':'7416b42a-25cc-11e7-a500-00163e12f748', 'tableName':'customer', 'isSystem':1, 'fieldName':'manager', 'displayName':'客户负责人', 'formType':'user', 'defaultValue':null, 'isNull':1, 'isSearch':1, 'placeHolder':null, 'setting':{}, 'orderId':11, 'isDelete':0, 'guideProfessions':[], 'isGuideData':false, 'guideData':false}, {'id':55, 'tenantId':'7416b42a-25cc-11e7-a500-00163e12f748', 'tableName':'customer', 'isSystem':1, 'fieldName':'tags', 'displayName':'服务团队', 'formType':'select', 'defaultValue':null, 'isNull':1, 'isSearch':1, 'placeHolder':null, 'setting':{'isMulti':true, 'dataSource':['选项1']}, 'orderId':12, 'isDelete':0, 'guideProfessions':[], 'isGuideData':false, 'guideData':false}, {'id':165000, 'tenantId':'7416b42a-25cc-11e7-a500-00163e12f748', 'tableName':'customer', 'isSystem':0, 'fieldName':'field_Oes5bvkaZV6sdFGF', 'displayName':'说明', 'formType':'textarea', 'defaultValue':null, 'isNull':1, 'isSearch':0, 'placeHolder':null, 'setting':{}, 'orderId':13, 'isDelete':0, 'guideProfessions':[], 'isGuideData':false, 'guideData':false}, {'id':167394, 'tenantId':'7416b42a-25cc-11e7-a500-00163e12f748', 'tableName':'customer', 'isSystem':0, 'fieldName':'field_rWNFXxg5tYiisZHU', 'displayName':'合同编号', 'formType':'text', 'defaultValue':null, 'isNull':1, 'isSearch':1, 'placeHolder':null, 'setting':{}, 'orderId':14, 'isDelete':0, 'guideProfessions':[], 'isGuideData':false, 'guideData':false}, {'id':169837, 'tenantId':'7416b42a-25cc-11e7-a500-00163e12f748', 'tableName':'customer', 'isSystem':0, 'fieldName':'field_r0O4NkmlmOsnwKyz', 'displayName':'固话', 'formType':'phone', 'defaultValue':null, 'isNull':1, 'isSearch':0, 'placeHolder':null, 'setting':{}, 'orderId':15, 'isDelete':0, 'guideProfessions':[], 'isGuideData':false, 'guideData':false}, {'id':169843, 'tenantId':'7416b42a-25cc-11e7-a500-00163e12f748', 'tableName':'customer', 'isSystem':0, 'fieldName':'field_f5ynplF6OGTDOpEg', 'displayName':'客户类型', 'formType':'select', 'defaultValue':null, 'isNull':1, 'isSearch':1, 'placeHolder':null, 'setting':{'isMulti':false, 'dataSource':['医院', '工厂', '餐厅']}, 'orderId':16, 'isDelete':0, 'guideProfessions':[], 'isGuideData':false, 'guideData':false}, {'id':172626, 'tenantId':'7416b42a-25cc-11e7-a500-00163e12f748', 'tableName':'customer', 'isSystem':0, 'fieldName':'field_pPwabtMkNFtVk1vC', 'displayName':'地址', 'formType':'address', 'defaultValue':null, 'isNull':1, 'isSearch':0, 'placeHolder':null, 'setting':{}, 'orderId':17, 'isDelete':0, 'guideProfessions':[], 'isGuideData':false, 'guideData':false}], 'isAddressAllowNull':false, 'seeAllOrg':false, 'tags':[{'places':[], 'id':'49e882ea-9c91-11e9-8123-7cd30abca02e', 'tagName':'青岛团队'}, {'places':[], 'id':'a532181d-ac51-11e9-8123-7cd30abca02e', 'tagName':'孙冲团队'}, {'places':[], 'id':'e9c2d52a-ac77-11e9-8123-7cd30abca02e', 'tagName':'孙冲团队2'}, {'places':[], 'id':'b8201f95-af6b-11e9-8123-7cd30abca02e', 'tagName':'上海团队'}, {'places':[], 'id':'c78ca47e-b425-11e9-8123-7cd30abca02e', 'tagName':'北京团队'}, {'places':[], 'id':'0e78323c-b426-11e9-8123-7cd30abca02e', 'tagName':'使徒行者'}, {'places':[], 'id':'bf593dc0-ba4a-11e9-bf0c-506b4b2bb4ae', 'tagName':'广州团队'}, {'places':[], 'id':'2d2ffb51-ba6c-11e9-bf0c-506b4b2bb4ae', 'tagName':'杭州150团队'}, {'places':[], 'id':'071f50ad-c03d-11e9-bf0c-506b4b2bb4ae', 'tagName':'湖北团队'}, {'places':[], 'id':'9cff2f8b-e348-11e9-9cb1-506b4b2bb4ae', 'tagName':'审批团队'}, {'places':[], 'id':'bc3df14f-1182-11ea-a9f3-506b4b2bb4ae', 'tagName':'SunTeam'}, {'places':[{'province':'浙江省', 'city':'杭州市', 'dist':'余杭区'}, {'province':'浙江省', 'city':'杭州市', 'dist':'淳安县'}], 'id':'0589021c-284e-11ea-9980-506b4b2bb4ae', 'tagName':'杭州余杭团队'}, {'places':[], 'id':'79868257-2d2e-11ea-9980-506b4b2bb4ae', 'tagName':'青岛子团队'}, {'places':[{'province':'湖北省', 'city':'武汉市', 'dist':null}], 'id':'f32b3015-4360-11ea-a544-506b4b2bb4ae', 'tagName':'武汉团队'}, {'places':[], 'id':'76175cda-5d28-11ea-a544-506b4b2bb4ae', 'tagName':'服务团队'}, {'places':[], 'id':'86ac6865-5d28-11ea-a544-506b4b2bb4ae', 'tagName':'上门服务团队'}, {'places':[], 'id':'038d2f56-6736-11ea-a544-506b4b2bb4ae', 'tagName':'测试1'}, {'places':[], 'id':'21fd8ab7-7482-11ea-a030-7cd30aeb74d8', 'tagName':'杭州KA'}, {'places':[{'province':'浙江省', 'city':'杭州市', 'dist':'上城区'}, {'province':'浙江省', 'city':'杭州市', 'dist':'下城区'}], 'id':'d48f4168-7dfa-11ea-a030-7cd30aeb74d8', 'tagName':'陶然测试团队'}]};
} catch (error) {
  console.error(error);
  console.error('no init data')
}

const CallCenterComp = Vue.extend(CallCenter);
const app = new Vue({
  provide: {
    initData: Object.freeze(initData)
  },
  render: h => h(CallCenterComp),
  el: '#app'
});


export default app;