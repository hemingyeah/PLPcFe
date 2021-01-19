<template>
  <div class="task-tab-container task-card-tab">
    <!-- start 附加组件名称 快速定位 -->
    <div class="card-name-list">
      <span
        :class="{'active': activeClass == index }"
        v-for="(card, index) in taskCards"
        :key="index"
        @click="scrollTo(index)"
      >{{ card.cardName }}</span>
    </div>
    <!-- end 附加组件名称 快速定位 -->

    <!-- start 附加组件内容 -->
    <div class="card-info-list" ref="cardLists">

      <div class="card-info-container" v-for="card in taskCards" :key="card.cardId" :id="card.cardId">
        <h3 class="card-name">{{ card.cardName }}</h3>

        <!-- start 单次 -->
        <template v-if="card.inputType == 'single'">
          <single-card
            :task="task"
            :card="card"
            :value="getCardValue(card.cardId)"
            :task-allow-update="initData.isAllowUpdate"
          />
        </template>
        <!-- end 单次 -->

        <!-- start 多次 -->
        <template v-else-if="card.inputType == 'multiple'">

          <!-- start 工时记录附加组件 -->
          <template v-if="card.specialfrom == '工时记录'">
            <hours-record-card
              :task="task"
              :card="card"
              :task-allow-update="initData.isAllowUpdate"
            />
          </template>
          <!-- end 工时记录附加组件 -->

          <!-- start 其他多次附加组件 -->
          <template v-else>
            <multiple-card
              :task="task"
              :card="card"
              :value="getCardValue(card.cardId)"
              :task-allow-update="initData.isAllowUpdate"
            />
          </template>
          <!-- end 其他多次附加组件 -->

        </template>
        <!-- end 多次 -->
      </div>
    </div>
    <!-- end 附加组件内容 -->
  </div>
</template>

<script>
/* components */
import SingleCard from './SingleCard';
import MultipleCard from './MultipleCard';
import HoursRecordCard from './HoursRecordCard';

/* util */
import * as Utils from '@src/component/form/util';

export default {
  name: 'task-detail-card',
  inject: ['initData'],
  props: {
    shareData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      activeClass: 0
    }
  },
  computed: {
    /** 
    * @description 工单详情数据
    */
    task() {
      return this.shareData.task;
    },
    /** 
    * @description 附加组件tab
    */
    taskCards() {
      // 多选格式调整
      this.initData.cardInfo.forEach(card => {
        card.fields = Utils.migration(card.fields || []);
      })

      // 过滤没有权限的附加组件
      return this.initData.cardInfo.filter(card => {
        let { canWrite, canRead, canCreate, canDelete } = card;
        return (canWrite || canRead || canCreate || canDelete) && card.fields.length;
      })
    }
  },
  methods: {
    /** 
    * @description 获取指定附加组件数据
    */
    getCardValue(cardId) {
      let { cardInfo = [] } = this.task;
      return cardInfo.filter(card => card.cardId == cardId)[0];
    },
    /** 
    * @description 锚点滚动定位
    */
    scrollTo(index) {
      this.activeClass = index;

      let jump = document.querySelectorAll('.card-info-container');
      jump[index].scrollIntoView({ block: 'start', behavior: 'smooth' });
    },
    /** 
    * @description 滚动事件
    */
    scroll(e) {
      let cardInfos = document.querySelectorAll('.card-info-container');

      for (let i = 0; i < cardInfos.length; i++ ) {
        if (e.target.scrollTop >= cardInfos[i].offsetTop - cardInfos[0].offsetTop) {
          this.activeClass = i;
        }
      }
    }
  },
  mounted() {
    this.$refs.cardLists.addEventListener('scroll', this.scroll);
  },
  components: {
    [SingleCard.name]: SingleCard,
    [MultipleCard.name]: MultipleCard,
    [HoursRecordCard.name]: HoursRecordCard
  }
}
</script>

<style lang="scss">
.task-card-tab {
  height: 100%;
  padding: 0 !important;
  background: $bg-color-l1;
  overflow: hidden;

  display: flex;
  flex-direction: column;

  // 附加组件名称
  .card-name-list {
    padding: 12px 12px 8px;
    background-color: #fff;
    border-bottom: 1px solid $bg-color-l1;

    span {
      color: $text-color-regular;
      margin: 0 20px 4px 0;
      display: inline-block;

      &:hover {
        color: $text-color-primary;
        cursor: pointer;
      }
      &.active {
        color: $color-primary;
      }
    }
  }

  // 附加组件内容
  .card-info-list {
    flex: 1;
    overflow: auto;

    .card-info-container {
      background-color: #fff;
      border-radius: 4px;

      &:not(:first-child) {
        margin-top: 12px;
      }

      .card-name {
        padding: 12px 12px 0 34px;
        color: $text-color-primary;
        font-size: $font-size-base;
        font-weight: 500;

        background: url(../../../../../assets/img/task/card_icon.png) no-repeat 12px 15px;
        background-size: 14px 14px;
      }

      .btn-group {
        padding: 12px;

        .el-button--mini {
          max-width: 82px;
          padding: 7px 4px;
        }
      }

      .multiple-card-container {
        padding-top: 4px;
      }
    }
  }
}
</style>
