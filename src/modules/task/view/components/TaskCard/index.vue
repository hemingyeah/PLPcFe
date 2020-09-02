<template>
  <div class="task-tab-container task-card-tab">
    <div class="card-info-container" v-for="card in taskCards" :key="card.cardId">
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
  props: {
    shareData: {
      type: Object,
      default: () => ({})
    },
    initData: {
      type: Object,
      default: () => ({})
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
    }
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
  .card-info-container {
    min-height: 300px;
    margin-top: 12px;

    .card-name {
      color: #333;
    }
  }
}
</style>
