<template>
  <div class="guide-qrcode-view">

    <!-- start 标题 -->
    <div class="guide-qrcode-title">

      <div class="guide-qrcode-content">
        <i class="iconfont icon-morenyixuan"></i>
        <span>系统配置完成</span>
      </div>

    </div>
    <!-- end 标题 -->

    <div class="guide-qrcode-subtitle">
      我们为您提供以下服务
    </div>

    <div class="guide-qrcode-service-lists">
      <div class="guide-qrcode-service-list" v-for="(item, index) in serviceList" :key="`guide_qrcode_service_list${index}`">
        <div class="guide-qrcode-service-list-icon">
          <i class="iconfont" :class="item.icon"></i>
        </div>
        <span> {{ item.text }} </span>
      </div>
    </div>

    <!-- start 电话 -->
    <div class="guide-qrcode-phone">
      客服电话：<span>{{ phone }}</span>
    </div>
    <!-- end 电话 -->

    <!-- start 底部 -->
    <div class="guide-qrcode-footer">
      <base-button @event="systemIn">
        进入系统
      </base-button>
    </div>
    <!-- <div class="guide-view-footer">
      <base-button @event="systemIn">
        进入系统
      </base-button>
    </div> -->
    <!-- end 底部 -->

  </div>
</template>

<script>
export default {
  name: 'guide-step-four-qrcode',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      phone: '010-86461890',
      serviceList: [
        {
          icon: 'icon-beijianguanli',
          text: '业务流程梳理'
        },
        {
          icon: 'icon-xitongguanli',
          text: '售后宝后台设置'
        },
        {
          icon: 'icon-shu',
          text: '产品操作培训'
        }
      ]
    }
  },
  computed: {
    qrCode(){
      return `/files/getQrcode?fileName=${this.data.qrcode}`;
    },
  },
  methods: {
    // 进入系统
    systemIn() {
      this.$emit('next', [3, { key: 'isShowUserGuide', value: true }]);
      this.$platform.refreshTab('HOME');
    }
  },
}
</script>

<style lang="scss">
.guide-qrcode-view {
  height: 100%;
  text-align: center;

  .guide-qrcode-title {
    color: #333;
    font-size: 24px;

    padding: 35px 0 65px;
  }


  .guide-qrcode-content {
    display: flex;
    flex-wrap: nowrap;
    flex-flow: column;
    
    i {
      color: rgb(80, 168, 151);
      font-size: 90px;
    }

    span {
      line-height: 33px;
    }

  }

  img {
    height: 150px;
    width: 150px;
  }

  .guide-qrcode-tip {
    color: #666;
    line-height: 20px;
    padding: 15px 0 35px;
  }

}

.guide-qrcode-subtitle {
  color: #333;
  font-size: 18px;
  line-height: 25px;

  position: relative;

  &::before,
  &::after {
    background-color:#d8d8d8;
    content: "";

    height: 1px;
    width: 240px;

    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }
  &::before {
    left: 0;
  }
  &::after {
    right: 0
  }

}

.guide-qrcode-service-lists {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;

  padding: 35px 110px;

  .guide-qrcode-service-list {
    width: 100px;

    &-icon {
      background-color: $color-primary;
      border-radius: 50%;
      color: #fff;
      line-height: 40px;
      text-align: center;

      width: 40px;
      height: 40px;
      margin: 0 auto;

      i {
        font-size: 22px;
      }

    }

    span {
      display: inline-block;
      margin-top: 10px;
    }

  }
}

.guide-qrcode-phone {
  color: #333;

  span {
    color: $color-primary;
  }

}

.guide-qrcode-footer {
  padding-top: 25px;

  .base-button {
    border-radius: 5px;

    height: 38px;
    width: 120px;
  }
}
</style>