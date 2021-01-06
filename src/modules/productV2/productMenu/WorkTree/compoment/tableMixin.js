import Page from '@model/Page';
export default {
  name: 'table-mixin',
  data() {
    return {
      page: {
        ...new Page(),
        ...{
          list: [{
            date: '2016-05-02',
            name: '王小虎',
            address: '上海市普陀区金沙江路 1518 弄',
          },
          {
            date: '2016-05-04',
            name: '王小虎',
            address: '上海市普陀区金沙江路 1517 弄',
          },
          {
            date: '2016-05-01',
            name: '王小虎',
            address: '上海市普陀区金沙江路 1519 弄',
          },
          {
            date: '2016-05-03',
            name: '王小虎',
            address: '上海市普陀区金沙江路 1516 弄',
          },
          ],
        },
      },
      param: this.initParams(),
    };
  },
  methods: {
    /**
     * @description 初始化参数
     * @param {Number} pageSize 页大小
     * @returns {Object} params
     */
    initParams(pageSize = 10) {
      return {
        keyword: '',
        pageNum: 1,
        pageSize,
        orderDetail: {},
        moreConditions: {
          conditions: [],
        },
      };
    },
    /**
     * @description 页大小改变操作
     * @param {Number} pageSize 页大小
     */
    handleSizeChange(pageSize) {
      this.params.pageSize = pageSize;
      this.params.pageNum = 1;

      this.search();
    },
    /**
     * @description 页码跳转
     * @param {Number} pageNum 页码
     */
    jump(pageNum) {
      this.params.pageNum = pageNum;
      this.taskPage.list = [];
      this.search();
    },
  }
}