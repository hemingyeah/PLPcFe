/* api */
import * as TaskApi from '@src/api/TaskApi.ts';



import {
  getProductMenuField,
  getPageInfo,
  delTreeList,
  productMenuStatistics
} from '@src/api/ProductV2Api.js';

/* util */
import AuthUtil from '@src/util/auth';
import Filter from '@src/filter/filter.js';
import {
  parse
} from '@src/util/querystring';
import {
  isShowReport,
  isShowCustomerRemind,
  isShowPlanTask
} from '@src/util/version.ts'


/* component */
import ProductMenuView from './components/ProductMenuView.vue';
import ProductMenuInfoRecord from './components/ProductMenuInfoRecord.vue';
import MiniTable from '@src/modules/productV2/productMenu/WorkTree/compoment/MiniTable';



/* mixin */
import tourGuide from '@src/mixins/tourGuide'

const ENCRYPT_FIELD_VALUE = '***';

const {
  TASK_GUIDE_DETAIL
} = require('@src/component/guide/taskV2Store');

export default {
  name: 'product-detail-view',
  inject: ['initData'],
  mixins: [tourGuide],
  data() {
    let id = this.$getUrlObj(window).id;
    return {
      loading: false,
      pending: false,
      collapse: true,
      task: {},
      dataInfo: {
        id
      },
      fieldHideIdArr: [],
      taskState: {
        value: this.initData?.task?.state || ''
      },
      fields: [], // 工单表单字段
      hasCallCenterModule: localStorage.getItem('call_center_module') == 1,
      leftActiveTab: 'product-view',
      rightActiveTab: 'part',
      collapseDirection: '',
      statistics:{},
      nowGuideStep: 5,
      guideSearchModelSave: false,
      guideDropdownMenu: false,
      isGuide: false,
    }
  },
  computed: {
    /** 
     * @description 客户字段 
     */
    customerField() {
      return this.fields.filter(f => f.fieldName === 'customer')[0];
    },
    /** 
     * @description 客户字段配置 
     */
    customerOption() {
      return this.customerField?.setting?.customerOption || {};
    },
    /* 是否可以查看客户详情 */
    canSeeCustomer() {
      return this.initData.canSeeCus;
    },
    /** 工单类型设置 */
    taskType() {
      return this.initData?.taskType || {};
    },
    /* 该登录账户是否是工单负责人 */
    isExecutor() {
      let executor = this.task.executor || {};
      return executor.userId == this.loginUser.userId;
    },
    /* 该登录账户是否是工单创建人 */
    isCreator() {
      let createUser = this.task.createUser || {};
      return createUser.userId == this.loginUser.userId;
    },
    /* 工单编辑权限 */
    editAuth() {
      return this.hasAuth('TASK_EDIT');
    },
    /** 
     * @description 允许打开客户详情
     */
    allowOpenCustomerView() {
      return !this.isEncryptField(this.customer.name) && this.canSeeCustomer;
    },
    /** 
     * @description 联系人
     */
    lmName() {
      let lmName = this.task.tlmName || this.customer.lmName;

      if (lmName) return this.isEncryptField(lmName) ? ENCRYPT_FIELD_VALUE : lmName;

      return '';
    },
    /** 
     * @description 联系电话
     */
    lmPhone() {
      let lmPhone = this.task.tlmPhone || this.customer.lmPhone;

      if (this.lmName) return this.isEncryptField(this.lmName) ? ENCRYPT_FIELD_VALUE : lmPhone;

      return '';
    },
    /** 
     * @description 显示拨打电话
     * 1. 开通呼叫中心
     * 2. 且联系人未加密
     */
    showCallPhone() {
      let notEncrypt = !this.isEncryptField(this.lmName);
      return this.lmPhone && this.hasCallCenterModule && notEncrypt;
    },
    /** 
     * @description 地址
     */
    address() {
      let {
        validAddress,
        taddress,
        isEncryptTaddress
      } = this.task;

      if (validAddress) return isEncryptTaddress ? ENCRYPT_FIELD_VALUE : Filter.prettyAddress(taddress);

      return '';
    },
    /**
     * @description 显示折叠按钮
     * 审核结算、客户评价、附加组件有任一存在即显示
     */
    showCollapse() {
      return true;
    },
    messageConfig() {
      return this.initData?.messageConfig || {};
    },
    showTaskRecordTemplate() {
      return this.messageConfig.taskRemark === true
    },
    /* 是否显示服务报告 根据版本控制的 */
    isShowReport() {
      return isShowReport()
    },



  },
  methods: {
    previousStep() {},
    nextStep() {
      this.nowGuideStep++;
    },
    stopStep() {
      this.nowGuideStep = this.detailSteps.length + 1;
    },
    // 是否含有某一指定权限
    hasAuth(keys) {
      // return AuthUtil.hasAuth(this.permission, keys);
    },
    // 编辑跳转
    goEdit() {
      const id = this.task.id;
      window.location.href = this.editAuth ? `/task/edit/${id}` : `/task/noFilterEdit/${id}`;
    },
    // DING
    ding(all = true) {
      let {
        id,
        taskNo,
        executor,
        synergies
      } = this.task;

      let users = [];
      users.push(executor.staffId);

      // 所有人(工单负责人和协同人)
      if (all && synergies && synergies.length) {
        synergies.forEach(item => users.push(item.staffId));
      }

      window.parent.send_link_ding_message(users, taskNo, id);
    },
    /** 
     * @description 打开客户详情
     */
    openCustomerView() {
      if (!this.allowOpenCustomerView) return;

      let fromId = window.frameElement.getAttribute('id');
      const customerId = this.customer.id;

      if (!customerId) return;

      this.$platform.openTab({
        id: `customer_view_${customerId}`,
        title: '客户详情',
        close: true,
        url: `/customer/view/${customerId}?noHistory=1`,
        fromId
      })
    },
    /**
     * @description 拨打电话
     */
    async makePhoneCall() {
      // 未开通呼叫中心
      if (!this.hasCallCenterModule) return;

      let phone = this.task.tlmPhone || this.customer.lmPhone;

      if (!phone) return;

      const result = await TaskApi.dialout({
        taskType: 'task',
        phone
      });
      if (result.code != 0) {
        return this.$platform.notification({
          title: '呼出失败',
          message: result.message || '',
          type: 'error',
        })
      }
    },
    /**
     * @description 是否加密字段
     */
    isEncryptField(value) {
      return value === ENCRYPT_FIELD_VALUE;
    },

    dleteData() {
      this.$confirm('此操作将删除该目录以及目录下所有的内容?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        delTreeList({
          ids: [this.dataInfo.id]
        }).then((res) => {
          if (res.code != 0) {
            this.$notify.error({
              title: '网络错误',
              message: res.message,
              duration: 2000,
            });
          } else {
            window.parent.flashSomePage({
              type: 'productV2_catalog_edit'
            })
            window.location.href = '/productV2/catalog/list'
          }
        }).catch()
      })
    },
    alterData() {
      this.$platform.openTab({
        id: 'productV2_catalog_edit',
        title: '产品目录编辑',
        close: true,
        url: `/productV2/catalog/edit?id=${this.dataInfo.id}`,
      })
    },
    creatData() {
      this.$platform.openTab({
        id: 'productV2_catalog_edit',
        title: '产品目录编辑',
        close: true,
        url: '/productV2/catalog/edit',
      })
    }



  },
  async created() {

    let getUrlObj = this.$getUrlObj(window);

    this.loading = true;
    getPageInfo({
      id: getUrlObj.id
    }).then(res => {
      if (res.code == 0) {
        res.result.catalogInfo.productVideo = res.result.catalogInfo.productVideo || []
        res.result.catalogInfo.productExplain = res.result.catalogInfo.productExplain || []
        this.$set(this, 'dataInfo', res.result.catalogInfo || {})
        this.fieldHideIdArr = res.result.selectField || [];
        this.$refs.producMmenuInfoRecord.initRecord(res.result.catalogInfo.id);
        getProductMenuField().then(res_ => {
          if (res_.code == 0) {

            let fields = res_.result || [];
            fields = fields.filter(item => {
              if (this.fieldHideIdArr.indexOf(item.id) < 0) {

                return item
              }
            })
            this.fields = [...fields];

            this.fields.forEach(field => {

              if (field.fieldName == 'attachment') {
                let {
                  isEncryptAttachment,
                  attachment
                } = this.task

                // 系统附件加密
                if (isEncryptAttachment) {
                  this.task.attachment = ENCRYPT_FIELD_VALUE;
                } else {
                  this.task.attachment = attachment.filter(item => !item.receipt);
                }
              }
            })
          }
        })
        productMenuStatistics({
          id: getUrlObj.id
        }).then(res_ => {
          try {
            this.statistics = res_.result
          } catch (error) {

          }

        })
      } else {
        this.$notify.error({
          title: '网络错误',
          message: res.message,
          duration: 2000,
        });
      }
    }).finally(() => {

      this.loading = false;
    })

    // 折叠面板缓存
    let collapse = sessionStorage.getItem(`product_menu_collapse_${getUrlObj.id}`);
    let collapseDirection = sessionStorage.getItem(`product_collapseDirection_${getUrlObj.id}`);
    this.collapse = JSON.parse(collapse || 'true');
    this.collapseDirection = collapseDirection || '';
  },
  async mounted() {



    // this.$nextTick(() => {
    //   setTimeout(() => {
    //     if (!storageGet(TASK_GUIDE_DETAIL)) this.$tours['myTour'].start(), this.nowGuideStep = 1, storageSet(TASK_GUIDE_DETAIL, '4');
    //   }, 1000)

    // })

  },
  beforeDestroy() {

  },
  watch: {
    collapse(newValue) {
      sessionStorage.setItem(`product_menu_collapse_${this.datainfo.id}`, newValue);
    },
    collapseDirection(newValue) {
      sessionStorage.setItem(`product_collapseDirection_${this.datainfo.id}`, newValue);
    }
  },
  components: {
    ProductMenuInfoRecord,
    ProductMenuView,
    MiniTable,
  }
}