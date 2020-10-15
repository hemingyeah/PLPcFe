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
    <!--  -->
      <div class="task-search-panel-title task-pointer task-flex task-ai" @click="show =!show">
        <i class="iconfont icon-triangle-down task-icon" v-if="!show"></i>
        <i class="iconfont icon-up task-icon" v-else></i>
        <span class="task-font16">常用查询条件</span>
        <span slot="reference" class="task-font14 task-c2 task-ml12 task-mr4" @click.stop="$refs.taskSearchPupal.open()">设置</span>
        <span>
          <el-tooltip content="常用查询条件可以通过“设置”功能，进行添加和修改" placement="top">
            <i class="iconfont icon-question task-icon"></i>
          </el-tooltip>
        </span>
      </div>
    </div>
    <!-- S 搜索条件 -->
    <el-form class="advanced-search-form" onsubmit="return false;">
      <!-- S 搜索条件 -->
      <el-form class="advanced-search-form" onsubmit="return false;">
        <task-search-form
          v-show="show"
          class="task-search-forms"
          :fields="fields"
          ref="searchForm"
          :searchParams="searchParams"
          :form-backup="formBackup"
          :column-num="columnNum"
        >
        </task-search-form>
          <div class="task-pointer task-flex task-ai">
            <span class="task-font16 task-mr4">添加查询条件</span>
            <span>
                <el-tooltip content="您可以通过“添加”按钮设置更多的查询条件" placement="top">
                  <i class="iconfont icon-question task-icon"></i>
                </el-tooltip>
            </span>
          </div>
      <!-- 设置查询条件 -->
        <task-inquire 
          v-if="fields.length"
          ref="taskInquireParams" 
          :columnNum="columnNum" 
          :config="taskInquireList" 
          @setting="_setting"
        />
        <task-inquire 
          v-else
          ref="taskInquireParams" 
          :columnNum="columnNum" 
          :config="[...config, ...taskTypeFilterFields]" 
          @setting="_setting"
        />
        <!-- 搜索操作按钮 -->
        <slot name="footer"></slot>
      </el-form>
      <!-- E 搜索条件 -->
      <!-- 搜索操作按钮 -->
      <slot name="footer"></slot>
    </el-form>
    <!-- E 搜索条件 -->
    <!-- 设置弹框 -->
    <task-search-pupal 
      ref="taskSearchPupal" 
      :config="config" 
      :task-type-filter-fields="taskTypeFilterFields" 
      :task-inquire-list="taskInquireList"
      @taskPupal="_taskPupal"
    />
  </base-panel>
</template>

<script>
/* api */
import * as TaskApi from '@src/api/TaskApi.ts';

/* components */
import TaskSearchForm from './TaskSearchForm.vue';
import TaskSearchPupal from './TaskSearchPupal'
import TaskInquire from './TaskInquire'

/* utils */
import _ from 'lodash';
import { formatDate } from '@src/util/lang';
import { isEmptyStringObject } from '@src/util/function';
import { storageGet, storageSet } from '@src/util/storage';

/* enum */

import TaskStateEnum from '@model/enum/TaskStateEnum.ts';
/* constants */
import { AllotTypeConvertMap, FlagConvertMap, TaskOnceConvertMap, TaskApproveConvertMap } from '@src/modules/task/model/TaskConvertMap.ts';

const TASK_HISTORY_KEY = 'task_history_list';
const MultiFieldNames = ['serviceType', 'serviceContent', 'level', 'paymentMethod', 'state', 'allotTypeStr', 'onceException', 'paymentMethod', 'tag']
const TaskInquireConvertFieldNamesToConditionsMap = {
  customer: 'customerId',
  product: 'productId',
  tlmName: 'tlmId'
}

export default {
  name: 'task-search-panel',
  props: {
    customizeList: {
      type: Array,
      default: () => []
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
      default: () => []
    }
  },
  watch: {
    customizeList() {
      this.taskTypeFilterFields
      this._taskInquireList()
    },
    selfFields() {
      this.fields
    }
  },
  data() {
    return {
      columnNum: 1,
      formBackup: {},
      selfFields: [],
      taskInquireList: [],
      visible: false,
      show: true,
      guide: true,
      taskAllFields: [],
      taskAllFieldsMap: {}
    };
  },
  computed: {
    taskTypeFilterFields() {
      let { customizeList } = this
      let taskTypeFilterFields = customizeList.filter(item => {
        return (item.isSystem == 0 && item.isSearch)
      })
      return taskTypeFilterFields
    },
    fields() {
      let f = {};
      let selfFields = []
      let fields = [...this.selfFields].filter(item => {
        let bool = [...this.taskTypeFilterFields, ...this.config].some(v => {return item.displayName === v.displayName})
        if (bool) return item
      }).map((field) => {
          f = _.cloneDeep(field);
          let formType = f.formType;

          if (formType === 'datetime') {
            formType = 'date';
          }

          if (formType === 'updateTime') {
            f.displayName = '更新时间';
          }
          return Object.freeze({
            ...f,
            isNull: 1,
            formType,
            originalFormType: f.formType,
            operator: this.matchOperator(f),
          });
        })
        // .sort((a, b) => a.orderId - b.orderId);

      fields.forEach(field => {
        let { fieldName } = field
        let originField = this.taskAllFieldsMap[fieldName]
        
        selfFields.push(originField ? originField : field)
      })
      return selfFields;
    },
    panelWidth() {
      return `${420 * this.columnNum}px`;
    },
  },
  mounted() {
    this._selfFields()
  },
  methods: {
    _selfFields() {
      const { column_number } = this.getLocalStorageData();
      const searchField = localStorage.getItem('task-search-field')

      if (column_number) this.columnNum = Number(column_number)

      if (searchField) {
        this.selfFields = JSON.parse(searchField).list
        this._taskInquireList()
      } else {
        this.selfFields = []
      }
    },
    buildParams() {
      const form = {...this.$refs.taskInquireParams.returnData(), ...this.$refs.searchForm.returnData()}
      this.formBackup = Object.assign({}, form)
      const taskInquireList = this.taskInquireList.length ? this.taskInquireList : [...this.config, ...this.taskTypeFilterFields]
      const isSystemFields = [...this.fields, ...taskInquireList].filter((f) => f.isSystem)
      const notSystemFields = [...this.fields, ...taskInquireList].filter((f) => !f.isSystem)
      let params = {
        conditions: [],
      };
      let tv = null;
      let fn = '';
      // 固定条件
      for (let i = 0; i < isSystemFields.length; i++) {
        tv = isSystemFields[i];
        fn = tv.fieldName;
        // hasRemind
        if (fn === 'hasRemind' && form[fn] !== '') {
          params.hasRemind = form[fn] == 2 ? 0 : form[fn];
          continue;
        }

        if (fn === 'qrcodeState' && form[fn] !== '') {
          params.qrcodeState = form[fn] == 2 ? 0 : form[fn];
          continue;
        }

        if (fn == 'area' && form[fn]) {
          params.productAddress = {
            ...(params.productAddress || {}),
            province: form[fn].province,
            city: form[fn].city,
            dist: form[fn].dist,
          };
          continue;
        }

        if (fn === 'addressDetail') {
          params.productAddress = {
            ...(params.productAddress || {}),
            address: form[fn],
          };
          continue;
        }

        if (!form[fn] || (Array.isArray(form[fn]) && !form[fn].length)) {
          continue;
        }

        if (typeof form[fn] === 'string') {
          let fieldNamsMap = { customer: 'customerId', product: 'productId' };

          params[fieldNamsMap[fn] ? fieldNamsMap[fn] : fn] = form[fn];
          continue;
        }

        if (tv.formType === 'date' || tv.formType === 'datetime') {
          params[fn] = form[fn]
            .map((t) => formatDate(t, 'YYYY/MM/DD'))
            .join('-');
          continue;
        }

        if (MultiFieldNames.indexOf(fn) > -1) {
          params[`${fn}s`] = form[fn]
          delete params[fn]
          continue;
        }

        if (tv.fieldName === 'tags') {
          params.tagId = form[fn].map(({ id }) => id).join('');
        }

        params[fn] = form[fn]
      }

      // 自定义条件
      for (let i = 0; i < notSystemFields.length; i++) {
        tv = notSystemFields[i];
        fn = tv.fieldName;
        !tv.operator ? tv['operator'] = this.matchOperator(tv) : ''
        if (!form[fn] || (Array.isArray(form[fn]) && !form[fn].length)) {
          continue;
        }

        // 空对象
        if (
          typeof form[fn] === 'object'
          && !Array.isArray(form[fn])
          && !Object.keys(form[fn]).length
        ) {
          continue;
        }

        if (tv.formType === 'date') {
          params.conditions.push({
            property: fn,
            operator: tv.operator,
            betweenValue1: formatDate(form[fn][0], 'YYYY-MM-DD'),
            betweenValue2: formatDate(form[fn][1], 'YYYY-MM-DD'),
          });
          continue;
        }

        if (tv.formType === 'cascader') {
          params.conditions.push({
            property: fn,
            operator: tv.operator,
            inValue: form[fn]
          });
          continue;
        }

        if (tv.formType === 'datetime') {
          params.conditions.push({
            property: fn,
            operator: tv.operator,
            betweenValue1: formatDate(form[fn][0], 'YYYY-MM-DD HH:mm:ss'),
            betweenValue2: `${formatDate(form[fn][1], 'YYYY-MM-DD')} 23:59:59`,
          });
          continue;
        }
        params.conditions.push({
          property: fn,
          operator: tv.operator,
          value: form[fn],
        });
      }
      this.buildTaskInquireParams(params)

      // 返回接口数据
      return params;
    },
    buildTaskInquireParams(params) {
      const taskInquireList = this.$refs.taskInquireParams.returnInquireFields()
      const form = this.$refs.taskInquireParams.returnData() 
      this.formBackup = Object.assign(this.formBackup, {...this.$refs.taskInquireParams.returnData(), ...this.$refs.searchForm.returnData()});

      const isSystemFields = taskInquireList.filter((f) => f.isSystem);
      const notSystemFields = taskInquireList.filter((f) => !f.isSystem);
      
      params.systemConditions = []

      let tv = null;
      let fn = '';
      // 固定条件
      for (let i = 0; i < isSystemFields.length; i++) {
        tv = isSystemFields[i];
        fn = tv.fieldName;
        
        if (!form[fn] || (Array.isArray(form[fn]) && !form[fn].length)) {
          continue;
        }

        // 空对象
        if (
          typeof form[fn] === 'object'
          && !Array.isArray(form[fn])
          && !Object.keys(form[fn]).length
        ) {
          continue;
        }

        if (tv.formType === 'address') {
          let address = {
            property: fn,
            operator: tv.operatorValue,
          };
          let isEmpty = isEmptyStringObject(form[fn]);

          if (!isEmpty) {
            address.value = (form[fn].province || '')
              + (form[fn].city || '')
              + (form[fn].dist || '')
              + (form[fn].address || '');
          }
          params.systemConditions.push(address);
          continue;
        }

        if (tv.fieldName == 'tags') {
          let condition = {
            property: fn,
            operator: tv.operatorValue,
            value: form[fn].map(tag => tag.id)[0]
          }
          params.systemConditions.push(condition);
          continue;
        }

        if (tv.fieldName == 'state') {
          let condition = {
            property: fn,
            operator: tv.operatorValue,
            value: TaskStateEnum.getValue(form[fn])
          }
          params.systemConditions.push(condition);
          continue;
        }

        if (tv.fieldName == 'product') {
          params.systemConditions.push({
            property: 'productId',
            operator: tv.operatorValue,
            value: form[fn],
          })
          continue
        }

        if (tv.fieldName == 'allotTypeStr') {
          params.systemConditions.push({
            property: 'allotType',
            operator: tv.operatorValue,
            value: AllotTypeConvertMap[form[fn]],
          })
          continue
        }

        if (tv.fieldName == 'onceException') {
          params.systemConditions.push({
            property: 'flag',
            operator: tv.operatorValue,
            value: FlagConvertMap[form[fn]],
          })
          continue
        }

        if (tv.formType == 'date') {
          params.systemConditions.push({
            property: fn,
            operator: tv.operatorValue,
            betweenValue1: formatDate(form[fn][0], 'YYYY-MM-DD'),
            betweenValue2: formatDate(form[fn][1], 'YYYY-MM-DD')
          })
          continue
        }

        if (tv.formType === 'datetime') {
          params.systemConditions.push({
            property: fn,
            operator: tv.operatorValue,
            betweenValue1: formatDate(form[fn][0], 'YYYY-MM-DD HH:mm:ss'),
            betweenValue2: `${formatDate(form[fn][1], 'YYYY-MM-DD')} 23:59:59`
          })
          continue
        }

        if (TaskInquireConvertFieldNamesToConditionsMap[fn]) {
          params.systemConditions.push({
            property: TaskInquireConvertFieldNamesToConditionsMap[fn],
            operator: tv.operatorValue,
            value: form[fn],
          })
          continue
        }

        let value = TaskOnceConvertMap[form[fn]] != undefined ? TaskOnceConvertMap[form[fn]] : form[fn]
        value = TaskApproveConvertMap[value] != undefined ? TaskApproveConvertMap[value] : value

        params.systemConditions.push({
          property: fn,
          operator: tv.operatorValue,
          value
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
          typeof form[fn] === 'object'
          && !Array.isArray(form[fn])
          && !Object.keys(form[fn]).length
        ) {
          continue;
        }

        if (tv.formType === 'address') {
          let address = {
            property: fn,
            operator: tv.operatorValue,
          };
          let isEmpty = isEmptyStringObject(form[fn]);

          if (!isEmpty) {
            address.value = (form[fn].province || '')
              + (form[fn].city || '')
              + (form[fn].dist || '')
              + (form[fn].address || '');
          }
          params.conditions.push(address);
          continue;
        }

        if (tv.formType === 'date') {
          params.conditions.push({
            property: fn,
            operator: tv.operator,
            betweenValue1: formatDate(form[fn][0], 'YYYY-MM-DD'),
            betweenValue2: formatDate(form[fn][1], 'YYYY-MM-DD'),
          });
          continue;
        }

        if (tv.formType === 'cascader') {
          params.conditions.push({
            property: fn,
            operator: tv.operator,
            inValue: form[fn]
          });
          continue;
        }

        if (tv.formType === 'datetime') {
          params.conditions.push({
            property: fn,
            operator: tv.operator,
            betweenValue1: formatDate(form[fn][0], 'YYYY-MM-DD HH:mm:ss'),
            betweenValue2: `${formatDate(form[fn][1], 'YYYY-MM-DD')} 23:59:59`,
          });
          continue;
        }
        
        // 
        if (params.conditions && params.conditions.length) {
          params.conditions = params.conditions.filter(item => {
            return fn !== item.property
          })
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

    },
    getLocalStorageData() {
      const dataStr = storageGet(TASK_HISTORY_KEY, '{}');
      return JSON.parse(dataStr);
    },
    matchOperator(field) {
      let formType = field.formType;
      let operator = '';

      switch (formType) {
      case 'date': {
        operator = 'between';
        break;
      }
      case 'datetime': {
        operator = 'between';
        break;
      }
      case 'select': {
        if (field.setting && field.setting.isMulti) {
          operator = 'contain';
        } else {
          operator = 'eq';
        }
        break;
      }
      case 'user': {
        operator = 'user';
        break;
      }
      case 'cascader': {
        operator = 'cascader';
        break
      }
      case 'address': {
        operator = 'address';
        break;
      }
      case 'location': {
        operator = 'location';
        break;
      }
      default: {
        operator = 'like';
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
      this.$refs.searchForm && this.$nextTick(this.$refs.searchForm.initFormVal)
      this.$refs.taskInquireParams && this.$nextTick(this.$refs.taskInquireParams.initFormVal)
    },
    saveDataToStorage(key, value) {
      const data = this.getLocalStorageData();
      data[key] = value;

      storageSet(TASK_HISTORY_KEY, JSON.stringify(data));
    },
    setAdvanceSearchColumn(command) {
      this.columnNum = Number(command);
      this.saveDataToStorage('column_number', command);
    },
    _taskPupal({list, checkSystemList, checkCustomizeList}) {
      this.selfFields = list

      this._taskInquireList(JSON.stringify({checkSystemList, checkCustomizeList}))

      this.$nextTick(() => {
        this.mergeTaskFieldsForTaskInquire()
      })

    },
    _taskInquireList(field = '') {
      const searchField = field || localStorage.getItem('task-search-field')
      if (searchField){
        this.taskInquireList = [...this.config, ...this.taskTypeFilterFields].filter((item, index) => {
          let bool = [...JSON.parse(searchField).checkSystemList, ...JSON.parse(searchField).checkCustomizeList].some(v => {
            return v === item.displayName 
          })
          if (!bool) {
            return item
          }
        })
      }
    },
    // 设置查询条件
    _setting({item, list, check_system_list, check_customize_list}) {
      const searchField = localStorage.getItem('task-search-field')
      let loc;
      let bool = this.selfFields.some(value => {
        return value.displayName === item.displayName
      })

      if (!bool) {
        this.selfFields.push(item)
      }
      // 设置查询条件的select字段
      if (searchField) {
        this.taskInquireList = [...this.config, ...this.taskTypeFilterFields].filter((value, index) => {
          let bool = [...JSON.parse(searchField).checkSystemList, ...JSON.parse(searchField).checkCustomizeList, ...list].some(v => {
            return v === value.displayName 
          })
          if (!bool) {
            return value
          }
        });
        loc = {
          list: this.selfFields,
          checkSystemList: [...JSON.parse(searchField).checkSystemList, ...check_system_list],
          checkCustomizeList: [...JSON.parse(searchField).checkCustomizeList, ...check_customize_list]
        }
      } else {
        this.taskInquireList = [...this.config, ...this.taskTypeFilterFields].filter((value, index) => {
          let bool = list.some(v => {
            return v === value.displayName 
          })
          if (!bool) {
            return value
          }
        })
        loc = {
          list: this.selfFields,
          checkSystemList: [...check_system_list],
          checkCustomizeList: [...check_customize_list]
        }
      }
      localStorage.setItem('task-search-field', JSON.stringify(loc))
    },
    mergeTaskFields(taskAllFields = []) {
      // 临时这种用法
      this.taskAllFields = taskAllFields.slice()
      this.taskAllFieldsMap = taskAllFields.reduce((acc, field) => ( acc[field.fieldName] = field) && acc, {})

      let selfFields = []

      this.selfFields.forEach(field => {
        let { fieldName } = field
        let originField = this.taskAllFieldsMap[fieldName]
        
        selfFields.push(originField ? originField : field)
      })
      
      this.selfFields = selfFields.slice()
      
      this.$nextTick(() => {
        this.mergeTaskFieldsForTaskInquire()
      })
    },
    mergeTaskFieldsForTaskInquire() {
      let selfFields = []

      this.taskInquireList.forEach(field => {
        let { fieldName } = field
        let originField = this.taskAllFieldsMap[fieldName]
        
        selfFields.push(originField ? originField : field)
      })
      this.taskInquireList = selfFields.slice()
    }
  },
  components: {
    [TaskSearchForm.name]: TaskSearchForm,
    [TaskSearchPupal.name]: TaskSearchPupal,
    [TaskInquire.name]: TaskInquire
  },
};
</script>

<style lang="scss">
.task-search-forms {
    transition: height .5s;
    .form-item {
      width: 340px!important;
    }
}
</style>
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
    left: 110px;
    margin-bottom: 20px;
  >div {
    &:first-child {
      width: 0;
      height: 0;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-bottom: 6px solid #13C2C2;
      margin-left: 15px;
    }
    &:last-child {
      position: relative;
      width: 267px;
      height: 50px;
      font-size: 14px;
      color: #fff;
      line-height: 50px;
      background-color: #13C2C2;
      box-shadow: 0px 6px 16px 0px rgba(0, 0, 0, 0.08), 0px 3px 6px -4px rgba(0, 0, 0, 0.12);
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
</style>
