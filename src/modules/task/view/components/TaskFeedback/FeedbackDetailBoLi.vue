<!--
 * @Author: your name
 * @Date: 2021-02-01 10:13:09
 * @LastEditTime: 2021-02-04 14:22:50
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /shb-fe-pc/src/modules/task/view/components/TaskFeedback/FeedbackDetailBoLi.vue
-->
<template>
  <div class="task-feedback-detail">
    <div class="form-view-row">
      <label>服务满意度</label>
      <div class="star-evaluate-row" >
        <base-service-star :value="getStar()"></base-service-star>
      </div>
    </div>
    <div class="form-view-row">
      <label>服务态度</label>
      <div class="star-evaluate-row-content">
        <label class="degree-item" v-for="item in degreeOption" :key="item">
          <input type="radio" class="hidden" name="boliServiceAttitude" :value="item" v-model="baseEvaluateInfo.boliServiceAttitude" :disabled="true" />
          <span :class="['evaluate-degree-img', getDegreeImg(item, baseEvaluateInfo.boliServiceAttitude == item)]"></span>
          <span class="degree-text">{{ item }}</span>
        </label>
      </div>
    </div>
    <div class="form-view-row">
      <label>维修结果</label>
      <div class="star-evaluate-row-content">
        <label class="degree-item" v-for="item in degreeOption" :key="item">
          <input type="radio" class="hidden" name="boliMaintenanceResults" :value="item" v-model="baseEvaluateInfo.boliMaintenanceResults" :disabled="true" />
          <span :class="['evaluate-degree-img', getDegreeImg(item, baseEvaluateInfo.boliMaintenanceResults == item)]"></span>
          <span class="degree-text">{{ item }}</span>
        </label>
      </div>
    </div>
    <div class="form-view-row">
      <label>是否及时</label>
      <div class="star-evaluate-row-content">
        <label class="degree-item" v-for="item in degreeOption" :key="item">
          <input type="radio" class="hidden" name="boliOnTime" :value="item" v-model="baseEvaluateInfo.boliOnTime" :disabled="true" />
          <span :class="['evaluate-degree-img', getDegreeImg(item, baseEvaluateInfo.boliOnTime == item)]"></span>
          <span class="degree-text">{{ item }}</span>
        </label>
      </div>
    </div>
    <div class="form-view-row" v-if="evaluateConfig.useTagEvaluate && tagEvaluates.length">
      <label>服务标签</label>
      <div class="form-view-row-content evaluate-tag">
        <span class="evaliate-tag-item evaliate-tag-active" v-for="name in tagEvaluates" :key="name">{{ name }}</span>
      </div>
    </div>
    <div class="form-view-row">
      <label>客户评价</label>
      <div class="form-view-row-content" v-if="evaluateContent">{{ evaluateContent }}</div>
    </div>

    <template v-if="evaluate.isReview === 0">
      <div class="form-view-row" v-if="evaluate.reviewUser">
        <label>评价人</label>
        <div class="form-view-row-content">{{ evaluate.reviewUser.displayName }}</div>
      </div>
      <div class="form-view-row" v-if="evaluate.reviewTime">
        <label>评价时间</label>
        <div class="form-view-row-content">{{ evaluate.reviewTime | fmt_datetime }}</div>
      </div>
    </template>

    <div class="form-view-row">
      <label>回访备注</label>
      <div class="form-view-row-content" v-if="evaluate.suggestion">{{ evaluate.suggestion }}</div>
    </div>

    <template v-if="evaluate.isReview === 1">
      <div class="form-view-row" v-if="evaluate.reviewUser">
        <label>回访人</label>
        <div class="form-view-row-content">{{ evaluate.reviewUser.displayName }}</div>
      </div>
      <div class="form-view-row" v-if="evaluate.reviewTime">
        <label>回访时间</label>
        <div class="form-view-row-content">{{ evaluate.reviewTime | fmt_datetime }}</div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'task-feedback-detail-boli',
  props: {
    evaluate: {
      type: Object,
      default: () => ({})
    },
    evaluateContent: {
      type: String,
      default: ''
    },
    taskEvaluate:{
      type:Object,
      default: () => ({})
    }
  },
  data() {
    return {
      degreeOption:['满意', '不满意']
    };
  },
  computed:{
    baseEvaluateInfo(){
      return this.taskEvaluate ? this.taskEvaluate?.attribute : this.evaluate.baseEvaluateInfo?.attribute
    },
    tagEvaluates(){
      return (this.taskEvaluate ? this.taskEvaluate?.attribute.tagEvaluates : this.evaluate.baseEvaluateInfo?.attribute.tagEvaluates) || []
    }
  },
  methods: {
    getDegreeImg(type, selected) {
      if (type === '满意') {
        return selected ? 'review-degree-satisfy-active' : 'review-degree-satisfy';
      }
      if (type === '不满意') {
        return selected ? 'review-degree-unsatisfy-active' : 'review-degree-unsatisfy';
      }
    },
    getStar() {
      let evaluate = this.baseEvaluateInfo?.boliDegree || {};
      return evaluate || 5;
    }
  }
}
</script>
