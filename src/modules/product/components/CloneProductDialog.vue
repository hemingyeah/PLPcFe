<!--  -->
<template>
  <el-dialog
    title="复制产品信息"
    :visible.sync="visible"
    width="600px"
    :close-on-click-modal="false"
  >
    <div class="add-menu-dialog-box">
      <div class="flex-x copy-el-form-item">
        <div class="lable-100">
          产品
        </div>
        <el-select
          class="flex-1 pos-r"
          popper-class="max-w-488"
          v-model="nowChooseData"
          filterable
          remote
          collapse-tags
          clearable
          placeholder="请输入关键词"
          :remote-method="lenovoselectSearchData"
          :loading="selectLoading"
        >
          <el-option
            v-for="item in options"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
            <div class="flex-x overHideCon-1">
              <div>{{ item.name }}</div>
            </div>
          </el-option>
        </el-select>
      </div>
    </div>
    <div slot="footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" :loading="btnLoading" @click="confirm"
      >确认</el-button
      >
    </div>
  </el-dialog>
</template>

<script>
import _ from 'lodash';
import { searchProduct } from '@src/api/ProductV2Api';
export default {
  name: 'clone-product-dialog',
  props: {
    visibleProp: {
      type: Boolean,
    },
  },
  computed: {
    visible: {
      get() {
        return this.visibleProp;
      },
      set(val) {
        this.$emit('changeVisibleProp', val);
      },
    },
  },
  data() {
    return {
      nowChooseData: '',
      btnLoading: false,
      selectLoading: false,
      options: [],
    };
  },
  watch:{
    visible(newVal, oldVal) {
      if (newVal == false) {
        this.nowChooseData = '';
      }
    },
  },
  methods: {
    lenovoselectSearchData: _.debounce(function(e) {
      this.selectLoading = true;
      searchProduct({
        keyWord: e,
        pageSize: 50,
        pageNum: 1,
      })
        .then((res) => {
          if (!res) {
            return;
          }
          this.options = res.result.list;
        })
        .catch((err) => {})
        .finally(() => {
          this.selectLoading = false;
        });
    }, 800),
    changeBtnLoading(e) {
      this.btnLoading = e;
    },
    confirm() {
      this.$emit('confirm', { nowChooseData: this.nowChooseData });
    },
  },
};
</script>
<style lang="scss" scoped>
.add-menu-dialog-box {
  padding: 12px 12px 0 0;
}
.lable-100 {
  width: 100px;
  padding-left: 20px;
}
.copy-el-form-item {
  margin-bottom: 18px;
}
.checked-item {
  background: $color-primary;
}
</style>
<style lang="scss">
.el-dialog__body {
  border-top: 1px solid rgba(0, 0, 0, 0.09);
  border-bottom: 1px solid rgba(0, 0, 0, 0.09);
  padding: 0;
}

.el-select-dropdown__item {
  height: auto;
}
</style>
