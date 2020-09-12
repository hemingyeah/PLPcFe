import './BizProcess.scss'
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
  computed: {
    /** 
     * @description 获取流程信息 
     * 暂时只支持工单的 所以先写死了
    */
    genStateProcess() {
      return TaskStateProcessArray
    },
    genCurrentStateIndex() {
      let index = 0;
      let state = null;

      for(let i = 0; i < this.genStateProcess.length; i++) {
        state = this.genStateProcess[i]
        let isCurrent = state.value == this.value || (Array.isArray(state.value) && state.value.indexOf(this.value) > -1)
        if (isCurrent) {
          index = i
          break
        }
      }
      
      return index;
    }
  },
  methods: {
    genStateProcessClassName(state, index) {
      let className = ['biz-process-state']
      let isCurrent = this.genCurrentStateIndex == index
      let isBefore = this.genCurrentStateIndex > index
      let isAfter = this.genCurrentStateIndex < index
      let isFirst = index == 0;
      let isLast = index == this.genStateProcess.length - 1;

      isCurrent && className.push('biz-process-state-current')
      isBefore && className.push('biz-process-state-before')
      isAfter && className.push('biz-process-state-after')
      isFirst && className.push('biz-process-state-first')
      isLast && className.push('biz-process-state-last')

      return className
    },
    renderProcessStateItem(h, state, index) {
      return (
        <div class="biz-process-state" class={ this.genStateProcessClassName(state, index) }>
          <span class="biz-process-left-triangle"></span>
          { state.name }
          <span class="biz-process-right-triangle"></span>
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