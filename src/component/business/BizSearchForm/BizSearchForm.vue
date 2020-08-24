<script>
/* api */
import * as TaskApi from '@src/api/TaskApi';
import * as CustomerApi from '@src/api/CustomerApi';

/* components */
import { FormFieldMap, SettingComponents } from '@src/component/form/components';

/* utils */
import * as Utils from '@src/component/form/util';

export default {
  name: 'biz-search-form',
  props: {
    columnNum: {
      type: Number,
      default: 1
    },
    fields: {
      type: Array,
      default: () => []
    },
    formBackup: {
      type: Object,
      default: () => ({})
    },
    initFormVal: {
      type: Function,
      default: () => {}
    },
    renderInput: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {
      customer: {},
      form: {},
      product: {},
    };
  },
  mounted() {
    this.buildForm();
  },
  methods: {
    buildForm() {
      if (Object.keys(this.form).length === this.fields.length) return;
      this.initFormVal();
    },
    createUserInput(event, isTags) {
      if (isTags) {
        return this.form.tags = event;
      }
      const f = event.field;
      this.form[f.fieldName] = event.keyword;
    },
    returnData() {
      let data = Object.assign({}, this.form);
      data.backUp = {
        customer: this.customer,
        product: this.product
      }

      return data;
    },
    searchCustomer(params) {
      const pms = params || {};

      return (
        CustomerApi.getCustomerListAsyn(pms)
          .then(res => {
            if (!res || !res.list) return;   

            res.list = res.list.map(custoner =>

              Object.freeze({
                label: custoner.name,
                value: custoner.id,
                ...custoner
              })

            )     
            return res;
          })
          .catch(e => console.error(e)) 
      )
    },
    searchProduct(params) {
      const pms = params || {};

      pms.customerId = this.form.customer || '';

      return (
        TaskApi.getTaskCustonerProductList(pms)
          .then(res => {
            if (!res || !res.list) return;   
            res.list = res.list.map(product =>
              Object.freeze({
                label: product.name,
                value: product.id,
                ...product
              })
            )     
            return res;
          })
          .catch(e => console.error(e))
      )
    },
    update(event, action) {
      if (action === 'tags') {
        return (this.form.tags = event);
      }

      if (action === 'dist') {
        return (this.form.area = event);
      }
      const f = event.field;
      this.form[f.fieldName] = event.newValue;
    },
  },
  render(h) {
    return (
      <div
        class={`form-item-container ${
          this.columnNum == 2 ? 'two-columns' : ''
        }`}
      >
        {this.fields.map(f => this.renderInput(h, f))}
      </div>
    );
  },
  components: { 
    ...SettingComponents
  }
}
</script>