/* components */
import TaskAllotSelect from '@src/modules/task/edit/components/TaskAllotSelect/TaskAllotSelect.vue'
/* utils */
import _ from 'lodash'
import DateUtil from '@src/util/date';  
/* constant */
import { 
  TASK_NO_EXECUTOR_MESSAGE,
  PLATN_TASK_PERIOD_NOT_ZERO_MESSAGE,
  PLATN_TASK_CREATE_TIME_NOT_GREATER_THEAN_PERIOD_TIME_MESSAGE,
  PLATN_TASK_END_TIME_NOT_GREATER_ONE_YEAR_MESSAGE,
  PLATN_TASK_PERFORM_NUMBER_MAX_MESSAGE
} from '@src/model/const/Alert.ts'
import { PLAN_TASK_MAX_DAY, PLAN_TASK_MAX_PERFORM_NUMBER } from '@src/model/const/Number.ts';


const NumberReg = /\D/g;

const PlanTaskEditForm = {
  name: 'plan-task-edit-form',
  initject: ['initData'],
  props: {
    originForm: {
      type: Object,
      default: () => ({})
    },
    taskConfig: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      abortList: [
        {
          label: '按截止日期',
          value: 'date'
        },
        {
          label: '按执行次数',
          value: 'times'
        }
      ],
      form: this.initForm(),
      formValidation: {
        name: true,
        period: true,
        periodUnit: true,
        endTime: true,
        endNum: true,
        advance: true,
      },
      isEdit: false,
      pending: false,
      // 重复周期列表
      repetitionPeriodList: [
        {
          label: '天',
          value: '天'
        },
        {
          label: '周',
          value: '周'
        },
        {
          label: '月',
          value: '月'
        }
      ],
      show: false,
      title: '计划设置'
    }
  },
  computed: {
    /* 是否是 按截止日期 */
    isEndTime() {
      return this.form?.endSetting?.select == this.abortList?.[0]?.value;
    },
    taskAllotSelectEl() {
      return this.$refs.TaskAllotSelect;
    },
    validation() {
      let { name, period, periodUnit, endTime, endNum, advance } = this.formValidation;
      return {
        name: name ? '' : '必填',
        period: period ? '' : '必填',
        periodUnit: periodUnit ? '' : '必选',
        endTime: endTime ? '' : '必选',
        endNum: endNum ? '' : '必填',
        advance: advance ? '' : '必填',
      }
    }
  },
  mounted() {
    // 
  },
  methods: {
    /* 更改派单类型 */
    changeAllotType(value) {
      this.form.allotSetting.allotType = value;
    },
    /* 更改协同人 */
    changeSynergies(value) {
      this.form.allotSetting.synergies = value;
    },
    /* 更改协同人 */
    changeExecutors(value) {
      this.form.allotSetting.executors = value;
    },
    /* 更改重复周期 */
    changePeriod(value) {
      this.form.periodSetting.period = this.formatNumber(value);
      this.validate();
    },
    /* 更改重复周期 */
    changeEndSettingNum(value) {
      this.form.endSetting.num = this.formatNumber(value);
      this.validate();
    },
    /* 更改截止日期前天数 */
    changeAdvance(value) {
      this.form.advance = this.formatNumber(value);
      this.validate();
    },
    fetchExeinsyn(customerId = '') {
      const TaskAllotSelectEl = this.taskAllotSelectEl;
      TaskAllotSelectEl && TaskAllotSelectEl.fetchExeinsynWithCustomerManager(customerId);
    },
    formatNumber(value) {
      return value.replace(NumberReg, '');
    },
    getValidatorValue(key) {
      let { periodSetting, endSetting } = this.form;

      if(key == 'period') return periodSetting.period
      else if(key == 'periodUnit') return periodSetting.periodUnit
      else if(key == 'endTime') return endSetting.time
      else if(key == 'endNum') return endSetting.num
      
      return this.form[key];
    },
    initForm() {
      return {
        // 计划任务id
        id: '',
        // 计划任务名称
        name: '',
        // 周期设置
        periodSetting: {
          // 周期数
          period: 1,
          // 周期单位(天、周、月)
          periodUnit: '天'
        },
        // 截止设置
        endSetting: {
          // 截止单位(times、date)
          select: 'date',
          num: 1,
          time: ''
        },
        // 提前几天创建
        advance: 1,
        // 派单设置
        allotSetting: {
          // 派单方式 (normal、pool、auto)
          allotType: 'normal',
          // 协同人
          synergies: [],
          // 负责人
          executors: []
        }
      }
    },
    /** 
     * @description 提交
    */
    onSubmit: _.debounce(function(){
      // 效验是否必填
      let validated = this.validate();
      if (!validated) return;

      validated = this.validateDataCorrectly();
      if (!validated) return;
      
      // 判断是否选择工单负责人
      let params = this.unPackDataToParams();
      let { allotSetting = {} } = params;
      if(!allotSetting.executorId && allotSetting.allotType == 'normal' ) {
        return this.$platform.alert(TASK_NO_EXECUTOR_MESSAGE);
      }
      
      this.$emit('submit', params);
    }, 500),
    /** 
     * @description 解析数据
     * @param {Object} data 数据
    */
    packData(data = {}) {
      const { advance = '', allotSetting = {}, endSetting = {}, id = '', name = '', periodSetting = {} } = data;
      const { allotType = 'normal', synergies = [], executorId = '', executorName = '' } = allotSetting;
      const { value = '', endBy = '' } = endSetting;
      const { period = 1, periodUnit = '天' } = periodSetting;
      const IsEndTime = endBy == 'date';

      let form = {
        // 计划任务id
        id,
        // 计划任务名称
        name,
        // 周期设置
        periodSetting: {
          // 周期数
          period,
          // 周期单位(天、周、月)
          periodUnit
        },
        // 截止设置
        endSetting: {
          // 截止单位(times、date)
          select: endBy,
          num: IsEndTime ? 1 : value,
          time: IsEndTime ? value : ''
        },
        // 提前几天创建
        advance,
        // 派单设置
        allotSetting: {
          // 派单方式 (normal、pool、auto)
          allotType,
          // 协同人
          synergies,
          // 负责人
          executors: [{ userId: executorId, displayName: executorName }]
        }
      }

      const TaskAllotSelectEl = this.taskAllotSelectEl;
      TaskAllotSelectEl && TaskAllotSelectEl.changeAllotData(form.allotSetting);

      this.$set(this, 'form', form);
    },
    reset() {
      this.form = this.initForm();
    },
    /** 
     * @description 切换状态
     * @param {Object} params 参数
     * @param {Boolean} params.show 是否显示
     * @param {Object} params.data 需要解析的数据
    */
    toggle(show = true, data = {}) {
      if (data && Object.keys(data).length > 0) {
        this.isEdit = true;
        this.packData(data);
      } else {
        this.isEdit = false;
      }

      this.show = show;
      this.validate();
    },
    togglePending(pending = false) {
      this.pending = pending;
    },
    unPackDataToParams(data = {}) {
      let { id, name, periodSetting = {}, endSetting = {}, advance, allotSetting } = this.form;
      let { select, time, num } = endSetting;
      let { allotType, synergies, executors } = allotSetting;
      let executor = executors?.[0] || {};
      let params = {
        id,
        name,
        periodSetting,
        endSetting: {
          endBy: select,
          value: this.isEndTime ? time : num
        },
        advance,
        allotSetting: {
          allotType,
          synergies,
          executorId: executor.userId,
          executorName: executor.displayName
        }
      };

      return params;
    },
    validate() {
      const keys = Object.keys(this.formValidation);
      let val = null;

      return (
        keys
          .map(key => {
            val = this.getValidatorValue(key);
            return this.formValidation[key] = !!val
          })
          .every(bool => bool)
      )
    },
    /** 
     * @description 效验数据正确性
     */
    validateDataCorrectly() {
      let { advance = '', allotSetting = {}, endSetting = {}, id = '', name = '', periodSetting = {} } = this.form;
      let { allotType = 'normal', synergies = [], executorId = '', executorName = '' } = allotSetting;
      let { num, time = '', select = '' } = endSetting;
      let { period, periodUnit = '天' } = periodSetting;
      let IsEndTime = select == 'date';
      let validated = true;
      
      try {
        period = isNaN(Number(period)) ? 0 : Number(period);
        advance = isNaN(Number(advance)) ? 0 : Number(advance);
  
        if (period == 0){
          this.$platform.alert(PLATN_TASK_PERIOD_NOT_ZERO_MESSAGE)
          return validated = false;
        }
        
        if(periodUnit == '天') {
          if(advance > period) {
            this.$platform.alert(PLATN_TASK_CREATE_TIME_NOT_GREATER_THEAN_PERIOD_TIME_MESSAGE)
            return validated = false;
          }
        }
        else if(periodUnit == '周') {
          if(advance > period * 7) {
            this.$platform.alert(PLATN_TASK_CREATE_TIME_NOT_GREATER_THEAN_PERIOD_TIME_MESSAGE)
            return validated = false;
          }
        }
        else if(periodUnit == '月') {
          if(advance > period * 30) {
            this.$platform.alert(PLATN_TASK_CREATE_TIME_NOT_GREATER_THEAN_PERIOD_TIME_MESSAGE)
            return validated = false;
          }
        }
  
        if(IsEndTime) {
          let dateDiff = DateUtil.datedifference(this.originForm.planTime.substr(0, 10), time);
          if(dateDiff > PLAN_TASK_MAX_DAY) {
            this.$platform.alert(PLATN_TASK_END_TIME_NOT_GREATER_ONE_YEAR_MESSAGE)
            return validated = false;
          }
        } else {
          if(Number(num) > PLAN_TASK_MAX_PERFORM_NUMBER){
            this.$platform.alert(PLATN_TASK_PERFORM_NUMBER_MAX_MESSAGE)
            return validated = false;
          }
        }
      } catch (error) {
        validated = false;
        console.warn('validateDataCorrectly -> error', error)
      }

      return validated;
    }
  },
  components: {
    [TaskAllotSelect.name]: TaskAllotSelect
  }
}

export default PlanTaskEditForm;