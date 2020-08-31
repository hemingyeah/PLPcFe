/* components */
import TaskAllotSelect from '@src/modules/task/edit/components/TaskAllotSelect/TaskAllotSelect.vue';

const PlanTaskEditForm = {
  name: 'plan-task-edit-form',
  initject: ['initData'],
  data() {
    return {
      abortList: [
        {
          label: '按截止日期',
          value: '按截止日期'
        },
        {
          label: '按执行次数',
          value: '按执行次数'
        }
      ],
      form: {
        // 计划名称
        name: '',
        repetitionPeriod: {
          num: '',
          time: '天'
        },
        abort: {
          select: '按截止日期',
          num: '',
          time: ''
        },
      },
      formValidation: {
        name: true,
        repeat: true,
        endTime: true,
        createTime: true,
      },
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
    isAbortTime() {
      return this.form?.abort?.select == this.abortList?.[0]?.value;
    }
  },
  mounted() {
    // 
  },
  methods: {
    initForm() {
      return {
        // 计划名称
        name: '',
        repetitionPeriod: {
          num: '',
          time: '天'
        },
        abort: {
          select: '按截止日期',
          num: '',
          time: ''
        },
      }
    },
    /** 
     * @description 提交
    */
    onSubmit() {
      // 
    },
    reset() {
      this.form = this.initForm();
    },
    toggle(show = true) {
      this.show = show;
    }
  },
  components: {
    [TaskAllotSelect.name]: TaskAllotSelect
  }
}

export default PlanTaskEditForm;