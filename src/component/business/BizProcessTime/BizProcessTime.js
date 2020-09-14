import _ from 'lodash'
/* 工单流程信息状态 */
import TaskStateProcessEnum from './../BizProcess/TaskStateProcessEnum.ts'
import { fmt_datetime } from './.././../../filter/fmt'

const ClassName = {
  block: 'biz-process-time-block',
  label: 'biz-process-time-block-label',
  text: 'biz-process-time-block-text'
}

const BizProcessTime = {
  name: 'biz-process-time',
  props: {
    state: {
      type: String | Array,
      default: ''
    },
    data: {
      type: Object,
      default: () => ({})
    },
  },
  computed: {

  },
  methods: {
    judgeIsSameOrContainsState(state) {
      let isStateArray = Array.isArray(this.state);
      return isStateArray ? _.isEqual(state, this.state) : state.indexOf(this.state) > -1
    },
    /* 接单接受时间 */
    renderProcessAcceptTime(createElement) {
      return (
        <div class={ ClassName.block }>
          <span class={ ClassName.label}>接单时间：</span>
          <span class={ ClassName.text}>{ fmt_datetime(this.data.acceptTime) }</span>
        </div>
      )
    },
    /* 指派时间 */
    renderProcessAllotTime(createElement) {
      return (
        <div class={ ClassName.block }>
          <span class={ ClassName.label}>指派时间：</span>
          <span class={ ClassName.text}>{ fmt_datetime(this.data.allotTime) }</span>
        </div>
      )
    },
    /* 创建时间 */
    renderProcessCreateTime(createElement) {
      return (
        <div class={ ClassName.block }>
          <span class={ ClassName.label}>创建时间：</span>
          <span class={ ClassName.text}>{ fmt_datetime(this.data.createTime) }</span>
        </div>
      )
    },
    /* 完成包括完成之后的 */
    renderProcessFinished(createElement) {
      let { balanceTime, reviewTime, completeTime } = this.data;
      let finishTimeDom = (
        <div class={ ClassName.block }>
          <span class={ ClassName.label}>完成时间：</span>
          <span class={ ClassName.text}>{ fmt_datetime(completeTime) }</span>
        </div>
      )
      let balanceTimeDom = (
        <div class={ ClassName.block }>
          <span class={ ClassName.label}>结算时间：</span>
          <span class={ ClassName.text}>{ fmt_datetime(balanceTime) }</span>
        </div>
      )
      let reviewTimeDom = (
        <div class={ ClassName.block }>
          <span class={ ClassName.label}>回访时间：</span>
          <span class={ ClassName.text}>{ fmt_datetime(reviewTime) }</span>
        </div>
      )
      
      return [
        finishTimeDom,
        balanceTime ? balanceTimeDom : '',
        reviewTime ? reviewTimeDom : '',
      ]
    },
    /* 开始时间 */
    renderProcessStartTime(createElement) {
      return (
        <div class={ ClassName.block }>
          <span class={ ClassName.label}>开始时间：</span>
          <span class={ ClassName.text}>{ fmt_datetime(this.data.startTime) }</span>
        </div>
      )
    },
    renderProcessTime(createElement) {
      // 待分配
      let isCreated = this.judgeIsSameOrContainsState(TaskStateProcessEnum.CREATED.value)
      if(isCreated) {
        return this.renderProcessCreateTime(createElement);
      }
      // 已指派
      if(this.state == TaskStateProcessEnum.ALLOCATED.value) {
        return this.renderProcessAllotTime(createElement);
      }
      // 已接受
      if(this.state == TaskStateProcessEnum.ACCEPTED.value) {
        return this.renderProcessAcceptTime(createElement);
      }
      // 进行中
      if(this.state == TaskStateProcessEnum.PROCESSING.value) {
        return this.renderProcessStartTime(createElement);
      }
      // 已完成
      let isFinished = this.judgeIsSameOrContainsState(TaskStateProcessEnum.FINISHED.value)
      if(isFinished) {
        return this.renderProcessFinished(createElement);
      }
    }
  },
  render(h) {
    return (
      <div class="biz-process-time">
        { this.renderProcessTime(h) }
      </div>
    )
  }
}

export default BizProcessTime;