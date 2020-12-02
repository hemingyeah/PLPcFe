<template>
  <base-modal
    title="关联二维码"
    :show.sync="visible"
    width="400px"
    class="base-import-modal"
  >
    <div class="form-view-row" style="padding: 0">
      <label style="line-height: 32px">二维码编号</label>
      <div class="form-view-row-content flex-x">
        <el-select
          class="flex-1 pos-r"
          popper-class="max-w-488"
          v-model="nowChooseArr"
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
            :label="item.id"
            :value="item.id"
          >
            <div class="flex-x overHideCon-1">
              <div>{{ item.id }}</div>
            </div>
          </el-option>
        </el-select>
      </div>
    </div>

    <div class="dialog-footer" style="margin-top: 15px;">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="bind" :disabled="pending"
      >绑定</el-button
      >
    </div>
  </base-modal>
</template>

<script>
import { searchQrcode } from '@src/api/ProductV2Api';
import {
  bindQrcode,
} from '@src/api/ProductApi';
import _ from 'lodash';

export default {
  name: 'bind-code',
  props: {
    productId: {
      type: String,
      default: '',
    },
  },
  watch:{
    visible(newVal, oldVal){
      if(!newVal){
        this.nowChooseArr = '';
      }
    }
  },
  data() {
    return {
      visible: false,
      pending: false,
      selectLoading:false,
      nowChooseArr:'',
      options:[]
    };
  },
  methods: {
    open() {
      this.visible = true;
    },
    bind() {
      if (!this.nowChooseArr || !this.productId) return;

      this.pending = true;
      bindQrcode({
        productId: this.productId,
        qrocdeId: this.nowChooseArr,
      })
        .then((res) => {
          this.pending = false;
          if (res.status)
            return this.$platform.notification({
              title: '失败',
              message: res.message || '发生未知错误',
              type: 'error',
            });
          this.reset();
          this.$eventBus.$emit('product_view.update_detail');
          this.$eventBus.$emit('product_info_record.update_record_list');
          return this.$platform.notification({
            title: '绑定二维码成功',
            type: 'success',
          });
        })
        .catch((e) => console.error('e', e));
    },
    reset() {
      this.visible = false;
      this.nowChooseArr = '';
    },

    lenovoselectSearchData: _.debounce(function(e) {
      this.selectLoading = true;
      searchQrcode({
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
  },
};
</script>

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
