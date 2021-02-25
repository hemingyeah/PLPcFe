// 
import {Model} from './abnormalModel'
import { formatDate } from '@src/util/lang';
/** api */
import * as TaskApi from '@src/api/TaskApi.ts';
/**
 * components
 */
import HeaderSelect from './components/headerSelect.vue'
import NoDataView from '@src/component/common/NoDataView';

/* echarts */
import echarts from 'echarts';


// table列表
const PIETABLELIST = [{
  displayName: '工单编号',
  fieldName: 'taskNo',
},
{
  displayName: '客户',
  fieldName: 'customerName',
},
{
  displayName: '工单类型',
  fieldName: 'templateName',
},
{
  displayName: '负责人',
  fieldName: 'excutorName',
},
{
  displayName: '创建人',
  fieldName: 'createName',
},
{
  displayName: '创建时间',
  fieldName: 'createTime',
},
{
  displayName: '异常节点',
  fieldName: 'action',
},
{
  displayName: '异常原因',
  fieldName: 'exceptionNameList',
},
{
  displayName: '异常次数',
  fieldName: 'total',
},
];

export default {
  name: 'abnormal',
  data() {
    return {
      pieTabList: [], // 饼行table列表
      columnarTabList: [], // 柱状图table列表
      tableNames: PIETABLELIST,
      checkTab: '', // 柱状图原因选中
      PieTime: '', // 图表时间
      pieAction: '', // 饼图节点
      exceptionName: '', // 柱状图原因
      PieChartList: [],
      ColumnarList: [],
      Pietotal: 0,
      curtotal: 0,
      curPageParams: {page: 1, pageSize: 10},
      PiePageParams: {page: 1, pageSize: 10},
      taskCustomExceptionNodeList: [{exceptionName: '全部', englishName: ''}],
      params: {tagIds: [], executorUserIds: [], createTimeStart: '', createTimeEnd: ''},
      columnarParams: {tagIds: [], executorUserIds: [], createTimeStart: '', createTimeEnd: '', action: ''}
    }
  },
  components: {
    [HeaderSelect.name]: HeaderSelect,
    [NoDataView.name]: NoDataView
  },

  mounted() {
    this.chart()
    this.histogram()
    this.getTurnOnTaskExceptionNodeInfo()
  },

  methods: {
    /** 获取用户开启的配置节点 以及工单搜索范围 和 异常原因字段值 */
    async getTurnOnTaskExceptionNodeInfo() {
      const {success, result} = await TaskApi.getTurnOnTaskExceptionNodeInfo()
      if(success) {
        let taskCustomExceptionNodeList = result.taskCustomExceptionNodeList.filter(item => {
          return item.switch && item
        }).forEach(item => {
          if (['拒绝', '暂停', '转派', '回退', '取消'].indexOf(item.exceptionName) !== -1) {
            this.taskCustomExceptionNodeList.push(item)
          }
        })
      }

    },
    // 饼图数据
    async chart() {
      const {params} = this
      const {succ, data} = await TaskApi.chart(params)
      if (succ) {
        this.pieTabList = []
        let taskExceptionVOList = data.taskExceptionVOList.map(item => {
          Model.forEach(v => {
            if (item.action === v.action) {
              item.actionName = v.actionNmae
            }
          })
          return item
        })
        this.PieChartList = taskExceptionVOList
        this.$nextTick(() => {
          this.PieChart(taskExceptionVOList)
        })
      }

    },
    // 柱状图数据
    async histogram() {
      const {columnarParams} = this
      const {succ, data} = await TaskApi.histogram(columnarParams)
      if (succ) {
        this.columnarTabList = []

        this.ColumnarList = data.taskExceptionVOList
        this.$nextTick(() => {
          this.Columnar(data.taskExceptionVOList)
        })
      }
    },
    // 负责人
    excutorName(v) {
      if(v.name) {
        this.columnarParams.executorUserIds = v.event
        this.histogram()
      } else {
        this.params.executorUserIds = v.event
        this.chart()
      }
    },
    // 团队
    update(v) {
      if(v.name) {
        this.columnarParams.tagIds = v.ids ? v.ids.split(',') : []
        this.histogram()
      } else {
        this.params.tagIds = v.ids ? v.ids.split(',') : []
        this.chart()
      }
    },
    // 时间
    ceratTime(v) {
      if (v.name) {
        if (v.event) {
          this.columnarParams.createTimeStart = v.event[0]
          this.columnarParams.createTimeEnd = v.event[1]
        } else {
          this.columnarParams.createTimeStart = ''
          this.columnarParams.createTimeEnd = ''     
        }
        this.histogram()
      } else {
        if (v.event) {
          this.params.createTimeStart = v.event[0]
          this.params.createTimeEnd = v.event[1]
        } else {
          this.params.createTimeStart = ''
          this.params.createTimeEnd = ''     
        }
        this.chart()
      }
    },
    /* 分页条数切换 */
    handleSizeChange(value) {
      this.PiePageParams.page = 1
      this.PiePageParams.pageSize = value;
      this.pieConsole()
    },
    /* 分页页数切换 */
    handlePageChange(value) {
      this.PiePageParams.page = value;
      this.pieConsole()
    },

    /* 分页条数切换 */
    CurhandleSizeChange(value) {
      this.curPageParams.page = 1
      this.curPageParams.pageSize = value;
      this.columnarConsole()
    },
    /* 分页页数切换 */
    CurhandlePageChange(value) {
      this.curPageParams.page = value;
      this.columnarConsole()
    },

    /* 饼图 */
    PieChart(taskExceptionVOList) {
      let names = taskExceptionVOList.map(item => {return item.actionName})
      let data = taskExceptionVOList.map(item => {return {value: item.actionNum, name: item.actionName, action: item.action}})

      const pieChart = echarts.init(this.$refs.piechart)
      let option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b} : {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: names
        },
        series: [{
          type: 'pie',
          radius: '70%',
          center: ['50%', '40%'],
          data,
          label: {
            normal: {
              formatter: '{b} : {c} ({d}%)'
            }
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      };
      pieChart.setOption(option)
      // 添加点击事件
      pieChart.on('click', this.pieConsole)
    },

    // 饼图table
    async pieConsole(event = '') {
      if (event) {
        const {action} = event.data
        this.pieAction = action
        this.PiePageParams = {page: 1, pageSize: 10}
      }

      const {succ, data} = await TaskApi.chartList({...this.params, ...this.PiePageParams, ...{action: this.pieAction}})
      if (succ) {
        this.Pietotal = data.total

        this.pieTabList = data.list.map(item => {
          item.timeName = formatDate(item.createTime, 'YYYY-MM-DD HH:mm:ss')
          return item
        })
      }
    },
    /* 柱状图 */
    Columnar(taskExceptionVOList) {
      const nams = !this.checkTab ? taskExceptionVOList.map(item => {
        this.taskCustomExceptionNodeList.forEach(v => {
          if(v.englishName === item.action) {
            item.exceptionName = `${item.exceptionName}-${v.exceptionName}`
          }
        })
        return item.exceptionName
      }) : taskExceptionVOList.map(item => { return item.exceptionName})
      const data = taskExceptionVOList.map(item => {return {value: item.exceptionNameNum, action: item.action, exceptionName: item.exceptionName}})
      const columnarChart = echarts.init(this.$refs.columnar)
      let option = {
        color: ['#269fd6'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
            label: {
              show: true
            }
          }
        },
        grid: {
          top: '1%',
          left: '3%',
          width: '96%'
        },
        xAxis: [{
          type: 'category',
          data: nams,
        }],
        yAxis: [{
          type: 'value',
        }],
        dataZoom: [{
          show: true,
          start: 0,
          end: 100
        }],
        series: [{
          type: 'bar',
          data,
          barWidth: 40
        }]
      };

      columnarChart.setOption(option)

      // 添加点击事件
      columnarChart.on('click', this.columnarConsole)
    },

    // 柱状图table
    async columnarConsole(event = '') {
      if (event) {
        const {action, exceptionName} = event.data
        this.columnarParams.action = action
        this.exceptionName = exceptionName.split('-')[0]
        this.curPageParams = {page: 1, pageSize: 10}
      }
      const {succ, data} = await TaskApi.histogramList({...this.columnarParams, ...this.curPageParams, ...{exceptionName: this.exceptionName}})
      if (succ) {
        this.curtotal = data.total

        this.columnarTabList = data.list.map(item => {
          item.timeName = formatDate(item.createTime, 'YYYY-MM-DD HH:mm:ss')
          return item
        })
      }
    },
    // 饼图判断多少条数据
    async chartTotal(type) {
      const {params} = this
      const {succ, data} = await TaskApi.chartTotal(params)
      if (succ) {
        if (data.total > 5000) {
          this.$platform.alert('为了保障响应速度，暂不支持超过5000条以上的数据导出，请您分段导出')
          return
        }
        this.actionExport(type)
      }
    },

    // 饼图判断多少条数据
    async histogramTotal(type) {
      const {columnarParams} = this
      const {succ, data} = await TaskApi.histogramTotal(columnarParams)
      if (succ) {
        if (data.total > 5000) {
          this.$platform.alert('为了保障响应速度，暂不支持超过5000条以上的数据导出，请您分段导出')
          return
        }
        this.reasonExport(type)
      }
    },
    // 饼图导出
    async actionExport(type) {
      let action = this.pieAction;
      if (type == 'all') {
        action = ''
      }
      const {executorUserIds, createTimeStart, tagIds, createTimeEnd} = this.params
      const params = {
        userIds: executorUserIds,
        tagIds,
        createTimeStart,
        createTimeEnd,
        action,
      }
      const {succ, message} = await TaskApi.actionExport(params)
      this.$platform.alert(message)
      if (succ) {
        window.parent.showExportList();
        window.parent.exportPopoverToggle(true);
      }
    },
    // 柱状图导出
    async reasonExport(type) {
      let exceptionName = ''
      const {executorUserIds, createTimeStart, tagIds, createTimeEnd, action} = this.columnarParams
      const params = {
        userIds: executorUserIds,
        tagIds,
        createTimeStart,
        createTimeEnd,
        action: type === 'all' ? '' : action,
        exceptionName
      }
      const {succ, message} = await TaskApi.reasonExport(params)
      this.$platform.alert(message)
      if (succ) {
        window.parent.showExportList();
        window.parent.exportPopoverToggle(true);
      }
    },
    /* tab切换 */
    TabSwitch(v) {
      this.checkTab = v
      this.columnarParams.action = v
      this.histogram()
    },

    /**
     * @description 打开工单详情tab
     * @param {String} taskId 工单id
     */
    openTaskTab(taskId, taskNo) {
      if (!taskId) return;

      let fromId = window.frameElement.getAttribute('id');

      this.$platform.openTab({
        id: `task_view_${taskId}`,
        title: `工单${taskNo}`,
        close: true,
        url: `/task/view/${taskId}?noHistory=1`,
        fromId,
      });
    },
    /** */
    abText(action) {
      let texts = []
      Model.forEach(v => {
        action.forEach(item => {
          if (item === v.action) {
            texts.push(v.actionNmae)
          }
        })
      })
      return texts.join('、')
    }
  }
};