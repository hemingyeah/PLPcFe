<template>
  <base-panel :show.sync="visible" :width="panelWidth" @close="hide()">
    <h3 slot="title">
      <span>{{region.viewName || '新建视图'}}</span>
      <el-dropdown
        class="pull-right"
        trigger="click"
        @command="setAdvanceSearchColumn"
      >
        <i
          class="iconfont icon-xitongshezhi customer-panel-btn"
          style="float: none"
        ></i>

        <el-dropdown-menu slot="dropdown" class="customer-advance-setting">
          <el-dropdown-item command="1">一栏</el-dropdown-item>
          <el-dropdown-item command="2">两栏</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </h3>
    <!-- S 搜索条件 -->
    <el-form class="advanced-search-form" onsubmit="return false;">
      <!-- 查看视图 -->
      <div class="task-flex task-ai">
        <div class="task-view-name task-view-view task-flex" v-show="type === 'view'" v-for="(item, index) in searchModelCN" :key="index">
          <span class="task-f14">{{item.key}} :</span>
          <div>
            {{item.value}}
          </div>
        </div>
      </div>
      <!-- S 视图名称 -->
      <div class="task-view-name task-flex task-ai" v-show="type !== 'view'">
        <span class="task-f14">视图名称</span>
        <div>
          <el-input
            placeholder="请输入视图名称"
            v-model="viewName"
          >
        </el-input></div>
        </el-input>
      </div>
      <!-- E 视图名称 -->
      <!-- S 搜索 -->
      <el-form class="advanced-search-form" onsubmit="return false;" v-show="type !== 'view'">
        <div class="task-pointer task-flex task-ai">
          <span class="task-font16 task-mr4">添加查询条件</span>
          <span>
            <el-tooltip
              content="您可以通过“添加”按钮设置更多的查询条件"
              placement="top"
            >
              <i class="iconfont icon-question task-icon"></i>
            </el-tooltip>
          </span>
        </div>
        <task-inquire
          ref="taskInquireParams"
          type="creat"
          :column-num="columnNum"
          :search-model="region.searchModel"
          :config="[...config, ...taskTypeFilterFields]"
          @setting="_setting"
        />
        <!-- 搜索操作按钮 -->
        <slot name="footer"></slot>
      </el-form>
      <!-- E 搜索 -->
      <!-- 全员可见 -->
      <el-checkbox v-model="viewRegion" class="task-view-region" v-show="type !== 'view'">设为全员可见</el-checkbox>
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
import TaskInquire from "./TaskInquire";

/* utils */
import { formatDate } from "@src/util/lang";
import { isEmptyStringObject } from "@src/util/function";
import { storageGet, storageSet } from "@src/util/storage";

/* enum */

import TaskStateEnum from "@model/enum/TaskStateEnum.ts";
/* constants */
import {
  AllotTypeConvertMap,
  FlagConvertMap,
  TaskOnceConvertMap,
  TaskApproveConvertMap,
} from "@src/modules/task/model/TaskConvertMap.ts";

const TASK_HISTORY_KEY = "task_history_list";
const TaskInquireConvertFieldNamesToConditionsMap = {
  customer: "customerId",
  product: "productId",
  tlmName: "tlmId",
};

export default {
  name: "task-view-panel",
  props: {
    region: {
      type: Object,
    },
    customizeList: {
      type: Array,
      default: () => [],
    },
    config: {
      type: Array,
      default: () => [],
    },
    initData: {
      type: Object,
      default: () => ({}),
    },
    searchParams: {
      type: Object,
      default: () => [],
    },
  },
  watch: {
    customizeList() {
      this.taskTypeFilterFields;
      this._taskInquireList();
    },
    region(v) {
      if (!this.region.viewRegion || this.region.viewRegion === "只有我") {
        this.viewRegion = false;
      } else {
        this.viewRegion = true;
      }
      this.viewName = this.region.viewName;
    },
  },
  data() {
    return {
      columnNum: 1,
      formBackup: {},
      selfFields: [],
      taskInquireList: [],
      visible: false,
      guide: true,
      taskAllFields: [],
      taskAllFieldsMap: {},
      viewRegion: false,
      viewName: this.region.viewName,
      searchModelCN: [],
      type: "",
    };
  },
  computed: {
    taskTypeFilterFields() {
      let { customizeList } = this;
      let taskTypeFilterFields = customizeList.filter((item) => {
        return item.isSystem == 0 && item.isSearch;
      });
      return taskTypeFilterFields;
    },
    panelWidth() {
      return `${420 * this.columnNum}px`;
    },
  },
  mounted() {
    if (!this.region.viewRegion || this.region.viewRegion === "只有我") {
      this.viewRegion = false;
    } else {
      this.viewRegion = true;
    }
    this._selfFields();
  },
  methods: {
    /**
     * @description 保存视图 and 编辑视图
     */
    saveViewBtn(fn) {
      const { region } = this;
      region.searchModel.systemConditions = this.buildTaskInquireParams().systemConditions;
      if (!this.viewName) {
        this.$platform.alert("请输入视图名称");
        return;
      }
      region.viewRegion = this.viewRegion ? "所有用户" : "只有我";
      const params = {
        ...region,
        viewName: this.viewName,
      };
      // 编辑
      if (region.viewId) {
        TaskApi.editView(params).then((res) => {
          fn()
        });
        return;
      }

      // 保存
      TaskApi.createView({
        ...region,
        viewName: this.viewName,
      }).then((res) => {
        fn()
      });
    },
    /**
     * 查看视图
     */
    async getOneView(viewId) {
      this.searchModelCN = []
      const { success, result } = await TaskApi.getOneView(viewId);
      if (success) {
        for (let key in result.searchModelCN) {
          this.searchModelCN.push({ key, value: result.searchModelCN[key] });
        }
      }
    },
    _time(time) {
      return time ? formatDate(time) : "";
    },

    _selfFields() {
      const { column_number } = this.getLocalStorageData();
      const searchField = localStorage.getItem("task-search-field");

      if (column_number) this.columnNum = Number(column_number);

      if (searchField) {
        this.selfFields = JSON.parse(searchField).list;
        this._taskInquireList();
      } else {
        this.selfFields = [];
      }
    },

    buildTaskInquireParams() {
      let params = {
        systemConditions: [],
      };
      const taskInquireList = this.$refs.taskInquireParams.returnInquireFields();
      const form = this.$refs.taskInquireParams.returnData();
      this.formBackup = Object.assign(this.formBackup, {
        ...this.$refs.taskInquireParams.returnData(),
      });

      const isSystemFields = taskInquireList.filter((f) => f.isSystem);
      const notSystemFields = taskInquireList.filter((f) => !f.isSystem);

      let tv = null;
      let fn = "";
      // 固定条件
      for (let i = 0; i < isSystemFields.length; i++) {
        tv = isSystemFields[i];
        fn = tv.fieldName;

        if (!form[fn] || (Array.isArray(form[fn]) && !form[fn].length)) {
          continue;
        }

        // 空对象
        if (
          typeof form[fn] === "object"
          && !Array.isArray(form[fn])
          && !Object.keys(form[fn]).length
        ) {
          continue;
        }

        if (tv.formType === "address") {
          let address = {
            property: fn,
            operator: tv.operatorValue,
          };
          let isEmpty = isEmptyStringObject(form[fn]);

          if (!isEmpty) {
            address.value = (form[fn].province || "")
              + (form[fn].city || "")
              + (form[fn].dist || "")
              + (form[fn].address || "");
          }
          params.systemConditions.push(address);
          continue;
        }

        if (tv.fieldName == "tags") {
          let condition = {
            property: fn,
            operator: tv.operatorValue,
            inValue: form[fn].map((tag) => tag.id),
          };
          params.systemConditions.push(condition);
          continue;
        }

        if (tv.fieldName == "state") {
          let condition = {
            property: fn,
            operator: tv.operatorValue,
            inValue: form[fn].map((exception) =>
              TaskStateEnum.getValue(exception)
            ),
          };
          params.systemConditions.push(condition);
          continue;
        }

        if (tv.fieldName == "product") {
          params.systemConditions.push({
            property: "productId",
            operator: tv.operatorValue,
            value: form[fn],
          });
          continue;
        }

        if (tv.fieldName == "allotTypeStr") {
          params.systemConditions.push({
            property: "allotType",
            operator: tv.operatorValue,
            inValue: form[fn].map(
              (exception) => AllotTypeConvertMap[exception] || ""
            ),
          });
          continue;
        }

        if (tv.fieldName == "onceException") {
          params.systemConditions.push({
            property: "flag",
            operator: tv.operatorValue,
            inValue: form[fn].map(
              (exception) => FlagConvertMap[exception] || ""
            ),
          });
          continue;
        }

        if (
          tv.fieldName == "level"
          || tv.fieldName == "serviceType"
          || tv.fieldName == "serviceContent"
          || tv.fieldName == "paymentMethod"
          || tv.fieldName === "createUser"
          || tv.fieldName === "allotUser"
        ) {
          params.systemConditions.push({
            property: fn,
            operator: tv.operatorValue,
            inValue: form[fn],
          });
          continue;
        }

        if (tv.fieldName === "executor") {
          params.systemConditions.push({
            property: "executorUser",
            operator: tv.operatorValue,
            inValue: form[fn],
          });
          continue;
        }

        if (tv.fieldName === "synergyId") {
          params.systemConditions.push({
            property: "synergies",
            operator: tv.operatorValue,
            inValue: form[fn],
          });
          continue;
        }

        if (tv.formType == "date") {
          params.systemConditions.push({
            property: fn,
            operator: tv.operatorValue,
            betweenValue1: formatDate(form[fn][0], "YYYY-MM-DD HH:mm:ss"),
            betweenValue2: `${formatDate(form[fn][1], "YYYY-MM-DD")} 23:59:59`,
          });
          continue;
        }

        if (tv.formType === "datetime") {
          params.systemConditions.push({
            property: fn,
            operator: tv.operatorValue,
            betweenValue1: formatDate(form[fn][0], "YYYY-MM-DD HH:mm:ss"),
            betweenValue2: `${formatDate(form[fn][1], "YYYY-MM-DD")} 23:59:59`,
          });
          continue;
        }

        if (TaskInquireConvertFieldNamesToConditionsMap[fn]) {
          params.systemConditions.push({
            property: TaskInquireConvertFieldNamesToConditionsMap[fn],
            operator: tv.operatorValue,
            value: form[fn],
          });
          continue;
        }

        let value = TaskOnceConvertMap[form[fn]] != undefined
          ? TaskOnceConvertMap[form[fn]]
          : form[fn];
        value = TaskApproveConvertMap[value] != undefined
          ? TaskApproveConvertMap[value]
          : value;

        params.systemConditions.push({
          property: fn,
          operator: tv.operatorValue,
          value,
        });
        params.systemConditions = [
          ...new Set(
            params.systemConditions.map((item) => {
              item = JSON.stringify(item);
              return item;
            })
          ),
        ].map((item) => {
          item = JSON.parse(item);
          return item;
        });
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
          typeof form[fn] === "object"
          && !Array.isArray(form[fn])
          && !Object.keys(form[fn]).length
        ) {
          continue;
        }

        if (tv.formType === "address") {
          let address = {
            property: fn,
            operator: tv.operatorValue,
          };
          let isEmpty = isEmptyStringObject(form[fn]);

          if (!isEmpty) {
            address.value = (form[fn].province || "")
              + (form[fn].city || "")
              + (form[fn].dist || "")
              + (form[fn].address || "");
          }
          params.conditions.push(address);
          continue;
        }

        if (tv.formType === "date") {
          params.conditions.push({
            property: fn,
            operator: tv.operator,
            betweenValue1: formatDate(form[fn][0], "YYYY-MM-DD HH:mm:ss"),
            betweenValue2: `${formatDate(form[fn][1], "YYYY-MM-DD")} 23:59:59`,
          });
          continue;
        }

        if (tv.formType === "cascader") {
          params.conditions.push({
            property: fn,
            operator: tv.operator,
            inValue: form[fn],
          });
          continue;
        }

        if (tv.formType === "datetime") {
          params.conditions.push({
            property: fn,
            operator: tv.operator,
            betweenValue1: formatDate(form[fn][0], "YYYY-MM-DD HH:mm:ss"),
            betweenValue2: `${formatDate(form[fn][1], "YYYY-MM-DD")} 23:59:59`,
          });
          continue;
        }

        //
        if (params.conditions && params.conditions.length) {
          params.conditions = params.conditions.filter((item) => {
            return fn !== item.property;
          });
          params.conditions.push({
            property: fn,
            operator: tv.operatorValue,
            value: form[fn],
          });
        } else {
          params.conditions.push({
            property: fn,
            operator: tv.operatorValue,
            value: form[fn],
          });
        }
      }

      return params;
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
      case "cascader": {
        operator = "cascader";
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
    open(type = "", id) {
      this.visible = true;
      this.type = type;
      this.getOneView(id);
    },
    hide() {
      this.visible = false;
      this.$emit("bj", false)
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
    _taskInquireList(field = "") {
      const searchField = field || localStorage.getItem("task-search-field");
      if (searchField) {
        this.taskInquireList = [
          ...this.config,
          ...this.taskTypeFilterFields,
        ].filter((item, index) => {
          let bool = [
            ...JSON.parse(searchField).checkSystemList,
            ...JSON.parse(searchField).checkCustomizeList,
          ].some((v) => {
            return v === item.displayName;
          });
          if (!bool) {
            return item;
          }
        });
      }
    },
    // 设置查询条件
    _setting({ list, check_system_list, check_customize_list }) {
      const searchField = localStorage.getItem("task-search-field");
      let loc;
      [...this.config, ...this.taskTypeFilterFields].filter((value, index) => {
        let bool = list.some((v) => {
          return value.displayName === v;
        });
        if (bool) {
          this.selfFields.push(value);
        }
      });
      this.selfFields = [
        ...new Set(
          this.selfFields.map((item) => {
            item = JSON.stringify(item);
            return item;
          })
        ),
      ].map((item) => {
        item = JSON.parse(item);
        return item;
      });
      // 设置查询条件的select字段
      if (searchField) {
        this.taskInquireList = [
          ...this.config,
          ...this.taskTypeFilterFields,
        ].filter((value, index) => {
          let bool = [
            ...JSON.parse(searchField).checkSystemList,
            ...JSON.parse(searchField).checkCustomizeList,
            ...list,
          ].some((v) => {
            return v === value.displayName;
          });
          if (!bool) {
            return value;
          }
        });
        loc = {
          list: this.selfFields,
          checkSystemList: [
            ...JSON.parse(searchField).checkSystemList,
            ...check_system_list,
          ],
          checkCustomizeList: [
            ...JSON.parse(searchField).checkCustomizeList,
            ...check_customize_list,
          ],
        };
      } else {
        this.taskInquireList = [
          ...this.config,
          ...this.taskTypeFilterFields,
        ].filter((value, index) => {
          let bool = list.some((v) => {
            return v === value.displayName;
          });
          if (!bool) {
            return value;
          }
        });
        loc = {
          list: this.selfFields,
          checkSystemList: [...check_system_list],
          checkCustomizeList: [...check_customize_list],
        };
      }
      localStorage.setItem("task-search-field", JSON.stringify(loc));
    },
    mergeTaskFields(taskAllFields = []) {
      // 临时这种用法
      this.taskAllFields = taskAllFields.slice();
      this.taskAllFieldsMap = taskAllFields.reduce(
        (acc, field) => (acc[field.fieldName] = field) && acc,
        {}
      );

      let selfFields = [];

      this.selfFields.forEach((field) => {
        let { fieldName } = field;
        let originField = this.taskAllFieldsMap[fieldName];

        selfFields.push(originField ? originField : field);
      });

      this.selfFields = selfFields.slice();

      this.$nextTick(() => {
        this.mergeTaskFieldsForTaskInquire();
      });
    },
    mergeTaskFieldsForTaskInquire() {
      let selfFields = [];

      this.taskInquireList.forEach((field) => {
        let { fieldName } = field;
        let originField = this.taskAllFieldsMap[fieldName];

        selfFields.push(originField ? originField : field);
      });
      this.taskInquireList = selfFields.slice();
    },
  },
  components: {
    [TaskInquire.name]: TaskInquire,
  },
};
</script>

<style lang="scss" scoped>
.advanced-search-form {
  overflow: auto;
  padding: 10px 15px 150px 15px;

  height: calc(100%);
  justify-content: space-between;
  overflow-x: hidden;

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
.hide {
  overflow: hidden;
  padding: 0;
  height: 0;
  width: 0;
}
.task-search-panel-title {
  height: 54px;
  line-height: 54px;
  padding: 0 15px;
}
.task-search-guide {
  position: relative;
  left: 120px;
  margin-bottom: 20px;
  > div {
    &:first-child {
      width: 0;
      height: 0;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-bottom: 6px solid #13c2c2;
      margin-left: 15px;
    }
    &:last-child {
      position: relative;
      width: 267px;
      height: 50px;
      font-size: 14px;
      color: #fff;
      line-height: 50px;
      background-color: #13c2c2;
      box-shadow: 0px 6px 16px 0px rgba(0, 0, 0, 0.08),
        0px 3px 6px -4px rgba(0, 0, 0, 0.12);
      text-align: center;
      border-radius: 4px;
      > span {
        font-size: 12px;
        font-family: fantasy;
        position: absolute;
        top: 8px;
        right: 9px;
        line-height: 10px;
      }
    }
  }
}
.task-view-name {
  padding: 15px 15px 20px 15px;
  > div {
    width: 225px;
  }
  span {
    display: inline-block;
    min-width: 85px;
  }
}
.task-view-region {
  position: absolute;
  bottom: 70px;
  left: 30px;
}
.task-view-view {
  padding: 15px 15px 0 15px;
}
</style>
