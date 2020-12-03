<template>
  <transition name="modal-fade">
    <div class="saleManager-mask" @click.self="close" v-if="show">
      <div class="saleManager transition__container">
        <div class="saleManager-header">
          <h3>专属客服</h3>
          <button type="button" class="btn-text saleManager-close" @click="close">
            <i class="iconfont icon-fe-close"></i>
          </button>
        </div>
        <div v-if="!tenantType" class="saleManager-qrcode">
          <img :src="saleManagerQRCode" alt="专属客服"/>
          <p>钉钉扫码联系专属客服</p>
        </div>
        <!-- <div class="saleManager-qrcode">
          <div class="saleManager-qrcode-block" ref="qrcode"></div>
        </div> -->
        <div class="saleManager-line"></div>
        <div class="saleManager-contact">
          <p>统一客服电话： 010-86461890</p>
          <p>服务监督电话： 13356880540</p>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import QRCode from 'qrcodejs2';

export default {
  name: 'sale-manager',
  inject: ['initData'],
  props: {
    show: { // 是否显示组件
      type: Boolean,
      default: false
    },
    qrcode: {
      type: String,
      default: ''
    },
    serviceGroupUrl: {
      type: String,
      default: ''
    }
  },
  computed: {
    tenantType() {
      return this.initData.tenantType;
    },
    saleManagerQRCode(){
      return `/files/getQrcode?fileName=${this.qrcode}`;
    }
  },
  // watch: {
  //   show(newValue) {
  //     if(newValue) {
  //       this.createCode();
  //     }
  //   }
  // },
  methods: {
    close(){
      this.$emit('update:show', false)
    },
    createCode() {
      let url = this.serviceGroupUrl || '';

      if(!url) return;

      this.$nextTick(() => {
        this.$refs.qrcode.innerHTML = '';
        new QRCode(this.$refs.qrcode, {
          text: url,
          width: 268,
          height: 268,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H
        });
      })
    }
  }
}
</script>

<style lang="scss">
.saleManager-mask{
  @include mask();
  z-index: 999;
  overflow: auto;
}

.saleManager{
  position: relative;
  margin: 100px auto 20px auto;

  background-color: #fff;
  width: 420px;
  box-shadow: 1px 1px 8px rgba(0,0,0,0.15);
  color: #333;
}

.saleManager-close{
  position: absolute;
  top: 12px;
  right: 12px;
  width: 30px;
  height: 30px;
  padding: 0;

  color: #666;

  &:hover{
    color: #e84040;
  }
}

.saleManager-header{
  position: relative;
  padding: 12px 0;

  h3{
    text-align: center;
    margin: 0;
    font-size: 20px;
    line-height: 32px;
  }
}

.saleManager-qrcode{
  padding: 8px 0 28px 0;
  img{
    display: block;
    margin: 0 auto;
    width: 268px;
    height: 268px;
  }

  p{
    color: #797e89;
    text-align: center;
    font-size: 12px;
    margin: 10px 0 0 0;
  }
}

.saleManager-line{
  width: 420px;
  margin: 0 auto;
  height: 1px;
  background-color: #f4f7f5;
}

.saleManager-contact{
  padding: 10px 0 10px 110px;
  p{
    font-size: 14px;
    margin: 0;
    line-height: 24px;
    color: #797e89;
  }
}
</style>

