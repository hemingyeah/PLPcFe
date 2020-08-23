<template>
  <base-panel :show.sync="visible" :width="panelWidth">
    <h3 slot="title">
      <span>高级搜索</span>
      <el-dropdown
        class="pull-right"
        trigger="click"
        @command="setAdvanceSearchColumn"
      >
        <i
          class="iconfont icon-xitongguanli customer-panel-btn"
          style="float: none;"
        ></i>

        <el-dropdown-menu slot="dropdown" class="customer-advance-setting">
          <el-dropdown-item command="1">一栏</el-dropdown-item>
          <el-dropdown-item command="2">两栏</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </h3>
    <!-- S 搜索条件 -->
    <el-form class="advanced-search-form" onsubmit="return false;">
      <task-search-form
        :fields="fields"
        ref="searchForm"
        :form-backup="formBackup"
        :column-num="columnNum"
      >
      </task-search-form>
      <!-- 搜索操作按钮 -->
      <slot name="footer"></slot>
    </el-form>
    <!-- E 搜索条件 -->
  </base-panel>
</template>

<script>
/* api */
import * as TaskApi from "@src/api/TaskApi.ts";

/* components */
import TaskSearchForm from "./TaskSearchForm.vue";

/* utils */
import _ from "lodash";
import { formatDate } from "@src/util/lang";
import { isEmptyStringObject } from "@src/util/function";
import { storageGet, storageSet } from "@src/util/storage";

/* constants */
const TASK_HISTORY_KEY = "task_history_list";

export default {
  name: "task-search-panel",
  props: {
    config: {
      type: Array,
      default: [],
    },
    initData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      columnNum: 1,
      formBackup: {},
      selfFields: this.buildSelfFields(),
      visible: false,
    };
  },
  computed: {
    fields() {
      let f = {};
      let fields = [...this.selfFields]
        .filter((f) => f.isSearch || f.isSystem)
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
    panelWidth() {
      return `${420 * this.columnNum}px`;
    },
  },
  mounted() {
    const { column_number } = this.getLocalStorageData();
    if (column_number) this.columnNum = Number(column_number);
  },
  methods: {
    buildParams() {
      const form = this.$refs.searchForm.returnData();

      this.formBackup = Object.assign({}, form);
      const isSystemFields = this.fields.filter((f) => f.isSystem);
      const notSystemFields = this.fields.filter((f) => !f.isSystem);
      let params = {
        conditions: [],
      };
      let tv = null;
      let fn = "";
      // 固定条件
      for (let i = 0; i < isSystemFields.length; i++) {
        tv = isSystemFields[i];
        fn = tv.fieldName;
        // hasRemind
        if (fn === "hasRemind" && form[fn] !== "") {
          params.hasRemind = form[fn] == 2 ? 0 : form[fn];
          continue;
        }

        if (fn === "qrcodeState" && form[fn] !== "") {
          params.qrcodeState = form[fn] == 2 ? 0 : form[fn];
          continue;
        }

        if (fn == "area") {
          params.productAddress = {
            ...(params.productAddress || {}),
            province: form[fn].province,
            city: form[fn].city,
            dist: form[fn].dist,
          };
          continue;
        }

        if (fn === "addressDetail") {
          params.productAddress = {
            ...(params.productAddress || {}),
            address: form[fn],
          };
          continue;
        }

        if (!form[fn] || (Array.isArray(form[fn]) && !form[fn].length)) {
          continue;
        }

        if (typeof form[fn] === "string") {
          let fieldNamsMap = { customer: "customerId", product: "productId" };

          params[fieldNamsMap[fn] ? fieldNamsMap[fn] : fn] = form[fn];
          continue;
        }

        if (tv.formType === "date" || tv.formType === "datetime") {
          params[fn] = form[fn]
            .map((t) => formatDate(t, "YYYY/MM/DD"))
            .join("-");
          continue;
        }

        if (tv.fieldName === "tags") {
          params.tagId = form[fn].map(({ id }) => id).join("");
        }
      }

      // 自定义条件
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
            betweenValue2: formatDate(form[fn][1], "YYYY-MM-DD"),
          });
          continue;
        }

        if (tv.originalFormType === "datetime") {
          params.conditions.push({
            property: fn,
            operator: tv.operator,
            betweenValue1: formatDate(form[fn][0], "YYYY-MM-DD HH:mm:ss"),
            betweenValue2: `${formatDate(form[fn][1], "YYYY-MM-DD")} 23:59:59`,
          });
          continue;
        }

        if (tv.formType === "address") {
          console.log(form[fn]);
          let address = {
            property: fn,
            operator: tv.operator,
          };
          let isEmpty = isEmptyStringObject(form[fn]);

          if (!isEmpty) {
            address.value =
              (form[fn].province || "") +
              (form[fn].city || "") +
              (form[fn].dist || "") +
              (form[fn].address || "");
          }
          params.conditions.push(address);
          continue;
        }

        params.conditions.push({
          property: fn,
          operator: tv.operator,
          value: form[fn],
        });
      }
      // 返回接口数据
      return params;
    },
    buildSelfFields() {
      let fields = this.config;
      return fields;
    },
    getLocalStorageData() {
      const dataStr = storageGet(TASK_HISTORY_KEY, "{}");
      return JSON.parse(dataStr);
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
    open() {
      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
    resetParams() {
      this.formBackup = {};
      this.$refs.searchForm &&
        this.$nextTick(this.$refs.searchForm.initFormVal);
    },
    saveDataToStorage(key, value) {
      const data = this.getLocalStorageData();
      data[key] = value;

      storageSet(TASK_HISTORY_KEY, JSON.stringify(data));
    },
    setAdvanceSearchColumn(command) {
      this.columnNum = Number(command);
      this.saveDataToStorage("column_number", command);
    },
  },
  components: {
    [TaskSearchForm.name]: TaskSearchForm,
  },
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
