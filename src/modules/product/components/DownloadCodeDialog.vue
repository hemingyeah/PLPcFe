<template>
  <base-modal title="二维码预览" :show.sync="visible" width="400px" class="base-import-modal" >
    <div class="preview-code">
      <div class="code">
        <div ref="qrcode"></div>
        <p v-if="params.addQrcodeId">{{qrcodeId}}</p>
        <p v-if="params.addTenant">{{codeData.nickName}}</p>
      </div>
      <dl>
        <dt>二维码附件信息</dt>
        <dd>
          <el-checkbox v-model="params.addQrcodeId">二维码编号</el-checkbox>
        </dd>
        <dd>
          <el-checkbox v-model="params.addTenant">公司简称</el-checkbox>
        </dd>
      </dl>
    </div>

    <div class="dialog-footer" style="margin-top: 15px;">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="download" :disabled="pending">下载</el-button>
    </div>
  </base-modal>
</template>

<script>

import QRCode from 'qrcodejs2';
import {
  downloadQrcode,
} from '@src/api/ProductApi';

export default {
  name: 'download-code',
  props: {
    codeData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      visible: false,
      pending: false,
      params: {
        addQrcodeId: false,
        addTenant: false,
      }
    }
  },
  computed: {
    qrcodeId() {
      return this.codeData.qrcodeId;
    }
  },
  methods: {
    open() {
      this.visible = true;
      this.createCode();

    },
    download() {
      const {addQrcodeId, addTenant} = this.params;

      location.href = `${'/product/downloadOneQrcode' + '?addQrcodeId='}${addQrcodeId}&addTenant=${addTenant}&qrcodeId=${this.qrcodeId}`;

    },
    createCode() {
      if(!this.qrcodeId) return;
      let url = `${window.location.origin}/qrcode/${this.codeData.domain}?qrcodeId=${this.qrcodeId}`;
      this.$refs.qrcode.innerHTML = '';
      this.$nextTick(() => {
        let qrcode = new QRCode(this.$refs.qrcode, {
          text: url,
          width: 120,
          height: 120,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H
        });
      })
    },
    reset() {
      this.visible = false;
      this.params = {
        addQrcodeId: false,
        addTenant: false,
      }
    }
  },
}
</script>

<style lang="scss">

  .preview-code {
    display: flex;

    .code {
      p {
        text-align: center;
        line-height: 24px;
        margin: 0;
      }
    }

    dl {
      padding-left: 20px;
      dt {
        line-height: 28px;
        margin-bottom: 8px;
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
  }

</style>