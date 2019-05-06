<template>
  <base-modal title="关联二维码" :show.sync="visible" width="400px" class="base-import-modal" >
    <div class="form-view-row" style="padding: 0" >
      <label style="line-height: 32px">二维码编号</label>
      <div class="form-view-row-content">
        <el-input type="text" v-model="qrocdeId"></el-input>
      </div>
    </div>



    <div class="dialog-footer" style="margin-top: 15px;">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="bind" :disabled="pending">绑定</el-button>
    </div>
  </base-modal>
</template>

<script>

import {
  bindQrcode,
} from '@src/api/ProductApi';

export default {
  name: 'bind-code',
  props: {
    productId: {
      type: String,
      default: ''
    },
  },
  data() {
    return {
      visible: false,
      pending: false,
      qrocdeId: '',
    }
  },
  methods: {
    open() {
      this.visible = true;
    },
    bind() {
      if (!this.qrocdeId || !this.productId) return;

      this.pending = true;
      bindQrcode({
        productId: this.productId,
        qrocdeId: this.qrocdeId

      })
        .then(res => {
          this.pending = false;
          if (res.status) return this.$platform.notification({
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
        .catch(e => console.error('e', e));
    },
    reset() {
      this.visible = false;
      this.qrocdeId = '';
    }
  },
}
</script>

<style lang="scss">

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
  }

</style>