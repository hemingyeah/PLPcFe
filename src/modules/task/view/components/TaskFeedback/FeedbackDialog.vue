<template>
  <base-modal title="回访" :show.sync="visible" width="700px" class="task-feedback-dialog">
    <div class="base-modal-content">
      <div class="form-view-row">
        <label>服务满意度：</label>
        <div class="form-view-row-content">
          <label class="degree-item" v-for="item in degreeOption" :key="item">
            <input type="radio" class="hidden" name="degree" :value="item" v-model="form.degree" :disabled="!allowModify" />
            <span :class="['evaluate-degree-img', getDegreeImg(item, form.degree == item)]"></span>
            <span class="degree-text">{{ item }}</span>
          </label>
        </div>
      </div>
      <div class="form-view-row" v-if="evaluateConfig.useStarEvaluate && starEvaluates.length">
        <label>服务评价：</label>
        <div class="star-evaluate-row-content">
          <div class="star-evaluate-row" v-for="(name, index) in starEvaluates" :key="index">
            <div class="star-title">{{ name }}</div>
            <base-service-star :value="starValue[starFeilds[index]]" @input="marks(starFeilds[index], $event)" :handle="allowModify"></base-service-star>
          </div>
        </div>
      </div>
      <div class="form-view-row" v-if="evaluateConfig.useTagEvaluate && tagEvaluates.length">
        <label>服务标签：</label>
        <div class="form-view-row-content evaluate-tag">
          <label class="tag-item" v-for="name in tagEvaluates" :key="name">
            <input type="checkbox" class="hidden" :value="name" v-model="tagValue" :disabled="!allowModify">
            <span class="evaliate-tag-item">{{ name }}</span>
          </label>
        </div>
      </div>
      <div class="form-view-row" v-if="evaluateContent">
        <label>客户评价：</label>
        <div class="form-view-row-content">{{ evaluateContent }}</div>
      </div>
      <div class="form-view-row">
        <label>回访备注：</label>
        <div class="form-view-row-content">
          <textarea v-model="form.suggestion" placeholder="请填写回访备注[最多500字]" rows="3" maxlength="500" />
        </div>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false" v-if="!evaluateConfig.autoCloseTask">取 消</el-button>
      <el-button class="close-task-btn" @click="submit(true)" :disabled="pending" v-else>回访并关闭工单</el-button>
      <el-button type="primary" @click="submit(false)" :disabled="pending">回 访</el-button>
    </div>
  </base-modal>
</template>

<script>
/* api */
import * as TaskApi from '@src/api/TaskApi.ts';

/* util */
import _ from 'lodash';

export default {
  name: 'task-feedback-dialog',
  props: {
    task: {
      type: Object,
      default: () => ({})
    },
    evaluateConfig: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      visible: false,
      pending: false,
      degreeOption: ['满意', '一般', '不满意'],
      allowModify: true, // 是否可以修改客户评价
      hasFeedback: false, // 是否回访过
      evaluateContent: '', // 客户评价(自动回访)
      starValue: {}, // 选择的服务评价
      tagValue: [], // 选择的服务标签
      form: this.buildForm()
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
      return this.evaluateConfig.tagEvaluates || [];
    }
  },
  methods: {
    getDegreeImg(type, selected) {
      if (type === '满意') {
        return selected ? 'review-degree-satisfy-active' : 'review-degree-satisfy';
      }

      if (type === '一般') {
        return selected ? 'review-degree-commonly-active' : 'review-degree-commonly';
      }

      if (type === '不满意') {
        return selected ? 'review-degree-unsatisfy-active' : 'review-degree-unsatisfy';
      }
    },
    marks(feild, value){
      this.$set(this.starValue, feild, value);
    },
    buildForm() {
      return {
        taskId: this.task.id,
        degree: '满意',
        suggestion: '',
        evaluate: {
          tagEvaluates: this.tagValue,
          ...this.starValue
        }
      }
    },
    openDialog() {
      // 初始化数据
      this.starValue = {};
      this.tagValue = [];
      this.form = this.buildForm();

      // 判断是否回访过
      if (this.task.degree) {
        this.hasFeedback = true;
        this.form.degree = this.task.degree;
        this.form.suggestion = this.task.suggestion || '';
        this.evaluateContent = this.task.evaluateContent || '';
        this.form.evaluate = this.task.evaluateObj || {};

        // 服务标签
        if(this.evaluateConfig.useTagEvaluate && this.form.evaluate.tagEvaluates) {
          this.form.tagValue = this.tagEvaluates.filter(tags => {
            return this.form.evaluate.tagEvaluates.some(tag => tags == tag);
          })
        }

        // 服务评价
        if(this.evaluateConfig.useStarEvaluate && this.starEvaluates.length) {
          this.starEvaluates.forEach((item, i) => {
            let value = this.form.evaluate[this.starFeilds[i]];
            this.$set(this.starValue, this.starFeilds[i], value || 0);
          })
        }
      }

      // 若已回访过并且满意度设置禁用评价内容可修改时，不可修改
      this.allowModify = !(this.hasFeedback && !this.evaluateConfig.modifyEvaluate);

      this.visible = true;
    },
    async submit(autoClosed) {
      let { useStarEvaluate, starEvaluateNotNull } = this.evaluateConfig;

      // 服务评星必填校验
      if(useStarEvaluate && starEvaluateNotNull) {
        let message = [];
        for(let i = 0; i < this.starEvaluates.length; i++) {
          let name = this.starEvaluates[i];
          if(!this.starValue[this.starFeilds[i]]) {
            message.push(`请评价[${name}]`);
          }
        }

        // 允许修改客户评价时
        if(message.length > 0 && this.allowModify) return this.$platform.alert(message.join('\n'));
      }

      this.pending = true;

      const checkParams = {
        id: this.task.id,
        degree: this.form.degree,
        suggestion: this.form.suggestion,
        evaluateObj: this.form.evaluate
      }

      _.assign(checkParams.evaluateObj, this.starValue);
      checkParams.evaluateObj.tagEvaluates = this.tagValue;

      // 回访是否需要审批
      const result = await this.$http.post(`/task/approve/degreeForView?autoClosed=${autoClosed}`, checkParams);
      if (!result.succ && result.message == '需要审批') {
        this.visible = false;
        this.pending = false;

        this.$emit('proposeApprove', result.data);
        return;
      }

      if (!await this.$platform.confirm('确定要回访该工单？ 回访后不能再次回访')) return this.pending = false;

      const params = _.cloneDeep(this.form);
      params.autoClosed = autoClosed;
      
      TaskApi.reviewTask(params).then((res) => {
        if (res.success) {
          this.$platform.notification({
            type: 'success',
            title: '回访成功'
          })

          window.location.reload();
        } else {
          this.$platform.alert(res.message);
          this.pending = false;
        }
      })
        .catch((err) => {
          this.pending = false;
        })
    }
  }
}
</script>

<style lang="scss">
.task-feedback-dialog {
  .form-view-row {
    padding: 6px 0px;

    .degree-item, .tag-item {
      width: auto !important;
      margin-right: 16px;
      cursor: pointer;
    }

    .tag-item {
      margin-right: 0px;
    }
  }

  .close-task-btn {
    max-width: 120px;
  }
}
</style>
