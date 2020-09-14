import './BizProcess.scss'

import _ from 'lodash'
/* 工单流程信息状态 */
import TaskStateProcessEnum from './TaskStateProcessEnum.ts'
/* 工单状态数组 */
const TaskStateProcessArray = [
  TaskStateProcessEnum.CREATED,
  TaskStateProcessEnum.ALLOCATED,
  TaskStateProcessEnum.ACCEPTED,
  TaskStateProcessEnum.PROCESSING,
  TaskStateProcessEnum.FINISHED
]

const BizProcess = {
  name: 'biz-process',
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'task'
    },
    value: {
      type: String,
      default: ''
    },
  },
  data() {
    return {
      selected: ''
    }
  },
  computed: {
    /** 
     * @description 获取流程信息 
     * 暂时只支持工单的 所以先写死了
    */
    genStateProcess() {
      return TaskStateProcessArray
    },
    /* 获取当前状态的索引 */
    genCurrentStateIndex() {
      let index = 0;
      let state = null;

      for(let i = 0; i < this.genStateProcess.length; i++) {
        state = this.genStateProcess[i]
        if (this.isCurrentState(state)) {
          index = i
          break
        }
      }
      
      return index;
    }
  },
  methods: {
    /* 获取流程信息状态的类名 */
    genStateProcessClassName(state, index) {
      let className = ['biz-process-state']
      let isSelected = Array.isArray(this.selected) ? _.isEqual(this.selected, state.value) : this.selected == state.value;

      state.isCurrent = this.genCurrentStateIndex == index
      state.isBefore = this.genCurrentStateIndex > index
      state.isAfter = this.genCurrentStateIndex < index
      state.isFirst = index == 0;
      state.isLast = index == this.genStateProcess.length - 1;

      state.isCurrent && className.push('biz-process-state-current')
      state.isBefore && className.push('biz-process-state-before')
      state.isAfter && className.push('biz-process-state-after')
      state.isFirst && className.push('biz-process-state-first')
      state.isLast && className.push('biz-process-state-last')
      isSelected && className.push('biz-process-state-selected')

      return className
    },
    /* 判断是否是当前状态 */
    isCurrentState(state) {
      return state.value == this.value || (Array.isArray(state.value) && state.value.indexOf(this.value) > -1);
    },
    /* 流程信息点击事件处理 */
    processClickHander(state) {
      if(state.isAfter) {
        return console.warn('Caused: because state is the after process state, So can not click')
      }

      this.selected = state.value;
      this.$emit('change', state.value);
    },
    /* 渲染流程信息状态 */
    renderProcessStateItem(h, state, index) {
      return (
        <div class="biz-process-state" onClick={ e => this.processClickHander(state) } class={ this.genStateProcessClassName(state, index) }>
          <span class="biz-process-left-triangle">
            <span class="biz-process-left-triangle-top"></span>
            <span class="biz-process-left-triangle-bottom"></span>
          </span>
          { state.name }
          <span class="biz-process-right-triangle">
            <span class="biz-process-right-triangle-top"></span>
            <span class="biz-process-right-triangle-bottom"></span>
          </span>
        </div>
      )
    }
  },
  render(h) {
    return (
      <div class="biz-process">
        { this.genStateProcess.map((state, index) => this.renderProcessStateItem(h, state, index)) }
      </div>
    )
  }
}

export default BizProcess;