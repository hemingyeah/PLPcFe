<template>
    <div>
        <div v-for="(item, index) in list" :key="index">
            <batch-form :fields="fields" :columnNum="columnNum" ref="batchForm" @add="add" @setting="setting" />
        </div>
    </div>
</template>

<script>
import { FormFieldMap, SettingComponents } from "@src/component/form/components";
/* api */
import * as TaskApi from "@src/api/TaskApi.ts";
import * as CustomerApi from "@src/api/CustomerApi";

/* utils */
import _ from "lodash";
import * as Utils from "@src/component/form/util";

import SearchProductSelect from "./SearchProductSelect.vue";
import SearchCustomerSelect from "./SearchCustomerSelect.vue";
import { typeOf } from '@src/util/assist';

export default {
  name: "task-inquire",
  props: {
    config: {
      type: Array,
      default: () => ({}),
    },
    columnNum: {
        type: Number,
        default: 1
    },
  },
  data() {
    return {
        list: [1],
        setting_list: []
    }
  },
  computed: {
    fields() {
      const searchField = localStorage.getItem('task-search-field')
      let f = {};
      let fields = [...this.config]
        .filter((f) => f.isSearch)
        .map((field) => {
          f = _.cloneDeep(field);

          let formType = f.formType;

          if (formType === "datetime") {
            formType = "date";
          }

          if (formType === "updateTime") {
            f.displayName = "更新时间";
          }
          return Object.freeze({
            ...f,
            isNull: 1,
            formType,
            originalFormType: f.formType,
            operator: this.matchOperator(f),
          });
        })
        .sort((a, b) => a.orderId - b.orderId);
        return fields;
    },
  },
  methods: {
    returnData() {
        let data = {}
        this.$refs.batchForm.forEach(item => {
           for(let key in item.returnDatas()) {
               if (typeOf(item.returnDatas()[key]) === 'string' && item.returnDatas()[key] ) {
                data[key] = item.returnDatas()[key]
               }
               if (key === 'tags' && item.returnDatas()[key].length) {
                  data[key] = item.returnDatas()[key] 
               }
           }
        })
        return data
    },
    matchOperator(field) {
      let formType = field.formType;
      let operator = "";

      switch (formType) {
        case "date": {
          operator = "between";
          break;
        }
        case "datetime": {
          operator = "between";
          break;
        }
        case "select": {
          if (field.setting && field.setting.isMulti) {
            operator = "contain";
          } else {
            operator = "eq";
          }
          break;
        }
        case "user": {
          operator = "user";
          break;
        }
        case "address": {
          operator = "address";
          break;
        }
        case "location": {
          operator = "location";
          break;
        }
        default: {
          operator = "like";
          break;
        }
      }
      return operator;
    },
    add() {
        this.list.push(1)
    },
    setting(item) {
        this.setting_list.push(item.displayName)

        const set_list = new Set(this.setting_list)
        const list = []
        for(let key of set_list) {
            list.push(key)
        }
        this.$emit('setting', {item, list})
    }
  },
  components: {
    BatchForm: {
      name: "batch-form",
      props: {
        fields: {
          type: Array,
          default: () => [],
        },
        columnNum: {
            type: Number,
            default: 1
        }
      },
      data: () => {
        return {
          selectedField: {},
            customer: {},
            form: {},
            product: {},
        };
      },
      mounted() {
        this.reset();
        this.buildForm();
      },
      methods: {
        returnDatas() {
            let data = Object.assign({}, this.form);
            data.backUp = {
                customer: this.customer,
                product: this.product,
            };
            return data;
        },
        reset() {
          this.form = {};
          this.selectField(this.fields[0].fieldName);
        },
        buildForm() {
          if (Object.keys(this.form).length === this.fields.length) return;
          this.form = Utils.initialize(this.fields);

          this.fields.forEach((f) => {
            if (f.fieldName === "tags" && f.formType === "select") {
              this.form[f.fieldName] = [];
            }
          });
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
        console.log(event.newValue)
        },
        selectField(val) {
          this.selectedField = this.fields.filter(
            (f) => f.fieldName === val
          )[0];  
        },
        renderSelector() {
          if (!this.fields) return null;
          return (
            <el-select
                value={this.selectedField.fieldName}
                onChange={this.selectField}
                >
                {this.fields.map((f) => (
                    <el-option
                    key={f.fieldName}
                    label={f.displayName}
                    value={f.fieldName}
                    ></el-option>
                ))}
            </el-select>
          );
        },
        renderInput(h) {
          const f = this.selectedField;
          const comp = FormFieldMap.get(f.formType);
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
                    // this.form[f.fieldName] = event.keyword;
                    },
                },
                });
            } else if (f.fieldName === "tags") {
                let value = this.form[f.fieldName];
                childComp = h("biz-team-select", {
                props: {
                    value: value ? value : [],
                },
                on: {
                    input: (event) => this.update(event, "tags"),
                },
                });
            } else if (f.fieldName === "tlmName") {
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
      },
      render(h) {
        return (
         <div>
            <div class={this.columnNum === 2 ? 'task-flex task-ai task-mt12' : 'task-mt12'}>
            <div>
            {this.renderSelector()}
            </div>
                {/*<div class="task-inquire">
                    <el-select
                    >
                    </el-select>
                </div>*/}
                <div class={this.columnNum === 2 ? 'task-inquire-two task-flex task-ai' : 'task-inquire task-flex task-ai'}>
                    {this.renderInput(h)}
                    <div class="task-font14 task-c13 task-inquire-add task-ml15 task-pointer" onClick={() => {
                        this.$emit('add')
                    }}>添加</div>
                </div>
            </div>
            <div class="task-font14 task-c2 task-mt15 task-pointer" onClick={() => {
                this.$emit('setting', this.selectedField)
            }}>设为常用搜索字段</div>
          </div>
        );
      },
      components: {
        ...SettingComponents,
        [SearchProductSelect.name]: SearchProductSelect,
        [SearchCustomerSelect.name]: SearchCustomerSelect,
      },
    },
  },

};
</script>

<style lang="scss">
.task-inquire, .task-inquire-two {
    margin-top: 12px;
    label {
        display: none!important;
    }
      .form-item {
    width: 187px;
  }
    .form-item-control {
        width: 187px;
        flex: inherit;
        .err-msg-wrap {
            min-height: 0!important;
            padding-bottom: 0!important
        }
    }
}
.task-inquire-add {
    width: 68px;
    height: 32px;
    background-color: #E9F9F9;
    border-radius: 4px;
    border: 1px solid #D0F3F4;
    text-align: center;
    line-height: 32px;
}
.task-inquire-two {
    margin: 0;
    margin-left: 12px;
}
.batch-editing-customer-dialog {
  .base-modal-body {
    padding: 10px 30px 0;
  }

  .item {
    display: flex;
    justify-content: space-between;
    line-height: 32px;
    div {
      flex-grow: 1;
      .el-select {
        width: 100%;
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
