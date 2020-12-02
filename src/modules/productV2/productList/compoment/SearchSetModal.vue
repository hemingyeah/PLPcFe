<!--  -->
<template>
  <base-modal
    title="设置常用搜索字段"
    :show.sync="visible"
    width="886px"
    class="batch-editing-customer-dialog"
  >
    <div class="task-search-content">
      <!-- 搜索 -->
      <div class="task-search-seo task-flex task-ai">
        <div class="task-search-input">
          <!-- <el-input placeholder="请输入字段名称" v-model="seoText" class="input-with-select" @keyup.enter.native="taskSearch">
            <el-button slot="append" icon="el-icon-search" @click="taskSearch"></el-button>
          </el-input> -->
        </div>
        <!-- <base-button type="ghost" class="task-ml12" @event="reset">
          重置
        </base-button> -->
      </div>
      <!-- 系统字段 -->
      <el-checkbox
        :indeterminate="checkSystemList.length && !sysCheckAll ? true : false"
        v-model="sysCheckAll"
      ><h3 class="task-mtb13">系统字段</h3></el-checkbox
      >
      <el-checkbox-group v-model="checkSystemList">
        <el-checkbox
          :label="item.fieldName"
          v-for="(item, index) in systemList"
          :key="index"
          class="wh150"
        >{{ item.displayName }}</el-checkbox
        >
      </el-checkbox-group>
      <!-- 自定义字段 -->
      <el-checkbox
        :indeterminate="
          checkCustomizeList.length && !sysCheckAll ? true : false
        "
        v-model="cusCheckAll"
        v-if="customizeList.length"
      ><h3 class="task-mtb13">自定义字段</h3></el-checkbox
      >
      <el-checkbox-group v-model="checkCustomizeList">
        <template v-for="(item, index) in customizeList">
          <el-checkbox
            :label="item.fieldName"
            :key="index"
            class="wh150"
            v-if="item.isSearch"
          >{{ item.displayName }}</el-checkbox
          >
        </template>
      </el-checkbox-group>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="onSubmit">确 定</el-button>
    </div>
  </base-modal>
</template>

<script>
import { storageGet, storageSet } from '@src/util/storage';
import { string } from 'mathjs';
let checkSystemList_ = [];
let checkCustomizeList_ = [];
export default {
  name: 'search-set-modal',
  props: {
    fields: {
      type: Array | string,
    },
  },
  computed: {
    systemList() {
      return this.fields.filter((item) => item.isSystem == 1);
    },
    customizeList() {
      return this.fields.filter((item) => item.isSystem == 0);
    },
    sysCheckAll: {
      get() {
        return this.checkSystemList.length == this.systemList.length;
      },
      set(v) {
        this.checkSystemList = v
          ? this.systemList.map((item) => {
            return item.fieldName;
          })
          : [];
      },
    },
    cusCheckAll: {
      get() {
        return this.checkCustomizeList.length == this.customizeList.length;
      },
      set(v) {
        this.checkCustomizeList = v
          ? this.customizeList.map((item) => {
            return item.fieldName;
          })
          : [];
      },
    },
  },
  data() {
    return {
      visible: false,
      checkSystemList: [],
      checkCustomizeList: [],
    };
  },
  watch: {
    visible(newVal, oldVal) {
      if (!newVal) {
        this.checkSystemList = checkSystemList_;
        this.checkCustomizeList = checkCustomizeList_;
      }
    },
  },
  mounted() {
    let obj_ = storageGet('product_search_modal_com_data');
    if (obj_) {
      obj_ = JSON.parse(obj_);
      this.checkSystemList = obj_.checkSystemList;
      this.checkCustomizeList = obj_.checkCustomizeList;
    }
  },
  methods: {
    onSubmit() {
      let rest_ = [];

      this.fields.forEach((item) => {
        if (this.checkSystemList.indexOf(item.fieldName) > -1) {
          rest_.push(item);
        }
        if (this.checkCustomizeList.indexOf(item.fieldName) > -1) {
          rest_.push(item);
        }
      });
      this.$emit('changeDiyFields', rest_);
      checkSystemList_ = this.checkSystemList;
      checkCustomizeList_ = this.checkCustomizeList;
      storageSet(
        'product_search_modal_com_data',
        JSON.stringify({
          checkSystemList: this.checkSystemList,
          checkCustomizeList: this.checkCustomizeList,
          allCheckList: [...this.checkSystemList, ...this.checkCustomizeList],
        })
      );
      this.visible = false;
    },
    open() {
      this.visible = true;
    },
  },
};
</script>
<style lang="scss" scoped></style>
