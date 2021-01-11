
export default {
  name: 'tour-guide-mixin',
  data() {
    return {
      showTour: true,
      myCallbacks: {
        onPreviousStep: this.previousStep, // 在data中定义两个回调
        onNextStep: this.nextStep,
        onStop:this.stopStep
      },
      listOptions: {},
      listSteps: [{
        target: '#v-task-step-0',
        content: '可拖拽改变列宽',
      },
      {
        target: '#v-task-step-1',
        content: '可自定义组合查询条件'
      },
      {
        target: '#v-task-step-2',
        content: '可自定义列表显示项'
      },
      // {
      //   target: '#v-task-step-3',
      //   content: '可自定义高级搜索'
      // },
      ],
      detailOptions: {},
      detailSteps: [{
        target: '#v-task-detail-step-0',
        content: '清晰展示当前工单进度',
        title:'工单进度'
      },
      {
        target: '#v-task-detail-step-1',
        content: '工单重要信息展示'
      },
      {
        target: '#v-task-detail-step-2',
        content: '「工单动态」搬到这里了'
      },
      {
        target: '#v-task-detail-step-3',
        content: '编辑、复制及删除',
        title:'工单操作'
      },
      ],
      deptOptions: {},
      deptSteps: [{
        target: '#v-dept-step-0',
        content: '这里展示您的组织架构信息'
      },
      {
        target: '#v-dept-step-1',
        content: '点击此处编辑您的主部门信息'
      },
      {
        target: '#v-dept-step-2',
        content: '在这里展示部门成员信息，您可以对部门成员进行操作'
      },
      {
        target: '#v-dept-step-3',
        content: '点击此处创建您的子部门'
      },
      {
        target: '#v-dept-step-4',
        content: '在这里管理您的系统角色'
      }
      ],
    };
  },
  methods: {}
}