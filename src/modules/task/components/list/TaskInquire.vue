<template>
  <div v-show="fields.length">
    <div v-for="(item, index) in list" :key="index">
      <batch-form
        :fields="fields"
        :column-num="columnNum"
        :list="list"
        :index="index"
        ref="batchForm"
        @add="add"
        @del="del"
        @setting="setting"
        :item="item"
        :inquire-form-backup="inquireFormBackup"
        :search-model="searchModel"
      />
    </div>
    <div
      class="task-font14 task-c2 task-mt15 task-pointer"
      @click="create"
      v-if="!type"
    >
      设为常用搜索字段
    </div>
  </div>
</template>

<script>
import {
  FormFieldMap,
  SettingComponents,
} from "@src/component/form/components";
/* api */
import * as TaskApi from '@src/api/TaskApi.ts';
import * as CustomerApi from '@src/api/CustomerApi.ts';

/* utils */
import _ from "lodash";
import * as Utils from "@src/component/form/util";

import SearchProductSelect from "./SearchProductSelect.vue";
import SearchCustomerSelect from "./SearchCustomerSelect.vue";

// const TaskInquireFiltersFieldNames = ["cusAddress", "area", "tags"];
const OperatorSelectOptionsMap = {
  input: [
    { label: "包含", value: "like" },
    { label: "等于", value: "eq" },
    { label: "大于", value: "gt" },
    { label: "大于等于", value: "ge" },
    { label: "小于", value: "lt" },
    { label: "小于等于", value: "le" },
  ],
  text: [
    { label: "包含", value: "like" },
    { label: "等于", value: "eq" },
  ],
  multiple: [{ label: "介于", value: "in" }],
  description: [{ label: "包含", value: "like" }],
  date: [{ label: "介于", value: "between" }],
  select: [{ label: "等于", value: "eq" }],
  cascader: [{ label: "包含", value: "cascader" }],
  many: [{ label: "包含", value: "contain" }],
};

const MultiFieldNames = [
  "serviceType",
  "serviceContent",
  "level",
  "paymentMethod",
  "state",
  "allotTypeStr",
  "onceException",
  "allotUser",
  "tags",
  "synergyId",
  "createUser",
  "executor",
];

function setFieldOperateHandler(field = {}) {
  let { fieldName, formType, setting } = field;

  if (formType == "number") {
    field.operatorOptions = OperatorSelectOptionsMap.input.slice();
  } else if (MultiFieldNames.indexOf(fieldName) > -1) {
    field.operatorOptions = OperatorSelectOptionsMap.multiple.slice();
  } else if (fieldName == "customer" || fieldName == "product") {
    field.operatorOptions = OperatorSelectOptionsMap.select.slice();
  } else if (formType === "description" || fieldName === "eventNo") {
    field.operatorOptions = OperatorSelectOptionsMap.description.slice();
  } else if (
    formType == "text" ||
    formType == "textarea" ||
    formType === "code" ||
    formType === "relationProduct" ||
    formType === "relationCustomer"
  ) {
    field.operatorOptions = OperatorSelectOptionsMap.text.slice();
  } else if (formType == "date" || formType == "datetime") {
    field.operatorOptions = OperatorSelectOptionsMap.date.slice();
  } else if (formType == "select" && !setting.isMult) {
    field.operatorOptions = OperatorSelectOptionsMap.select.slice();
  } else if (formType == "select" && setting.isMult) {
    field.operatorOptions = OperatorSelectOptionsMap.many.slice();
  } else if (formType === "cascader") {
    field.operatorOptions = OperatorSelectOptionsMap.cascader.slice();
  } else {
    field.operatorOptions = OperatorSelectOptionsMap.select.slice();
  }

  field.operatorValue = field.operatorOptions[0].value;
}

export default {
  name: "task-inquire",
  props: {
    taskNums: {
      type: Array || null,
      default: () => [], //已经存储的视图参数索引
    },
    inquireFormBackup: {
      type: Object,
      default: () => ({}),
    },
    searchModel: {
      type: Object,
      default: () => ({}),
    },
    config: {
      type: Array,
      default: () => ({}),
    },
    columnNum: {
      type: Number,
      default: 1,
    },
    type: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      list: [1],
      check_list: [],
      checkSystemList: [], // 系统
      checkCustomizeList: [], // 自定义
      check_system_list: [],
      check_customize_list: [],
    };
  },
  watch: {
    taskNums(v) {
      this.list = v;
    },
    config() {
      this.fields;
    },
    inquireFormBackup(v) {
      if (JSON.stringify(v) === "{}") {
        this.list = [1];
      }
    },
    searchModelCN(v) {
      if (v.length) {
        this.list = v.map((item, index) => {
          return index + 1;
        });
      } else {
        this.list = [1];
      }
    },
  },
  computed: {
    fields() {
      let f = {};
      let fields = [...this.config].map((field) => {
        f = _.cloneDeep(field);

        let formType = f.formType;

        if (formType === "datetime") {
          formType = "date";
        }

        if (formType === "updateTime") {
          f.displayName = "更新时间";
        }

        setFieldOperateHandler(f);

        return {
          ...f,
          isNull: 1,
          formType,
          originalFormType: f.formType,
          operator: this.matchOperator(f),
        };
      });
      return fields;
    },
  },
  methods: {
    // 高级搜索选中的值
    returnData() {
      let data = {};
      if (!this.$refs.batchForm) return {};
      this.$refs.batchForm.forEach((item) => {
        for (let key in item.returnDatas()) {
          const value = item.returnDatas()[key];
          if (
            value &&
            JSON.stringify(value) !== "{}" &&
            JSON.stringify(value) !== "[]"
          ) {
            data[key] = item.returnDatas()[key];
          } else if (key === "tags" && item.returnDatas()[key].length) {
            data[key] = item.returnDatas()[key];
          } else {
            // data[key] = item.returnDatas()[key];
          }
        }
      });
      return data;
    },
    returnInquireFields() {
      let inquireFields = [];

      if (!this.$refs.batchForm) return [];
      this.$refs.batchForm.forEach((batchFormEl) => {
        inquireFields.push(batchFormEl.selectedField);
      });

      return inquireFields;
    },
    create() {
      const { check_system_list, check_customize_list, check_list } = this;
      this.$emit("setting", {
        list: check_list,
        check_system_list,
        check_customize_list,
      });
      this.list = [1];
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
        case "cascader": {
          operator = "cascader";
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
    // 添加
    add() {
      this.list.push(1);
    },
    // 删除
    del({ index, v }) {
      this.checkSystemList = [];
      this.checkCustomizeList = [];
      this.check_list = this.check_list.filter((val, i) => {
        return val !== v.displayName;
      });

      this.fields
        .filter((item, index) => {
          let bool = this.check_list.some((v) => {
            return item.displayName === v;
          });
          return bool;
        })
        .forEach((item) => {
          if (item.isSystem) {
            this.checkSystemList.push(item.displayName);
          } else {
            this.checkCustomizeList.push(item.displayName);
          }
        });

      this.check_system_list = new Set(this.checkSystemList);
      this.check_customize_list = new Set(this.checkCustomizeList);
      this.list = this.list.map((v, i) => {
        if (index === i) {
          v = "";
        }
        return v;
      });
      console.log(this.list);
    },
    setting({ item, index }) {
      // type 0 = 初始化 1筛选
      if (item.isSystem) {
        this.checkSystemList = this.checkSystemList.map((v, i) => {
          if (index === i) {
            v = item.displayName;
          }
          return v;
        });
        if (
          this.checkSystemList.every((v, i) => {
            return index !== i;
          })
        ) {
          this.checkSystemList.push(item.displayName);
        }
      } else {
        this.checkCustomizeList = this.checkCustomizeList.map((v, i) => {
          if (index === i) {
            v = item.displayName;
          }
          return v;
        });
        if (
          this.checkCustomizeList.every((v, i) => {
            return index !== i;
          })
        ) {
          this.checkCustomizeList.push(item.displayName);
        }
      }
      this.check_system_list = new Set(this.checkSystemList);
      this.check_customize_list = new Set(this.checkCustomizeList);
      this.check_list = [
        ...this.check_system_list,
        ...this.check_customize_list,
      ];
    },
  },
  components: {
    BatchForm: {
      name: "batch-form",
      props: {
        inquireFormBackup: {
          type: Object,
          default: () => ({}),
        },
        searchModel: {
          type: Object,
          default: () => ({}),
        },
        fields: {
          type: Array,
          default: () => [],
        },
        list: {
          type: Array,
          default: [],
        },
        index: {
          type: Number,
          default: 0,
        },
        columnNum: {
          type: Number,
          default: 1,
        },
        item: {
          type: Number | String | Object,
          default: "",
        },
      },
      data: () => {
        return {
          selectedField: {},
          customer: {},
          form: {},
          product: {},
          userList: []
        };
      },
      watch: {
        inquireFormBackup(v) {
          if (JSON.stringify(v) === "{}") {
            this.reset();
            this.buildForm();
          }
        },
        item(v) {
          this.customizeParams();
          if (!v) {
            this.reset();
          }
        },
        fields(v) {
          if (JSON.stringify(this.form) === "{}") {
            this.reset();
            this.buildForm();
          }
        },
      },
      mounted() {
        this.customizeParams();
        this.reset();
        this.buildForm();
      },
      methods: {
        /*自定义视图参数 */
        customizeParams() {
          this.form["backUp"] = { customer: {}, product: {} };
          if (this.item && this.item.fieldName) {
            const {
              fieldName,
              content,
              formType,
              province,
              city,
              dist,
              id,
              ids,
            } = this.item;
            this.selectField(fieldName);
            const types = [
              "level",
              "serviceContent",
              "serviceType",
              "paymentMethod",
              "onceException",
              "allotTypeStr",
              "state",
              "cascader",
            ];
            const personnel = [
              "createUser",
              "allotUser",
              "executor",
              "synergyId",
              "user",
            ];
            if (personnel.indexOf(fieldName) !== -1 || personnel.indexOf(formType) !== -1) {
              this.form[fieldName] = ids;
              ids.forEach((item, i) => {
                this.userList.push({
                  id: item,
                  name: content.split("，")[i]
                })
              })
            } else if (
              types.indexOf(fieldName) !== -1 ||
              types.indexOf(formType) !== -1
            ) {
              this.form[fieldName] = content.split("，");
            } else if (fieldName === "tlmName") {
              this.form[fieldName] = id;
              this.userList = [{id, name: content}]
            } else if (formType === "datetime" || formType === "date") {
              this.form[fieldName] = content.split("-");
            } else if (fieldName === "customer") {
              this.form[fieldName] = id;
              this.form["backUp"].customer = { name: content, value: id };
              this.customer = { name: content, value: id };
            } else if (fieldName === "product") {
              this.form[fieldName] = id;
              this.form["backUp"].product = { name: content, value: id };
              this.product = { name: content, value: id };
            } else if (fieldName === "tags") {
              this.form[fieldName] = [];
              ids.forEach((item, i) => {
                this.form[fieldName].push({
                  id: item,
                  tagName: content.split("，")[i],
                });
              });
            } else if (fieldName === "area") {
              this.form[fieldName] = {
                addressType: 0,
                province,
                city,
                dist,
              };
            } else {
              this.form[fieldName] = content;
            }
          } else {
            this.selectedField = {};
            this.form = {};
          }
        },
        returnDatas() {
          let data = Object.assign({}, this.form);
          data.backUp = {
            customer: this.customer,
            product: this.product,
          };
          return data;
        },
        reset() {
          // this.form = {};
          // if (this.fields.length) {
          //   this.selectField(this.fields[0].fieldName);
          // }
        },
        buildForm() {
          if (Object.keys(this.form).length) return;
          this.fields.forEach((f) => {
            if (!this.form[f.fieldName] || !this.form[f.fieldName].length) {
              // 地址的默认值初始化为对象
              let tv = "";
              if (f.formType == "customerAddress" || f.formType == "address")
                tv = {};
              if (f.formType == "date" || f.formType == "datetime") tv = [];
              if (f.formType === "link") {
                tv = {};
              }
              if (f.fieldName === "tags") {
                tv = [];
              }
              if (f.formType === "area" || f.formType === "cascader") {
                tv = [];
              }

              if (f.formType === "user") {
                tv = [];
              }
              if (MultiFieldNames.indexOf(f.fieldName) > -1) {
                this.form[f.fieldName] = [];
              }
              this.form[f.fieldName] = tv;
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
          this.form = {};
          if (action === "tags") {
            return (this.form.tags = event);
          }

          if (action === "dist") {
            return (this.form.area = event);
          }
          const f = event.field;
          this.form[f.fieldName] = event.newValue;
          this.$forceUpdate();
        },
        selectField(val) {
          this.selectedField = this.fields.filter(
            (f) => f.fieldName === val
          )[0];
          this.$emit("setting", {
            item: this.selectedField,
            index: this.index,
          });
          this.form[val] = val == "tags" ? [] : "";
          if (MultiFieldNames.indexOf(this.selectedField.fieldName) > -1) {
            this.form[val] = [];
          }
        },
        renderSelector() {
          if (!this.fields) return null;

          return (
            <el-select
              value={this.selectedField.fieldName}
              onChange={this.selectField}
              filterable
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
        renderOperateSelect() {
          if (!this.selectedField.operatorOptions) return;

          return (
            <el-select
              value={this.selectedField.operatorValue}
              onInput={(value) => (this.selectedField.operatorValue = value)}
            >
              {this.selectedField.operatorOptions.map((operatorItem) => (
                <el-option
                  key={operatorItem.value}
                  label={operatorItem.label}
                  value={operatorItem.value}
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

          if (MultiFieldNames.indexOf(this.selectedField.fieldName) > -1) {
            f.setting.isMulti = true;
          }

          let childComp = null;

          if (f.fieldName == "customer") {
            let value = this.form[f.fieldName];
            childComp = h("search-customer-select", {
              props: {
                placeholder: "请选择客户",
                field: f,
                value: value
                  ? [{ label: this.customer.name || "", value }]
                  : [],
                remoteMethod: this.searchCustomer,
              },
              on: {
                input: (event) => {
                  this.form = {};
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
                  this.form = {};
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
                userList: this.userList
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
                multiple: true,
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
                userList: this.userList
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
                  toggle: true,
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
            {this.item ? (
              <div
                class={
                  this.columnNum === 2
                    ? "task-flex task-ai task-mt12"
                    : "task-mt12"
                }
              >
                <div
                  class={
                    this.columnNum === 2
                      ? "task-inquire-operator-select task-type"
                      : "task-mt12 task-type"
                  }
                >
                  {this.renderSelector()}
                </div>
                <div
                  class={
                    this.columnNum === 2
                      ? "task-inquire-operator-select task-type"
                      : "task-mt12 task-type"
                  }
                >
                  {this.renderOperateSelect()}
                </div>
                <div
                  class={
                    this.columnNum === 2
                      ? "task-inquire-two task-flex task-ai"
                      : "task-inquire task-flex task-ai"
                  }
                >
                  {this.renderInput(h)}
                  {this.list.length - 1 === this.index ? (
                    <div
                      class={
                        this.selectedField.displayName
                          ? "task-font14 task-c13 task-inquire-add task-ml15 task-pointer"
                          : "task-font14 task-c13 task-inquire-add task-pointer"
                      }
                      onClick={() => {
                        this.$emit("add");
                      }}
                    >
                      添加
                    </div>
                  ) : (
                    <i
                      class="iconfont icon-shanchu1 task-pointer task-ml15 task-icon"
                      onClick={() => {
                        this.$emit("del", {
                          index: this.index,
                          v: this.selectedField,
                        });
                      }}
                    ></i>
                  )}
                </div>
              </div>
            ) : null}
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
.task-type {
  width: 210px !important;
  .el-select {
    width: 100%;
  }
}
.task-inquire,
.task-inquire-two {
  margin-top: 12px;
  label {
    display: none !important;
  }
  .form-item {
    width: 210px;
  }
  .form-item-control {
    width: 210px;
    flex: inherit;
    .err-msg-wrap {
      min-height: 0 !important;
      padding-bottom: 0 !important;
    }
  }
}
.task-inquire-add {
  width: 68px;
  height: 32px;
  background-color: #e9f9f9;
  border-radius: 4px;
  border: 1px solid #d0f3f4;
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

.task-inquire-operator-select {
  margin-left: 12px;
}
</style>
