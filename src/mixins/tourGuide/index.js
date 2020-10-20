
export default {
  name: 'tour-guide-mixin',
  data() {
    return {
      showTour: true,
      currentStep: 0,
      myCallbacks: {
        onPreviousStep: this.previousStep, // 在data中定义两个回调
        onNextStep: this.nextStep,
        onStop:this.stopStep
      },
      options: {},
      steps: [{
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
      {
        target: '#v-task-step-3',
        content: '可自定义高级搜索'
      },
      ],
    };
  },
  methods: {}
}