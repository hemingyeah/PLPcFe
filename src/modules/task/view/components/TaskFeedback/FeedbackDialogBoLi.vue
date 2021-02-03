<template>
  <base-modal title="回访" :show.sync="visible" width="700px" class="task-feedback-dialog">
    <div class="base-modal-content">
      <div class="form-view-row">
        <label>服务满意度：</label>
        <div class="form-view-row-content">
          <label class="degree-item">
            <base-service-star :value="form.evaluate.attribute.boliDegree" @input="marks($event)" :handle="allowModify"></base-service-star>
          </label>
        </div>
      </div>
      <div class="form-view-row">
        <div class="form-view-row-content">
          过程评价（不为5星时，必填）
        </div>
      </div>
      <div class="form-view-row" >
        <label>服务态度：</label>
        <div class="form-view-row-content">
          <label class="degree-item" v-for="item in degreeOption" :key="item">
            <input type="radio" class="hidden" name="boliServiceAttitude" :value="item" v-model="form.evaluate.attribute.boliServiceAttitude" :disabled="!allowModify" />
            <span :class="['evaluate-degree-img', getDegreeImg(item, form.evaluate.attribute.boliServiceAttitude == item)]"></span>
            <span class="degree-text">{{ item }}</span>
          </label>
        </div>
      </div>
      <div class="form-view-row">
        <label>维修结果：</label>
        <div class="form-view-row-content">
          <label class="degree-item" v-for="item in degreeOption" :key="item">
            <input type="radio" class="hidden" name="boliMaintenanceResults" :value="item" v-model="form.evaluate.attribute.boliMaintenanceResults" :disabled="!allowModify" />
            <span :class="['evaluate-degree-img', getDegreeImg(item, form.evaluate.attribute.boliMaintenanceResults == item)]"></span>
            <span class="degree-text">{{ item }}</span>
          </label>
        </div>
      </div>
      <div class="form-view-row">
        <label>是否及时：</label>
        <div class="form-view-row-content">
          <label class="degree-item" v-for="item in degreeOption" :key="item">
            <input type="radio" class="hidden" name="boliOnTime" :value="item" v-model="form.evaluate.attribute.boliOnTime" :disabled="!allowModify" />
            <span :class="['evaluate-degree-img', getDegreeImg(item, form.evaluate.attribute.boliOnTime == item)]"></span>
            <span class="degree-text">{{ item }}</span>
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
  </div></base-modal>
</template>

<script>
/* api */
import * as TaskApi from '@src/api/TaskApi.ts';

/* util */
import _ from 'lodash';

export default {
  name: 'task-feedback-dialog-boli',
  props: {
    task: {
      type: Object,
      default: () => ({})
    },
    evaluateConfig: {
      type: Object,
      default: () => ({})
    },
    taskEvaluate:{
      type:Object,
      default: () => ({})
    }
  },
  data() {
    return {
      visible: false,
      pending: false,
      degreeOption: ['满意', '不满意'],
      allowModify: true, // 是否可以修改客户评价
      hasFeedback: false, // 是否回访过
      evaluateContent: '', // 客户评价(自动回访)
      form: this.buildForm()
    }
  },
  computed: {
    tagEvaluates(){
      return this.evaluateConfig.tagEvaluates || [];
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
    marks(value){
      this.form.evaluate.attribute.boliDegree = value
    },
    buildForm() {
      return {
        taskId: this.task.id,
        suggestion: '',
        evaluate: {
          attribute:{
            boliDegree:0,
            boliServiceAttitude:'',
            boliMaintenanceResults:'',
            boliOnTime:''
          }
        }
      }
    },
    openDialog() {
      // 初始化数据
      this.form = this.buildForm();

      // 判断是否回访过
      if (this.taskEvaluate?.attribute?.boliDegree) {
        this.hasFeedback = true;
        this.form.suggestion = this.task.suggestion || '';
        this.evaluateContent = this.task.evaluateContent || '';
        this.form.evaluate.attribute = this.taskEvaluate.attribute || {};

      }

      // 若已回访过并且满意度设置禁用评价内容可修改时，不可修改
      this.allowModify = !(this.hasFeedback && !this.evaluateConfig.modifyEvaluate);

      this.visible = true;
    },
    async submit(autoClosed) {
      const {boliDegree, boliServiceAttitude, boliMaintenanceResults, boliOnTime} = this.form.evaluate.attribute
     
      // 满意度小于5时服务态度必填校验
      if(boliDegree < 5) {
        let message = [];
        if(!boliServiceAttitude){
          message.push('请选择服务态度')
        }
        if(!boliMaintenanceResults){
          message.push('请选择维修结果')
        } 
        if(!boliOnTime){
          message.push('请选择是否及时')
        }

        // 允许修改客户评价时
        if(message.length > 0 && this.allowModify) return this.$platform.alert(message.join('\n'));
      }

      this.pending = true;

      const checkParams = {
        id: this.task.id,
        suggestion: this.form.suggestion,
        // evaluate: this.form.evaluate
      }
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
      
      TaskApi.reviewTaskBoli(params).then((res) => {
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
    max-width: 120px !important;
  }
}
</style>
