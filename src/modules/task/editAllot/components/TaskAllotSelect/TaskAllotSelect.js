import { getCustomerExeinsyn } from '@src/api/CustomerApi.ts';

const TaskAllowSelect = {
  name: 'task-allot-select',
  props: {
    taskConfig: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      allotType: 'normal',
      allotTypeMap: {
        pool: {
          text: '派单到工单池',
          value: 'pool'
        },
        normal: {
          text: '派单到工单负责人',
          value: 'normal'
        },
        auto: {
          text: '自动分配',
          value: 'auto'
        },
        allot: {
          text: '保存至待分配列表',
          value: 'waitDistribution'
        }
      },
      value: {
        executors: [],
        synergies: []
      }
    }
  },
  computed: {
    /* 自动派单 */
    autoDispatch() {
      return this.taskConfig?.autoDispatch === true;
    },
    /* 是否按团队派单 */
    isAllotByTag() {
      return this.taskConfig?.allotByTag === true;
    },
    /* 是否显示选择负责人 */
    isShowSelectExecutor() {
      return this.allotType === this.allotTypeMap.normal.value;
    },
    /* 是否开启工单池 */
    taskPoolOn() {
      return this.taskConfig.taskPoolOn === true;
    }
  },
  watch: {
    'allotType'(newValue) {
      this.$emit('update:type', newValue);
    }
  },
  methods: {
    changeAllotData(data = {}) {
      const { allotType, synergies, executors } = data;
      
      if (allotType) this.allotType = allotType;
      if (synergies && Array.isArray(synergies)) this.value.synergies = synergies.filter(synergie => !!synergie.userId);
      if (executors && Array.isArray(executors)) this.value.executors = executors.filter(executor => !!executor.userId);
      
    },
    clearExecutors() {
      this.value.executors = [];
    },
    deleteSynergie(index) {
      this.value.synergies.splice(index, 1);
    },
    /** 根据客户id获取客户信息和客户负责人信息和开关 */
    fetchExeinsynWithCustomerManager(customerId = '') {
      if(!customerId) return console.warn('fetchExeinsynWithCustomerManager paramer not have customerId')
      
      getCustomerExeinsyn({ id: customerId}).then(result => {
        let exeInSynOfTaskOrEvent = result?.data?.exeInSynOfTaskOrEvent;
        // 允许自动将客户负责人带入工单或事件协同人
        if(exeInSynOfTaskOrEvent) {
          let synergies = this.value.synergies.slice();
          let isHaveSynergies = synergies.some(synergies => synergies.userId === result?.data?.userId)
          !isHaveSynergies && result.data.userId && this.value.synergies.push(result.data)
        }
      })
      
    },
    /** 选择协同人人员  */
    selectSynergiesUser() {
      let choose = 'dept';
      let options = {
        max: 14,
        isHideTeam: true,
        selected: this.value.synergies
      }
    
      this.$fast.contact.choose(choose, options)
        .then(res => {
          if(res.status != 0) return
          this.value.synergies = res?.data?.users || [];
          this.$emit('update:synergies', this.value.synergies);
        })
        .catch(err => {
          console.warn(err)
        })
    },
    /** 选择负责人人员  */
    selectExecutorUser() {
      let choose = this.isAllotByTag ? 'team' : 'dept';
      let options = {
        max: 1,
        isHideTeam: true,
        selected: (
          this.isAllotByTag 
            ? { users: this.value.executors } 
            : this.value.executors
        )
      }
      
      this.$fast.contact.choose(choose, options)
        .then(res => {
          if(res.status != 0) return
          this.value.executors = res?.data?.users || [];
          this.$emit('update:executors', this.value.executors);
        })
        .catch(err => {
          console.warn(err)
        })
    }
  }
}

export default TaskAllowSelect