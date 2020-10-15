<script>
/* api */
import * as TaskApi from "@src/api/TaskApi.ts";
import * as CustomerApi from "@src/api/CustomerApi";

/* utils */
import _ from 'lodash';
import * as Utils from "@src/component/form/util";

/* components */
import {
  FormFieldMap,
  SettingComponents,
} from "@src/component/form/components";
import SearchProductSelect from "./SearchProductSelect.vue";
import SearchCustomerSelect from "./SearchCustomerSelect.vue";
import { formatDate } from "@src/util/lang";

const MultiFieldNames = ['serviceType', 'serviceContent', 'level', 'paymentMethod', 'state', 'allotTypeStr', 'onceException', 'paymentMethod']

export default {
  name: "task-search-form",
  props: {
    fields: {
      type: Array,
      default: () => [],
    },
    formBackup: {
      type: Object,
      default: () => ({}),
    },
    columnNum: {
      type: Number,
      default: 1,
    },
    searchParams: {
      type: Object,
      default: () => []
    }
  },
  data() {
    return {
      customer: {},
      form: {},
      product: {},
    };
  },
  watch: {
    fields() {
      this.buildForm()
    }
  },
  created() {
    this.buildForm();
  },
  methods: {
    buildForm() {
      if (Object.keys(this.form).length === this.fields.length) return;
      this.initFormVal();
    },
    createUserInput(event, isTags) {
      if (isTags) {
        return (this.form.tags = event);
      }
      const f = event.field;
      this.form[f.fieldName] = event.keyword;
    },
    initFormVal() {
      let fields = this.fields;
      let form = {};
      let tv = "";
      fields.forEach((field) => {
        tv = "";
        // 地址的默认值初始化为对象
        if (field.formType == "customerAddress" || field.formType == "address")
          tv = {};
        if (field.formType == "date" || field.formType == "datetime") tv = [];
        if (field.formType === "link") {
          tv = {};
        }
        if (field.fieldName === "tags") {
          tv = [];
        }
        if (field.formType === "area") {
          tv = [];
        }

        if (field.formType === "user") {
          tv = []
        }

        if (MultiFieldNames.indexOf(field.fieldName) > -1) {
          tv = []
        }

        form[field.fieldName] = this.formBackup[field.fieldName] || tv;
        this.$set(
          this.form,
          field.fieldName,
          this.formBackup[field.fieldName] || tv
        );
      });

      let backUp = this.formBackup.backUp || {};
      this.$set(this, "customer", backUp.customer || {});
      this.$set(this, "product", backUp.product || {});

      // this._inPar()
      return form;
    },
    /**
     * 初始参数转换
     */
    initialParams(key, item) {
      let value;
      if (key === "onceReallot") {
        switch (item) {
          case 1:
            value = '是';
            break;
          default:
            value = "全部";
            break;
        }
      }

        // switch (item) {
        //   case 1:
        //     value = '曾超时';
        //     break;
        //   case 2:
        //     value = '曾拒绝';
        //     break;
        //   case 3:
        //     value = '曾暂停';
        //     break;
        //   case 4:
        //     value = '曾回退';
        //     break;
        //   case 5:
        //     value = '位置异常';
        //     break;
        //   default:
        //     value = "";
        //     break;
        // }
      return value
    },
    /**
     * 自定义初始化参数
     */
    _inPar() {
      let inPar = [] // 初始化的参数
      for(let key in this.searchParams) {
        if (JSON.stringify(this.searchParams[key]) !== '[]' && this.searchParams[key] && key !== 'pageSize' && key !== 'page' && key !== 'pageNum' && key !== 'stateList' && key !== 'whoseInfo' && key !== 'isPermission' && key !== 'distance' && key !== 'orderDetail' && key !== 'sortBy') {
          inPar.push({key, value: this.searchParams[key]})
        }
      }
      inPar.forEach(({key, value}) => {
        if (key === 'levels') {
          this.form.level = value
        } else if (key === 'level') {
          this.form.level = [value]
        } else if (key === 'onceReallot') {
          this.form.onceReallot = this.initialParams(key, value)
        } else if (key === 'acceptTimeStart') {
          this.form.acceptTime[0] = formatDate(new Date(value), "YYYY-MM-DD")
        } else if (key === 'acceptTimeEnd') {
          this.form.acceptTime[1] = formatDate(new Date(value), "YYYY-MM-DD")
        } else if (key === 'allotTimeStart') {
          this.form.allotTime[0] = formatDate(new Date(value), "YYYY-MM-DD")
        } else if (key === 'allotTimeEnd') {
          this.form.allotTime[1] = formatDate(new Date(value), "YYYY-MM-DD")
        } else if (key === 'serviceTypes') {
          this.form.serviceType = value
        } else if (key === 'serviceType') {
          this.form.serviceType = [value]
        } else if (key === 'serviceContents') {
          this.form.serviceContent = value
        } else if (key === 'serviceContent') {
          this.form.serviceContent = [value]
        } else {
          this.form[key] = value
        }
      })

      console.log('初始化的参数', inPar, this.form)
    },

    renderInput(h, field) {
      const f = _.cloneDeep(field)
      let comp = FormFieldMap.get(f.formType);
      if (!comp || f.formType === "area") {
        return null;
      }

      if (f.formType === "select") {
        f.setting.isMulti = false
      }

      if (MultiFieldNames.indexOf(field.fieldName) > -1) {
        f.setting.isMulti = true
      }

      let childComp = null;

      if (f.fieldName == "customer") {
        let value = this.form[f.fieldName];
        childComp = h("search-customer-select", {
          props: {
            placeholder: "请选择客户",
            field: f,
            value: value ? [{ label: this.customer.name || "", value }] : [],
            remoteMethod: this.searchCustomer,
          },
          on: {
            input: (event) => {
              this.customer = event && event.length > 0 ? event[0] : {};
              this.form[f.fieldName] = this.customer.id;
            },
          },
        });
      } else if (f.fieldName == "product") {
        let value = this.form[f.fieldName];
        childComp = h("search-product-select", {
          props: {
            placeholder: "请选择产品",
            field: f,
            value: value ? [{ label: this.product.name || "", value }] : [],
            remoteMethod: this.searchProduct,
          },
          on: {
            input: (event) => {
              this.product = event && event.length > 0 ? event[0] : {};
              this.form[f.fieldName] = this.product.id;
            },
          },
        });
      } else if (f.formType === "user") {
        childComp = h("user-search", {
          props: {
            multiple: true,
            field: f,
            value: this.form[f.fieldName],
            disableMap: true,
          },
          on: {
            update: (event) => this.update(event),
          },
        });
      } else if (f.fieldName === "tags") {
        let value = this.form[f.fieldName];
        childComp = h("biz-team-select", {
          props: {
            multiple: true,
            value: value || [],
          },
          on: {
            input: (event) => this.update(event, "tags"),
          },
        });
      } else if (f.fieldName === "tlmName") {
        f.clearable = true
        childComp = h("linkman-search", {
          props: {
            field: f,
            value: this.form[f.fieldName],
            disableMap: true,
          },
          on: {
            update: (event) => this.update(event),
          },
        });
      } else {
        childComp = h(
          comp.extend && comp.extend[`${f.formType}_search`]
            ? comp.extend[`${f.formType}_search`]
            : comp.build,
          {
            props: {
              field: f,
              value: this.form[f.fieldName],
              disableMap: true,
              placeholder: Utils.genPlaceholder(f),
              seo: true
            },
            on: {
              update: (event) => this.update(event),
            },
          }
        );
      }
      return h(
        "form-item",
        {
          props: {
            label: f.displayName,
            needValidate: false,
          },
        },
        [childComp]
      );
   
   },
    returnData() {
      let data = Object.assign({}, this.form);
      data.backUp = {
        customer: this.customer,
        product: this.product,
      };
      return data;
    },
    searchCustomer(params) {
      const pms = params || {};

      return CustomerApi.getCustomerListAsyn(pms)
        .then((res) => {
          if (!res || !res.list) return;

          res.list = res.list.map((custoner) =>
            Object.freeze({
              label: custoner.name,
              value: custoner.id,
              ...custoner,
            })
          );
          return res;
        })
        .catch((e) => console.error(e));
    },
    searchProduct(params) {
      const pms = params || {};

      pms.customerId = this.form.customer || "";
      return TaskApi.getTaskCustonerProductList(pms)
        .then((res) => {
          if (!res || !res.list) return;
          res.list = res.list.map((product) =>
            Object.freeze({
              label: product.name,
              value: product.id,
              ...product,
            })
          );
          return res;
        })
        .catch((e) => console.error(e));
    },
    update(event, action) {
      if (action === "tags") {
        return (this.form.tags = event);
      }

      if (action === "dist") {
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
          this.columnNum == 2 ? "two-columns" : ""
        }`}
      >
        {this.fields.map((f) => this.renderInput(h, f))}
      </div>
    );
  },
  components: {
    ...SettingComponents,
    [SearchProductSelect.name]: SearchProductSelect,
    [SearchCustomerSelect.name]: SearchCustomerSelect,
  },
};
</script>
