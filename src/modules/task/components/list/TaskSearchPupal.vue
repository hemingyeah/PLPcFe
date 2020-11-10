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
      <el-checkbox :indeterminate="isIndeterminateSys" v-model="sysCheckAll" @change="handleCheckAllSysChange"><h3 class="task-mtb13">系统字段</h3></el-checkbox>
      <el-checkbox-group v-model="checkSystemList">
        <el-checkbox :label="item.displayName" v-for="(item, index) in systemList" :key="index" class="wh150"></el-checkbox>
      </el-checkbox-group>
      <template v-if="guideSearchPupal">
        <guide-compoment
          :content="'①选中 ②保存，设置立刻生效'"
          :only-one="true"
          :have-step="false"
          :finish-btn="'试一下'"
          :style="'width:240px;top:250px;margin:auto;left:0;right:0;'"
          :stop-step="guide_stopStep"
          :finish-btn-fn="guide_finishBtnFn"
        ></guide-compoment>
      </template>
      <!-- 自定义字段 -->
      <el-checkbox :indeterminate="isIndeterminateCus" v-model="cusCheckAll" @change="handleCheckAllCusChange" v-if="customizeList.length"><h3 class="task-mtb13">自定义字段</h3></el-checkbox>
      <el-checkbox-group v-model="checkCustomizeList">
        <el-checkbox :label="item.displayName" v-for="(item, index) in customizeList" :key="index" class="wh150" v-if="item.isSearch"></el-checkbox>
      </el-checkbox-group>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="loc();visible = false">取 消</el-button>
      <el-button type="primary" @click="onSubmit">确 定</el-button>
    </div>
  </base-modal>
</template>
<script>
// import guideCompoment from '@src/component/guide/guide';
import { storageGet, storageSet } from '@src/util/storage';

const { TASK_GUIDE_SEARCH_PUPAL } = require('@src/component/guide/taskV2Store');
export default {
  name: "task-search-pupal",
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
  // components: {
  //   [guideCompoment.name]: guideCompoment,
  // },
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
      this.checkList()
    },
    checkCustomizeList() {
      this.checkList()
    }
  },
  data() {
    return {
      sysCheckAll:false,
      cusCheckAll: false,
      visible: false,
      isIndeterminateSys: false,
      isIndeterminateCus: false,
      seoText: "",
      checkSystemList: [], // 选中系统字段
      checkCustomizeList: [], // 选中自定义字段
      systemList: [], // 系统字段
      customizeList: this.taskTypeFilterFields, // 自定义字段
      guideSearchPupal: false,
    }
  },
  mounted() {
    this.systemList = this.config
    this.loc()
  },
  methods: {
    guide_stopStep() {
    },
    guide_finishBtnFn() {
      this.guide_stopStep();
    },
    open() {
      if (storageGet(TASK_GUIDE_SEARCH_PUPAL) && storageGet(TASK_GUIDE_SEARCH_PUPAL) > 0) this.guideSearchPupal = false;
      else this.guideSearchPupal = true, storageSet(TASK_GUIDE_SEARCH_PUPAL, "1");
      this.visible = true;
      const searchField = localStorage.getItem('task-search-field')
      if (searchField) {
        this.checkSystemList = [...new Set(JSON.parse(searchField).checkSystemList)]
        this.checkCustomizeList = [...new Set(JSON.parse(searchField).checkCustomizeList)]
      }  else {
        this.checkSystemList = []
        this.checkCustomizeList = []
      }
    },
    handleCheckAllSysChange(v) {
      this.checkSystemList = v ? this.systemList.map(item => {return item.displayName}) : []
    },
    handleCheckAllCusChange(v) {
      this.checkCustomizeList = v ? this.customizeList.map(item => {return item.displayName}) : []
    },
    loc() {
      const searchField = localStorage.getItem("task-search-field")
      if (searchField) {
        this.checkSystemList = [...new Set(JSON.parse(searchField).checkSystemList)]
        this.checkCustomizeList = [...new Set(JSON.parse(searchField).checkCustomizeList)]
      }
      this.$emit('visible', false)
    },

    checkList() {
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

      if (this.customizeList.length === this.checkCustomizeList.length) {
        this.cusCheckAll = true
      } else {
        this.cusCheckAll = false
      }

      if (!this.checkCustomizeList.length || this.customizeList.length === this.checkCustomizeList.length) {
        this.isIndeterminateCus = false
      } else {
        this.isIndeterminateCus = true
      }
    },
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
    reset() {
      this.systemList = this.config
      this.customizeList = this.taskTypeFilterFields
      this.seoText = ""
    },
    onSubmit() {
      const {checkSystemList, checkCustomizeList, config, taskTypeFilterFields} = this
      let sySet = new Set(checkSystemList)
      let CuSet = new Set(checkCustomizeList)
      let list = [];
      [...config, ...taskTypeFilterFields].forEach(item => {
        [...sySet, ...CuSet].forEach(v => {
          if (v === item.displayName) {
            list.push(item)
          } 
        })
      })
      let params = {
        checkSystemList,
        checkCustomizeList,
        list
      }
      this.visible = false
      this.$emit("taskPupal", params)
      if (!list.length) {
        localStorage.removeItem("task-search-field")
        return
      }
      localStorage.setItem("task-search-field", JSON.stringify(params))
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
