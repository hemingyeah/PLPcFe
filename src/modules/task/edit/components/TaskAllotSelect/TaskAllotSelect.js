const TaskAllowSelect = {
  name: 'task-allot-select',
  data() {
    return {
      allotType: 'pool',
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
        }
      },
      value: {
        beforeDayNum: '',
        executors: [],
        synergies: []
      }
    }
  },
  computed: {
    /* 是否按团队派单 */
    isAllotByTag() {
      return this.initData?.isAllotByTag === true;
    },
    /* 是否显示选择负责人 */
    isShowSelectExecutor() {
      return this.allotType === this.allotTypeMap.normal.value;
    }
  },
  mounted() {
    // 
  },
  methods: {
    /** 选择协同人人员  */
    selectSynergiesUser() {
      let choose = 'dept';
      let options = {
        max: -1,
        isHideTeam: true,
        selected: this.value.synergies
      }
    
      this.$fast.contact.choose(choose, options)
        .then(res => {
          if(res.status != 0) return
          this.value.synergies = res?.data?.users || [];
        })
        .catch(err => {
          console.warn(err)
        })
    },
    /** 选择负责人人员  */
    selectExecutorUser() {
      let choose = this.isAllotByTag ? 'team' : 'dept';
      let options = {
        max: -1,
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
        })
        .catch(err => {
          console.warn(err)
        })
    }
  }
}

export default TaskAllowSelect