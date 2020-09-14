import './BizProcess.scss'

import _ from 'lodash'
/* 工单流程信息状态 */
import TaskStateEnum from '@model/enum/TaskStateEnum';
import TaskStateProcessEnum from './TaskStateProcessEnum.ts'

const TaskStateProcessArray = [
  TaskStateProcessEnum.CREATED,
  TaskStateProcessEnum.ALLOCATED,
  TaskStateProcessEnum.ACCEPTED,
  TaskStateProcessEnum.PROCESSING,
  TaskStateProcessEnum.FINISHED
]
const ProcessItemWidth = 162;

const BizProcess = {
  name: 'biz-process',
  props: {
    /* 数据 工单/时间 */
    data: {
      type: Object,
      default: () => ({})
    },
    /* 类型流程信息设置 */
    flowSetting: {
      type: Object,
      default: () => ({})
    },
    /* 模式 */
    mode: {
      type: String,
      default: 'task'
    },
    /* 值 */
    value: {
      type: String,
      default: ''
    },
  },
  data() {
    return {
      taskStateProcessArray: TaskStateProcessArray,
      selected: ''
    }
  },
  computed: {
    /** 
     * @description 获取流程信息 
     * 暂时只支持工单的 所以先写死了
    */
    genStateProcess() {
      return this.taskStateProcessArray
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
    },
    genExceptionStyle() {
      return {
        left: `${ProcessItemWidth * this.genCurrentStateIndex}px`
      }
    },
    // 判断是否是以取消
    isOffed() {
      return this.value === TaskStateEnum.OFFED.value
    },
    // 是否曾回退
    onceRollback() {
      return this.data.onceRollback == 1
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
      state.isSelected = isSelected;

      state.isSelected && className.push('biz-process-state-selected')
      state.isCurrent && className.push('biz-process-state-current')
      state.isBefore && className.push('biz-process-state-before')
      state.isAfter && className.push('biz-process-state-after')
      state.isFirst && className.push('biz-process-state-first')
      state.isLast && className.push('biz-process-state-last')

      return className
    },
    genOverTime() {
      let { allot = {}, accept = {}, finish = {}, start = {} } = this.flowSetting;

      // 待分配
      let isCreated = this.judgeContainsState(TaskStateProcessEnum.CREATED.value)
      if(isCreated) {
        return allot.overTime
      }
      // 已指派
      if(this.value == TaskStateProcessEnum.ALLOCATED.value) {
        return accept.overTime
      }
      // 已接受
      if(this.value == TaskStateProcessEnum.ACCEPTED.value) {
        // 判断是否开启 开始节点
        let isHaveStartAction = start.state === true;
        return isHaveStartAction ? start.overTime : ''
      }
      // 进行中
      if(this.value == TaskStateProcessEnum.PROCESSING.value) {
        return finish.overTime
      }

    },
    /* 判断是否是当前状态 */
    isCurrentState(state) {
      return state.value == this.value || (Array.isArray(state.value) && state.value.indexOf(this.value) > -1);
    },
    judgeContainsState(state) {
      return state.indexOf(this.value) > -1
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
    },
    /* 渲染流程异常状态显示 */
    renderProcessException(h) {
      // 暂停
      let isPaused = this.data.isPaused == 1;
      // 超时
      let isOverTime = this.data.isOverTime == 1;

      if(isPaused) return this.renderProcessPaused();
      if(isOverTime) return this.renderProcessOverTime();
    },
    renderProcessExceptionTextAndIcon(h) {
      // 曾超时
      let onceOverTime = this.data.onceOverTime === 1
      // 曾暂停
      let oncePaused = this.data.oncePaused === 1
      // 位置异常
      let positionException = this.positionException === 1
      // 是否是异常
      let isException = onceOverTime || oncePaused || positionException
      // 提示内容
      let content = []
      onceOverTime && content.push('曾超时')
      oncePaused && content.push('曾暂停')
      positionException && content.push('位置异常')

      let exceptionDom = (
        <div class="biz-process-exception-text">
          <el-tooltip content={ content.join(', ') } placement="top">
            <div>
              <i class="iconfont icon-info"></i>
              <span>工单异常</span>
            </div>
          </el-tooltip>
        </div>
      )

      return isException ? exceptionDom : ''

    },
    /* 渲染工单状态暂停 */
    renderProcessPaused() {
      let style = {
        ...this.genExceptionStyle,
        color: TaskStateEnum.PSUSED.color
      }
      return <div style={ style }> 已暂停 </div>
    },
    /* 渲染工单状态超时 */
    renderProcessOverTime() {
      let style = {
        left: `${ProcessItemWidth * (this.genCurrentStateIndex + .5)}px`,
        color: TaskStateEnum.PSUSED.color
      }
      let overTime = this.genOverTime();
      let overTimeDom = <div>{`时限: ${overTime}小时`}</div>

      return (
        <div style={ style }> 
          已超时 
          { overTime ? overTimeDom : '' }
        </div>
      )
    },
    stateFilterHandler(value) {
      return this.taskStateProcessArray = this.taskStateProcessArray.filter(state => state.value != value);
    }
  },
  created() {
    // 已取消，且 未回退过
    if(this.isOffed && !this.onceRollback) {
      // 根据是否有接单时间判断 是否包含流程 已接受
      let acceptTime = this.data.acceptTime
      // 根据是否有接单时间判断 是否包含流程 进行中
      let startTime = this.data.startTime

      this.taskStateProcessArray = TaskStateProcessArray.slice();

      !acceptTime && this.stateFilterHandler(TaskStateEnum.ACCEPTED.value)
      !startTime && this.stateFilterHandler(TaskStateEnum.PROCESSING.value)

      this.taskStateProcessArray.pop()
      this.taskStateProcessArray.push(TaskStateProcessEnum.OFFED)
    }
  },
  render(h) {
    // 曾回退的 已取消特殊处理
    if(this.isOffed && this.onceRollback) {
      return <div class="biz-process-offed" style={{ backgroundColor: TaskStateEnum.OFFED.color }}>{ TaskStateEnum.OFFED.name }</div>
    }

    return (
      <div class="biz-process-block">
        <div class="biz-process">
          { this.genStateProcess.map((state, index) => this.renderProcessStateItem(h, state, index)) }
          { this.renderProcessExceptionTextAndIcon(h) }
        </div>
        <div class="biz-process-exception">
          { this.renderProcessException(h) }
        </div>
      </div>
    )
  }
}

export default BizProcess;