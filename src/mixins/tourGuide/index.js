
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
        content: '编辑、删除、复制、DING及打印工单',
        title:'工单操作'
      },
      ],
    };
  },
  methods: {}
}