export default {
  props: {
    initData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      fields: [],
      form: {}
    }
  },
  computed: {
    /** 
    * @description 回执设置
    */
    receiptConfig() {
      return this.initData.receiptConfig || {};
    },
    /** 
    * @description 非自定义回执
    */
    notCustom() {
      return !this.receiptConfig?.customReceipt && this.task.templateId == '1';
    },
    /** 
    * @description 显示合计
    */
    hasExpense() {
      let { sparepart = [], serviceIterm = [] } = this.form;
      return sparepart.length || serviceIterm.length;
    },
    /** 
    * @description 备件费用
    */
    sparepartTotal() {
      let { sparepart } = this.form;
      let total = 0;

      sparepart.forEach(item => {
        total += item.number * item.salePrice;
      })

      return total.toFixed(2);
    },
    /** 
    * @description 服务费用
    */
    serviceTotal() {
      let { serviceIterm } = this.form;
      let total = 0;

      serviceIterm.forEach(item => {
        total += item.number * item.salePrice;
      })

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
    }
  },
  methods: {
  }
}
