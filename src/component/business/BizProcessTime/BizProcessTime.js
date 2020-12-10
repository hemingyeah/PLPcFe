import _ from 'lodash'
/* 工单流程信息状态 */
import TaskStateProcessEnum from '@model/enum/TaskStateProcessEnum.ts'
import { fmt_datetime } from '@src/filter/fmt'

const ClassName = {
  block: 'biz-process-time-block',
  label: 'biz-process-time-block-label',
  text: 'biz-process-time-block-text'
}

const BizProcessTime = {
  name: 'biz-process-time',
  props: {
    state: {
      type: Object,
      default: () => ({})
    },
    data: {
      type: Object,
      default: () => ({})
    },
  },
  computed: {
    isBeforeState() {
      return this.state.isBefore;
    },
    stateValue() {
      return this.state.value;
    }
  },
  methods: {
    renderCommonTime(text, time) {
      return (
        <div class={ ClassName.block }>
          <span class={ ClassName.label}>{ text }：</span>
          <span class={ ClassName.text}>{ fmt_datetime(time) }</span>
        </div>
      )
    },
    judgeIsSameOrContainsState(state) {
      let isStateArray = Array.isArray(this.stateValue);
      return isStateArray ? _.isEqual(state, this.stateValue) : state.indexOf(this.stateValue) > -1
    },
    /* 接单接受时间 */
    renderProcessAcceptTime(createElement) {
      return [
        this.renderCommonTime('接单时间', this.data.acceptTime),
        this.isBeforeState ? this.renderProcessStartTime() : null
      ]
    },
    /* 指派时间 */
    renderProcessAllotTime(createElement) {
      return [
        this.renderCommonTime('指派时间', this.data.allotTime),
        this.isBeforeState ? this.renderCommonTime('接单时间', this.data.acceptTime) : null
      ]
    },
    /* 创建时间 */
    renderProcessCreateTime(createElement) {
      return [
        this.renderCommonTime('创建时间', this.data.createTime),
        this.isBeforeState ? this.renderCommonTime('指派时间', this.data.allotTime) : null
      ]
    },
    /* 完成包括完成之后的 */
    renderProcessFinished(createElement) {
      let { balanceTime, reviewTime, completeTime } = this.data;
      let finishTimeDom = this.renderCommonTime('完成时间', completeTime)
      let balanceTimeDom = this.renderCommonTime('结算时间', balanceTime)
      let reviewTimeDom = this.renderCommonTime('回访时间', reviewTime)
      
      return [
        finishTimeDom,
        balanceTime ? balanceTimeDom : '',
        reviewTime ? reviewTimeDom : '',
      ]
    },
    /* 开始时间 */
    renderProcessStartTime(createElement) {
      return this.renderCommonTime('开始时间', this.data.startTime)
    },
    renderProcessTime(createElement) {
      // 待分配
      let isCreated = this.judgeIsSameOrContainsState(TaskStateProcessEnum.CREATED.value)
      if(isCreated) {
        return this.renderProcessCreateTime(createElement);
      }
      // 已指派
      if(this.stateValue == TaskStateProcessEnum.ALLOCATED.value) {
        return this.renderProcessAllotTime(createElement);
      }
      // 已接受
      if(this.stateValue == TaskStateProcessEnum.ACCEPTED.value) {
        return this.renderProcessAcceptTime(createElement);
      }
      // 进行中
      if(this.stateValue == TaskStateProcessEnum.PROCESSING.value) {
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