<template>
  <base-panel :show.sync="visible" :width="panelWidth">
    <h3 slot="title">
      <span>高级搜索</span>
      <el-dropdown class="pull-right" trigger="click" @command="setAdvanceSearchColumn">
        <i class="iconfont icon-xitongguanli customer-panel-btn" style="float: none;"></i>

        <el-dropdown-menu slot="dropdown" class="customer-advance-setting">
          <el-dropdown-item command="1">一栏</el-dropdown-item>
          <el-dropdown-item command="2">两栏</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </h3>
    <el-form class="advanced-search-form" onsubmit="return false;">
      <search-form
        :fields="fields"
        ref="searchForm"
        :form-backup="formBackup"
        :columnNum="columnNum"
      ></search-form>
      <slot name="footer"></slot>
    </el-form>
  </base-panel>
</template>

<script>
import {
  FormFieldMap,
  SettingComponents
} from "@src/component/form/components";
import * as Utils from "@src/component/form/util";
import { formatDate } from "@src/util/lang";
import { isEmptyStringObject } from "@src/util/function";

/* 高级搜索面板 列数 */
const PRODUCT_TEMPLATE_LIST_ADVANCE_SEARCH_COLUMN_NUMBER =
  "product_template_list_advance_search_column_number";
/* 高级搜索 搜索数据 */
const STORE_USER_FOR_SEARCH_PRODUCT_TEMPLATE =
  "store_user_for_search_product_template";
// 产品模板列表数据
const PRODUCT_TEMPLATE_LIST_DATA = "product_template_list_data";

export default {
  name: "product-template-search-panel",
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      visible: false,
      formBackup: {},
      columnNum: 1,
      selfFields: []
    };
  },
  computed: {
    fields() {
      let f = {};
      return [...this.config.fields, ...this.selfFields]
        .filter(
          f =>
            (f.isSearch || f.isSystem) &&
            f.fieldName !== "qrcodeId" &&
            f.fieldName !== "customer"
        )
        .map(field => {
          f = Object.assign({}, field);

          let formType = f.formType;

          if (formType === "datetime") {
            formType = "date";
          }

          if (f.fieldName === "customer") {
            formType = "customer";
          }

          if (formType === "updateTime") {
            f.displayName = "更新时间";
          }

          return Object.freeze({
            ...f,
            isNull: 1,
            formType,
            originalFormType: f.formType,
            operator: this.matchOperator(f)
          });
        })
        .sort((a, b) => a.orderId - b.orderId);
    },
    panelWidth() {
      return `${420 * this.columnNum}px`;
    }
  },
  mounted() {
    const column_number = this.localStorageGet(
      PRODUCT_TEMPLATE_LIST_ADVANCE_SEARCH_COLUMN_NUMBER
    );
    if (column_number) this.columnNum = Number(column_number);
  },
  methods: {
    /* 获取本地数据 */
    localStorageGet(key) {
      try {
        const dataStr = localStorage.getItem(key) || "{}";
        return JSON.parse(dataStr);
      } catch (error) {
        console.log("error: ", error);
        return {};
      }
    },
    /* 设置本地数据 */
    localStorageSet(key, value, rootKey = null) {
      try {
        if (!rootKey) {
          localStorage.setItem(key, JSON.stringify(value));
        } else {
          const data = this.localStorageGet(rootKey);

          data[key] = value;
          localStorage.setItem(rootKey, JSON.stringify(data));
        }
      } catch (err) {
        console.log("localStorageSet err", err);
      }
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
    resetParams() {
      this.formBackup = {};
      this.$refs.searchForm &&
        this.$nextTick(this.$refs.searchForm.initFormVal);
    },

    buildParams() {
      const form = this.$refs.searchForm.returnData();
      this.formBackup = Object.assign({}, form);

      const isSystemFields = this.fields.filter(f => f.isSystem);
      const notSystemFields = this.fields.filter(f => !f.isSystem);
      let params = {
        conditions: []
      };

      let tv = null;
      let fn = "";
      for (let i = 0; i < isSystemFields.length; i++) {
        tv = isSystemFields[i];
        fn = tv.fieldName;

        // hasRemind
        if (fn === "hasRemind" && form[fn] !== "") {
          params.hasRemind = form[fn];
          continue;
        }

        if (!form[fn] || (Array.isArray(form[fn]) && !form[fn].length)) {
          continue;
        }

        if (typeof form[fn] === "string") {
          params[fn === "customer" ? "customerId" : fn] = form[fn];
          continue;
        }

        if (tv.formType === "date" || tv.formType === "datetime") {
          if (tv.returnData) {
            params = {
              ...tv.returnData(form[fn]),
              [fn]: form[fn].map(t => formatDate(t, "YYYY/MM/DD")).join("-")
            };
            continue;
          }
          params[fn] = form[fn].map(t => formatDate(t, "YYYY/MM/DD")).join("-");
          continue;
        }

        if (tv.formType === "tags") {
          params.tagId = form[fn].map(({ id }) => id).join("");
        }
        params[fn] = form[fn];
      }

      for (let i = 0; i < notSystemFields.length; i++) {
        tv = notSystemFields[i];
        fn = tv.fieldName;

        if (!form[fn] || (Array.isArray(form[fn]) && !form[fn].length)) {
          continue;
        }

        // 空对象
        if (
          typeof form[fn] === "object" &&
          !Array.isArray(form[fn]) &&
          !Object.keys(form[fn]).length
        ) {
          continue;
        }

        if (tv.originalFormType === "date") {
          params.conditions.push({
            property: fn,
            operator: tv.operator,
            betweenValue1: formatDate(form[fn][0], "YYYY-MM-DD"),
            betweenValue2: formatDate(form[fn][1], "YYYY-MM-DD")
          });
          continue;
        }

        if (tv.originalFormType === "datetime") {
          params.conditions.push({
            property: fn,
            operator: tv.operator,
            betweenValue1: formatDate(form[fn][0], "YYYY-MM-DD HH:mm:ss"),
            betweenValue2: `${formatDate(form[fn][1], "YYYY-MM-DD")} 23:59:59`
          });
          continue;
        }

        if (tv.formType === "address") {
          let address = {
            property: fn,
            operator: tv.operator
          };
          let isEmpty = isEmptyStringObject(form[fn]);

          if (!isEmpty) {
            address.value =
              (form[fn].province || "") +
              (form[fn].city || "") +
              (form[fn].dist || "") +
              (form[fn].address || "");
            params.conditions.push(address);
          }
          continue;
        }

        params.conditions.push({
          property: fn,
          operator: tv.operator,
          value: form[fn]
        });
      }
      return params;
    },
    setAdvanceSearchColumn(command) {
      this.columnNum = Number(command);
      this.localStorageSet(
        PRODUCT_TEMPLATE_LIST_ADVANCE_SEARCH_COLUMN_NUMBER,
        command
      );
    },
    open() {
      this.visible = true;
    }
  },
  components: {
    SearchForm: {
      name: "search-form",
      props: {
        fields: {
          type: Array,
          default: () => []
        },
        formBackup: {
          type: Object,
          default: () => ({})
        },
        columnNum: {
          type: Number,
          default: 1
        }
      },
      data() {
        return {
          form: {},
          tableName: "product",
          render: false
        };
      },
      mounted() {
        this.buildForm();
      },
      methods: {
        returnData() {
          return Object.assign({}, this.form);
        },
        buildForm() {
          if (Object.keys(this.form).length === this.fields.length) return;
          this.initFormVal();
        },
        initFormVal() {
          let fields = this.fields;
          let form = {};
          let tv = "";

          fields.forEach(field => {
            tv = "";
            // 地址的默认值初始化为对象
            if (
              field.formType == "customerAddress" ||
              field.formType == "address"
            )
              tv = {};
            if (field.formType == "date" || field.formType == "datetime")
              tv = [];
            if (field.formType === "link") {
              tv = {};
            }
            if (field.formType === "tags") {
              tv = [];
            }

            form[field.fieldName] = this.formBackup[field.fieldName] || tv;

            this.$set(
              this.form,
              field.fieldName,
              this.formBackup[field.fieldName] || tv
            );
          });
          this.render = true;

          return form;
        },
        update(event, isTags) {
          if (isTags) {
            return (this.form.tags = event);
          }

          const f = event.field;
          if (f.children && f.children.length > 0) {
            f.children.forEach(item => {
              this.form[item] = "";
            });
          }
          if (f.returnData) {
            let result = f.returnData(event.newValue);
            this.form = {
              ...this.form,
              ...result,
              [f.fieldName]: event.newValue
            };
          } else {
            this.form = {
              ...this.form,
              [f.fieldName]: event.newValue
            };
          }
        },
        renderInput(h, field) {
          const f = {
            ...Object.freeze(field)
          };
          if (!this.render) {
            return null;
          }

          let comp = FormFieldMap.get(f.formType);

          if (!comp && f.formType !== "tags" && f.formType !== "customer") {
            return null;
          }

          if (f.formType === "select") {
            f.setting = {
              ...f.setting,
              isMulti: false
            };
          }

          let childComp = null;
          if (f.formType === "tags") {
            childComp = h("biz-team-select", {
              props: {
                value: this.form[f.fieldName]
              },
              on: {
                input: event => this.update(event, "isTags")
              }
            });
          } else if (f.formType === "customer") {
            childComp = h("customer-search", {
              props: {
                field: f,
                value: this.form[f.fieldName],
                disableMap: true
              },
              on: {
                update: event => this.update(event)
              }
            });
          } else if (
            f.formType === "select" &&
            f.extendType === "customerExtend"
          ) {
            childComp = h("customer-extend", {
              props: {
                field: f,
                values: this.form[f.fieldName],
                disableMap: true,
                extendData: {
                  [f.mainKey]: this.form[f.extendData],
                  pageNum: 1,
                  pageSize: 0
                }
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
                  placeholder: Utils.genPlaceholder(f)
                },
                on: {
                  update: event => this.update(event)
                }
              }
            );
          }

          return h(
            "form-item",
            {
              props: {
                label: f.displayName,
                needValidate: false
              }
            },
            [childComp]
          );
        }
      },
      render(h) {
        return (
          <div
            class={`form-item-container ${
              this.columnNum == 2 ? "two-columns" : ""
            }`}
          >
            {this.fields.map(f => this.renderInput(h, f))}
          </div>
        );
      },
      components: { ...SettingComponents }
    }
  }
};
</script>

<style lang="scss">
.advanced-search-form {
  overflow: auto;
  padding: 10px 15px 63px 15px;

  height: calc(100% - 52px);
  justify-content: space-between;

  .two-columns {
    display: flex;
    flex-wrap: wrap;
    .el-form-item {
      width: 50%;
    }
  }

  .form-item-container {
    justify-content: space-between;
  }

  .form-item {
    label {
      padding-left: 0;
    }

    width: 390px;
  }

  .advanced-search-btn-group {
    display: flex;
    justify-content: flex-end;
    width: 100%;
    position: absolute;
    bottom: 0px;
    background: #fff;
    padding: 15px 20px;

    .base-button {
      margin: 0 10px;
    }
  }
}
</style>