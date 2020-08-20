<script>
/* api */
import * as TaskApi from "@src/api/TaskApi";
import * as CustomerApi from "@src/api/CustomerApi";

/* utils */
import * as Utils from "@src/component/form/util";

/* components */
import {
  FormFieldMap,
  SettingComponents,
} from "@src/component/form/components";
import SearchProductSelect from "./SearchProductSelect.vue";
import SearchCustomerSelect from "./SearchCustomerSelect.vue";

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
        if (field.formType === "tags") {
          tv = [];
        }
        if (field.formType === "area") {
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
      const f = {
        ...Object.freeze(field),
      };
      let comp = FormFieldMap[f.formType];

      if (!comp || f.formType === "area") {
        return null;
      }

      if (f.formType === "select") {
        f.setting.isMulti = false;
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
            field: f,
            value: this.form[f.fieldName],
            disableMap: true,
          },
          on: {
            update: (event) => this.update(event),
            input: (event) => {
              if (event && event.length > 1) {
                this.$set(this, "product", event[0]);
              }
              this.form[f.fieldName] = event.keyword;
            },
          },
        });
      } else if (f.fieldName === "tags") {
          let value = this.form[f.fieldName];
           childComp = h(
              'biz-team-select',
              {
                props: {
                  value: value ? value : [],
                },
                on: {
                  input: event => this.update(event, 'tags')
                }
              }
            )
      } else if (f.fieldName === "tlmName") {
           childComp = h(
              'linkman-search',
              {
                props: {
                  field: f,
                  value: this.form[f.fieldName],
                  disableMap: true,
                },
                on: {
                  update: event => this.update(event)
                }
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
