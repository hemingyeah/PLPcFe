
<template>
  <div class="guide-trade-main" >
    <!-- start 行业信息 -->
    <div class="guide-trade-view guide-main">

      <!-- start 选择行业信息 列表 -->
      <div class="guide-trade-list" v-if="isTradeListShow"> 
        
        <div 
          class="guide-trade-item"
          v-for="(item, index) in tradelistTop" 
          :key="`guide_list_top${index}`" >

          <trade-item
            @event="goGuideDetail"
            :item="item">

          </trade-item>
        </div>
      </div>
      <div class="guide-trade-list guide-trade-list-fot" v-if="isTradeListShow"> 
        <div 
          class="guide-trade-item"
          v-for="(item, index) in tradeListFot" 
          :key="`guide_list_fot${index}`" >

          <trade-item
            @event="goGuideDetail"
            :item="item">

          </trade-item>
        </div>

      </div>
      <!-- end 选择行业信息 列表 -->

      <!-- start 行业详细信息 -->
      <div class="guide-trade-detail" v-else>
        <div class="guide-trade-detail-header">
          <div class="guide-trade-detail-header-left">
            <span>
              <i class="iconfont" :class="tradeSelect.icon">
              </i>
            </span>
          </div>
          <div class="guide-trade-detail-header-right">
            <div class="guide-trade-detail-header-title">
              <span class="guide-trade-detail-header-title-text">
                {{ tradeSelect.text }}
              </span>
              <span class="guide-trade-detail-afresh-btn" @click="prev">
                重新选择
              </span>
            </div>
            <div class="guide-trade-detail-header-subtitle" v-html="tradeSelect.detailHtml">
              
            </div>
          </div>
        </div>

        <!-- start 行业详细信息 功能点列表 -->
        <div class="guide-trade-detail-list">
          <div class="guide-trade-detail-list-item" v-for="(item, index) in tradeSelect.list" :key="`guide_trade_detail_list_item_${index}`">
            <i class="iconfont icon-duihao"></i>
            <span>
              {{ item }}
            </span>
          </div>
        </div>
        <!-- end 行业详细信息 功能点列表 -->
      </div>
      <!-- end 行业详细信息 -->

    </div>
    <!-- end 行业信息 -->

    <!-- start 底部按钮 -->
    <div class="guide-view-footer" v-if="isTradeListShow">
      <span class="guide-view-footer-left">
          
      </span>
      <span @click="jump" class="guide-view-footer-right">
        {{ jumpText }}
        <i class="iconfont icon-right"></i>
      </span>
    </div>
    <div class="guide-view-footer" v-else>
      <base-button @event="next">
        下一步
      </base-button>
    </div>
    <!-- end 底部按钮 -->
  </div>
</template>

<script>
import TradeItem from './component/TradeItem.vue';

export default {
  name: 'guide-step-one-trade',
  data() {
    return {
      isTradeListShow: true,
      // 行业信息列表
      tradelistTop: [
        {
          icon: 'icon-zhizaoyebaix',
          text: '制造业',
          value: '制造业',
          message: 'ABB、三一重工、华中数控等3000+企业在使用',
          detailHtml: 'ABB、三一重工、华中数控等3000+企业在使用，<br> 帮助制造业企业提升服务质量，降低成本，<br> 让服务成为企业新竞争力',
          list: ['智能工单管理', '客户自助报修', '备件仓库、申领管理', '客户信息管理', '满意度自动回访', '产品二维码管理']
        },
        {
          icon: 'icon-hulianwanglanx',
          text: '互联网/IT',
          value: '互联网/IT',
          message: 'Keep、NEC、金桥信息等5000+企业在使用',
          detailHtml: 'Keep、NEC、金桥信息等5000+企业在使用，<br> 用互联网化服务管理新模式，精准管理服务过程，<br> 提升服务质量，为客户营造创新服务体验',
          list: ['智能工单管理', '在线客服中心', '库存管理', '客户档案管理', '自动派单、抢单等创新模式', '客户结算、绩效报告']
        },
        {
          icon: 'icon-fuwuyelanx',
          text: '服务业',
          value: '服务业',
          message: '海尔售后、好阿姨家政、川妹餐饮等1000+企业在使用',
          detailHtml: '海尔售后、好阿姨家政、川妹餐饮等1000+企业在使用，<br> 快速响应客户请求，完善过程管理, <br> 通过卓越服务提高客户复购率',
          list: ['客户在线下单', '就近派单，抢单', '个人奖金计算', '客户信息管理', '库存及申领管理', '自动汇总报表']
        }
      ],
      tradeListFot: [
        {
          icon: 'icon-jianzhujiajulanx',
          text: '建筑家居',
          value: '建筑家居',
          message: '摩恩卫浴、TATA木门等2000+企业在使用',
          detailHtml: '摩恩卫浴、TATA木门等2000+企业在使用，<br> 服务全过程数字化管理，有效提升客户满意度，<br> 通过数据运营提高客户复购率',
          list: ['销售建单、售后接单', '个人效率、佣金管理', '公众号在线提单', '工单费用在线支付', '满意度自动回访', '自动汇总6类报表']
        },
        {
          icon: 'icon-maoyilingshoulanx',
          text: '贸易零售',
          value: '贸易零售',
          message: '德玛仕电商、德国凯驰等3000+企业在使用',
          detailHtml: '德玛仕电商、德国凯驰等3000+企业在使用，<br> 无缝连接销售与售后流程，通过可视化过程管理，<br> 提升客户满意度及复购率',
          list: ['电商O2O服务', '在线客服中心', '个人工作效率统计', '仓库管理', '流程审批', '自动绩效报告']
        },
        {
          icon: 'icon-qitalanx',
          text: '其他',
          value: '其他',
          message: '天梭电梯、优沃医疗等3000+企业在使用',
          detailHtml: '天梭电梯、优沃医疗等3000+企业在使用，<br> 通过数字化服务运营解决方案，<br> 提高企业创新竞争力',
          list: ['工单全过程管理', '多渠道在线客服中心', '服务部门、个人权限管理', '备件仓库管理', '费用计算管理', '自动生成统计报表']
        },
      ],
      tradeOther: {
        icon: 'icon-logo',
        text: '其他',
        value: '其他',
        message: '多数用户正在使用以下功能',
        detailHtml: '多数用户正在使用，<br> 通过数字化服务运营解决方案，<br> 提高企业创新竞争力',
        list: ['工单全过程管理', '多渠道在线客服中心', '服务部门、个人权限管理', '备件仓库管理', '费用计算管理', '自动生成统计报表']
      },
      tradeSelect: {}, // 当前选择的行业
    }
  },

  computed: {
    jumpText() {
      return '跳过选择行业';
    }
  },
  activated() {
    this.isTradeListShow = true;
    this.tradeSelect = {};
  },
  methods: {
    emit(index, { key, value }) {
      this.$emit('next', [index, { key, value}])
    },
    // 跳转行业详情
    goGuideDetail(item) {
      this.tradeSelect = item;
      this.isTradeListShow = false;
    },
    // 跳过
    jump() {
      this.isTradeListShow = false;
      this.tradeSelect = this.tradeOther;
    },
    // 下一步 分配试用资格
    next() {
      this.emit(1, { key: 'profession', value: this.tradeSelect.value });
    },
    // 重新选择， 返回上一步
    prev() {
      this.isTradeListShow = true;
      this.emit(0, { key: 'profession', value: ''});
    }
  },
  components: {
    [TradeItem.name]: TradeItem
  }
}
</script>

<style lang="scss">
.guide-trade-view {
  .iconfont {
    display: inline-block;
    height: 40px;
    width: 40px;

    font-size: 36px;
    line-height: 40px;
    text-align: center;
  }
}

.guide-trade-list {
  display: flex;
  justify-content: space-between;

  .guide-trade-item {
    color: #fff;

    height: 150px;
    width: 240px;

    .trade-item {
      height: 100%;
      margin: 0 auto;
      padding: 0 10px;

      display: flex;
      justify-content: center;
      // align-items: center;

      border-radius: 5px;

    }

  }

}

.guide-trade-list-fot {
  margin-top: 40px;
}

.guide-trade-detail {
  // min-height: 400px;

  .guide-trade-detail-header {
    display: flex;
    padding-top: 5px;

    .guide-trade-detail-header-left {
      color: $color-primary;

      display: flex;
      flex-wrap: wrap;
      justify-content:center;

      flex-wrap: wrap;

      margin-right: 20px;
      width: 40px;
    }

    .guide-trade-detail-header-right {
      border-bottom: 1px solid #d8d8d8;
      flex: 1;
      padding-bottom: 15px;

      .guide-trade-detail-header-title {
        display: flex;
        justify-content: space-between;
        align-items: center;

        line-height:25px;
        &-text {
          font-size: 16px;
        }
        .guide-trade-detail-afresh-btn {
          color: $color-primary;
          cursor: pointer;
        }
    
      }
      .guide-trade-detail-header-subtitle {
        color: #666;
        margin-top: 5px;
        line-height: 20px;
      }
    }

  }

}

.guide-trade-detail-list {
  padding-left: 60px;
  .guide-trade-detail-list-item {
    display: flex;
    justify-content: flex-start;
    align-items: center;

    line-height: 20px;
    margin-top: 20px;

    i {
      color: $color-primary;
      font-size: 20px;
      line-height: 20px;

      height: 20px;
      width: 20px;
    }
    span {
      margin-left: 10px;
    }

  }
}
</style>