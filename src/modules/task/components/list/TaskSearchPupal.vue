<template>
  <base-modal
    title="设置常用搜索字段"
    :show.sync="visible"
    width="886px"
    class="batch-editing-customer-dialog"
    @cancel="loc()"
  >
    <div class="task-search-content">
      <!-- 搜索 -->
      <div class="task-search-seo task-flex task-ai">
        <div class="task-search-input">
          <el-input placeholder="请输入字段名称" v-model="seoText" class="input-with-select" @keyup.enter.native="taskSearch">
            <el-button slot="append" icon="el-icon-search" @click="taskSearch"></el-button>
          </el-input>
        </div>
        <base-button type="ghost" class="task-ml12" @event="reset">
          重置
        </base-button>
      </div>
      <!-- 系统字段 -->
      <el-checkbox :indeterminate="isIndeterminateSys" v-model="sysCheckAll" @change="handleCheckAllSysChange"><h3 class="task-mtb13" id="task-search-pupal-guide-dom">系统字段</h3></el-checkbox>
      <el-checkbox-group v-model="checkSystemList">
        <el-checkbox :label="item.fieldName" v-for="(item, index) in systemList" :key="index" class="wh150">{{item.displayName}}</el-checkbox>
      </el-checkbox-group>

      <div id="task-search-pupal-guide"></div>

      <!-- 自定义字段 -->
      <el-checkbox :indeterminate="isIndeterminateCus" v-model="cusCheckAll" @change="handleCheckAllCusChange" v-if="customizeList.length"><h3 class="task-mtb13">自定义字段</h3></el-checkbox>
      <el-checkbox-group v-model="checkCustomizeList" @change="checkList">
        <el-checkbox :label="item.fieldName" v-for="(item, index) in customizeList" :key="index" class="wh150" v-if="item.isSearch">{{item.displayName}}</el-checkbox>
      </el-checkbox-group>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="loc();visible = false">取 消</el-button>
      <el-button type="primary" @click="onSubmit">确 定</el-button>
    </div>
  </base-modal>
</template>
<script>

import { storageGet, storageSet } from '@src/util/storage';

const { TASK_GUIDE_SEARCH_PUPAL } = require('@src/component/guide/taskV2Store');
export default {
  name: 'task-search-pupal',
  props: {
    taskTypeFilterFields: { // 自定义
      type: Array,
      default: () => {[]}
    },
    config: { // 系统
      type: Array,
      default: () => {[]},
    },
    taskInquireList: {
      type: Array, // 用于判断
    }
  },
  watch: {
    taskTypeFilterFields(v) {
      this.customizeList = v
    },
    config(v) {
      this.systemList = v
    },
    taskInquireList() {
      this.loc()
    },
    checkSystemList() {
      this._systemList()
    },
  },
  data() {
    return {
      sysCheckAll:false,
      cusCheckAll: false,
      visible: false,
      isIndeterminateSys: false,
      isIndeterminateCus: false,
      seoText: '',
      checkSystemList: [], // 选中系统字段
      checkCustomizeList: [], // 选中自定义字段
      systemList: [], // 系统字段
      customizeList: this.taskTypeFilterFields, // 自定义字段
    }
  },
  mounted() {
    this.systemList = this.config
    this.loc()
  },
  methods: {
    open() {
      if (storageGet(TASK_GUIDE_SEARCH_PUPAL) && storageGet(TASK_GUIDE_SEARCH_PUPAL) > 0) this.$Guide().destroy('task-search-pupal-guide')
      else this.$Guide([{
        content:
  '①选中 ②保存，设置立刻生效',
        haveStep: false,
        nowStep: 1,
        gStyle: 'width:240px;top:250px;margin:auto;left:0;right:0;',
        id: 'task-search-pupal-guide',
        domId:'task-search-pupal-guide-dom',
        finishBtn: '试一下',
      }], 0).create().then(res_=>{if(res_)storageSet(TASK_GUIDE_SEARCH_PUPAL, '1')});
      this.visible = true;
      const searchField = localStorage.getItem('task-search-field')
      if (searchField) {
        this.checkSystemList = [...new Set(JSON.parse(searchField).checkSystemList)]
        this.checkCustomizeList = [...new Set(JSON.parse(searchField).checkCustomizeList)]
      } else {
        this.checkSystemList = []
        this.checkCustomizeList = []
      }
    },
    // 系统全选
    handleCheckAllSysChange(v) {
      this.checkSystemList = v ? this.systemList.map(item => {return item.fieldName}) : []
    },
    // 自定义全选
    handleCheckAllCusChange(v) {
      const searchField = localStorage.getItem('task-search-field')
      if (v) {
        if (searchField) {
          let spare = [...this.customizeList.map(item => {return item.fieldName}), ...JSON.parse(searchField).checkCustomizeList].map(item => {return JSON.stringify(item)})
          this.checkCustomizeList = [...new Set(spare)].map(item => {return JSON.parse(item)})
        } else {
          this.checkCustomizeList = this.customizeList.map(item => {return item.fieldName})
        }
        this.cusCheckAll = true
        this.isIndeterminateCus = false
      } else {
        if (searchField) {
          let spare = this.taskTypeFilterFields.filter(item => {
            return this.checkCustomizeList.indexOf(item.fieldName) !== -1
          }).map(item => {return item.fieldName})
          this.checkCustomizeList = JSON.parse(searchField).checkCustomizeList.filter(item => {return spare.indexOf(item) === -1})
        } else {
          this.checkCustomizeList = []
        }
        this.isIndeterminateCus = false
        this.cusCheckAll = false
      }
    },
    loc() {
      const searchField = localStorage.getItem('task-search-field')
      if (searchField) {
        this.cusCheckAll = false
        this.checkSystemList = [...new Set(JSON.parse(searchField).checkSystemList)]
        this.checkCustomizeList = this.taskTypeFilterFields.filter(item => {
          return [...new Set(JSON.parse(searchField).checkCustomizeList)].indexOf(item.fieldName) !== -1
        }).map(item => {return item.fieldName})

        if (this.checkCustomizeList.length === this.taskTypeFilterFields.length) {
          this.cusCheckAll = true
          this.isIndeterminateCus = false
        } else if (this.checkCustomizeList.length) {
          this.isIndeterminateCus = true
          this.cusCheckAll = false
        } else {
          this.cusCheckAll = false
          this.isIndeterminateCus = false
        }

      }


      this.$emit('visible', false)
    },

    // 系统单选
    _systemList() {
      if (!this.checkSystemList.length || this.systemList.length === this.checkSystemList.length) {
        this.isIndeterminateSys = false
      } else {
        this.isIndeterminateSys = true
      }
      if (this.systemList.length === this.checkSystemList.length) {
        this.sysCheckAll = true
      } else {
        this.sysCheckAll = false
      }
    },

    // 自定义单选
    checkList(v) {
      let customize = this.taskTypeFilterFields.filter(item => {
        return this.checkCustomizeList.indexOf(item.fieldName) !== -1
      }).map(item => {return item.fieldName})
      
      if (customize.length === this.customizeList.length && customize.length) {
        this.cusCheckAll = true
        this.isIndeterminateCus = false
      } else if (customize.length) {
        this.isIndeterminateCus = true
        this.cusCheckAll = false
      } else {
        this.cusCheckAll = false
        this.isIndeterminateCus = false
      }
    },
    // 关键字搜索
    taskSearch() {
      if (!this.seoText) {
        this.reset()
        return
      }
      this.systemList = this.systemList.filter(item => {
        if (item.displayName.indexOf(this.seoText) !== -1) {
          return item
        }
      })
      this.customizeList = this.customizeList.filter(item => {
        if (item.displayName.indexOf(this.seoText) !== -1) {
          return item
        }
      })
    },
    // 重置
    reset() {
      this.systemList = this.config
      this.customizeList = this.taskTypeFilterFields
      this.seoText = ''
    },

    // 确定
    onSubmit() {
      const {checkSystemList, checkCustomizeList, config, taskTypeFilterFields} = this
      let task_search_field = localStorage.getItem('task-search-field')
      let sySet = new Set(checkSystemList)
      let CuSet = new Set(checkCustomizeList)
      let list = task_search_field ? JSON.parse(task_search_field).list : [];
      [...config, ...taskTypeFilterFields].forEach(item => {
        [...sySet, ...CuSet].forEach(v => {
          if (v === item.fieldName) {
            list.push(item)
          } 
        })
      })
      
      console.log(CuSet)
      let filterList = list.filter(item => {
        return [...sySet, ...CuSet].indexOf(item.fieldName) !== -1
      });

      let params = {
        checkSystemList,
        checkCustomizeList,
        list:  [...new Set(filterList.map(item => {return JSON.stringify(item)}))].map(item => {return JSON.parse(item)})
      }
      this.visible = false
      this.$emit('taskPupal', params)
      if (!list.length) {
        localStorage.removeItem('task-search-field')
        return
      }
      localStorage.setItem('task-search-field', JSON.stringify(params))
    }
  }
}
</script>
<style lang="scss">
.task-search-input {
  .el-button {
    background-color: #13c2c2 !important;
    color: #fff !important;
    border-radius: 0 3px 3px 0 !important;
    border: 1px solid #13c2c2 !important;
  }
}
</style>
<style lang="scss" scoped>
.task-search-content {
  padding-bottom: 100px;
}
.task-search-input {
  width: 276px;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
.wh150 {
  min-width: 150px;
  width: auto;
}
</style>
