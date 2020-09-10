export default {
  props: {
    initData: {
      type: Object,
      default: () => ({})
    },
    shareData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      form: {}
    }
  },
  computed: {
    /** 
    * @description 工单详情数据
    */
    task() {
      return this.initData?.task || {};
    },
    /** 
    * @description 回执设置
    */
    receiptConfig() {
      return this.initData.receiptConfig || {};
    },
    /** 
    * @description 工单类型设置
    */
    taskType() {
      return this.initData.taskType || {};
    },
    /** 
    * @description 非自定义回执
    * 默认工单且未开启自定义回执(老功能)
    */
    notCustom() {
      return !this.receiptConfig?.customReceipt && this.task.templateId == '1';
    },
    /** 
    * @description 显示备件
    */
    showSparepart() {
      return this.notCustom || (!this.notCustom && this.receiptConfig.showSparepart);
    },
    /** 
    * @description 显示服务项目
    */
    showService() {
      return this.notCustom || (!this.notCustom && this.receiptConfig.showService);
    },
    /** 
    * @description 备件费用
    */
    sparepartTotal() {
      let { sparepart } = this.form;
      let total = 0;
      if (Array.isArray(sparepart)) {
        sparepart.forEach(item => {
          total += item.number * item.salePrice;
        })
      }

      return total.toFixed(2);
    },
    /** 
    * @description 服务费用
    */
    serviceTotal() {
      let { serviceIterm } = this.form;
      let total = 0;
      
      if (Array.isArray(serviceIterm)) {
        serviceIterm.forEach(item => {
          total += item.number * item.salePrice;
        })
      }

      return total.toFixed(2);
    },
    /** 
    * @description 费用总计
    */
    totalExpense() {
      let partExpense = Number(this.sparepartTotal);
      let serviceExpense = Number(this.serviceTotal);
      let disExpense = Math.abs(this.form.disExpense);

      return (partExpense + serviceExpense - disExpense).toFixed(2);
    },
    /** 
    * @description 费用合计数据
    */
    totalData() {
      let {sparepartTotal, serviceTotal, totalExpense } = this;
      let { disExpense } = this.form;
      
      return [{
        sparepartTotal,
        serviceTotal,
        disExpense,
        totalExpense
      }]
    },
    /**
    * @description 非自定义回执字段
    * 默认显示回执内容、系统附件、备件、服务项目
    */
    notCustomFields() {
      let { receiptAttNotNull, sparepartNotNull, serviceNotNull } = this.taskType?.options || {};

      return [{
        displayName: '回执内容',
        fieldName: 'receiptContent',
        formType: 'textarea',
        isNull: 0,
        isSystem: 1
      }, {
        displayName: '回执附件',
        fieldName: 'receiptAttachment',
        formType: 'receiptAttachment',
        isNull: receiptAttNotNull ? 0 : 1,
        isSystem: 1
      }, {
        displayName: '备件',
        fieldName: 'sparepart',
        formType: 'sparepart',
        isNull: sparepartNotNull ? 0 : 1,
        isSystem: 1
      }, {
        displayName: '服务项目',
        fieldName: 'serviceIterm',
        formType: 'serviceIterm',
        isNull: serviceNotNull ? 0 : 1,
        isSystem: 1
      }]
    }
  },
  methods: {
  }
}
