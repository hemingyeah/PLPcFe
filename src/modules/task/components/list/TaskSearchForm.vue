<script>
/* api */
import * as TaskApi from "@src/api/TaskApi.ts";
import * as CustomerApi from "@src/api/CustomerApi.ts";

/* utils */
import _ from "lodash";
import * as Utils from "@src/component/form/util";

/* components */
import {
  FormFieldMap,
  SettingComponents,
} from "@src/component/form/components";
import SearchProductSelect from "./SearchProductSelect.vue";
import SearchCustomerSelect from "./SearchCustomerSelect.vue";
import { formatDate } from "@src/util/lang";

const MultiFieldNames = ['serviceType', 'serviceContent', 'level', 'paymentMethod', 'state', 'allotTypeStr', 'onceException', 'paymentMethod','source']

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
      default: () => [],
    },
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
      this.buildForm();
    },
  },
  created() {
    this.buildForm();
  },
  methods: {
    buildForm() {
      // if (Object.keys(this.form).length === this.fields.length) return;
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
        if (field.formType === "area" || field.formType === "cascader" || (field.formType === 'select' && field.setting.isMulti)) {
          tv = [];
        }

        if (field.formType === "user") {
          tv = [];
        }

        if (MultiFieldNames.indexOf(field.fieldName) > -1) {
          tv = [];
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

      return form;
    },

    renderInput(h, field) {
      const f = _.cloneDeep(field);
      let comp = FormFieldMap.get(f.formType);
      if (!comp || f.formType === "area") {
        return null;
      }

      if (MultiFieldNames.indexOf(field.fieldName) > -1) {
        f.setting.isMulti = true;
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
        f.clearable = true;
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
              seo: true,
              toggle: true
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
        {this.fields.map(item => {
          if (item.formType === 'datetime') {
            item.formType = 'date'
          }
          return item
        }).map((f) => this.renderInput(h, f))}
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
