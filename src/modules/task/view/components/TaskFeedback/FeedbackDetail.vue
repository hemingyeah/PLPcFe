<template>
  <div class="task-feedback-detail">
    <div class="form-view-row">
      <label>服务满意度</label>
      <div class="form-view-row-content" v-if="evaluate.degree">
        <span :class="['evaluate-degree-img', getDegreeImg(evaluate.degree)]"></span>
        <span class="evaluate-degree-text">{{evaluate.degree}}</span>
      </div>
    </div>
    <div class="form-view-row" v-if="evaluateConfig.useStarEvaluate && starEvaluates.length">
      <label>服务评价</label>
      <div class="star-evaluate-row-content">
        <div class="star-evaluate-row" v-for="(name, index) in starEvaluates" :key="index">
          <div class="star-title">{{ name }}</div>
          <base-service-star :value="getStar(index)"></base-service-star>
        </div>
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
  name: 'task-feedback-detail',
  props: {
    evaluate: {
      type: Object,
      default: () => ({})
    },
    evaluateConfig: {
      type: Object,
      default: () => ({})
    },
    evaluateContent: {
      type: String,
      default: ''
    }
  },
  computed: {
    starEvaluates(){
      return this.evaluateConfig.starEvaluates || [];
    },
    starFeilds(){
      return this.evaluateConfig.starEvaluateFeilds || [];
    },
    tagEvaluates(){
      return this.evaluate.evaluateObj?.tagEvaluates || [];
    }
  },
  methods: {
    getDegreeImg(type) {
      if (type === '满意') return 'review-degree-satisfy-active';
      if (type === '一般') return 'review-degree-commonly-active';
      if (type === '不满意') return 'review-degree-unsatisfy-active';
    },
    getStar(i) {
      let evaluate = this.evaluate.evaluateObj || {};
      return evaluate[this.starFeilds[i]] || 0;
    }
  }
}
</script>
