/**
 * components
 */
import HeaderSelect from './components/headerSelect.vue'

/*echarts */
import echarts from 'echarts';


//table列表
const PIETABLELIST = [{
    displayName: "工单编号",
    fieldName: "serialNumber",
  },
  {
    displayName: "客户",
    fieldName: "name",
  },
  {
    displayName: "工单类型",
    fieldName: "type",
  },
  {
    displayName: "负责人",
    fieldName: "unit",
  },
  {
    displayName: "创建人",
    fieldName: "salePrice",
  },
  {
    displayName: "创建时间",
    fieldName: "costPrice",
  },
  {
    displayName: "异常节点",
    fieldName: "isShow",
  },
  {
    displayName: "异常原因",
    fieldName: "isShow",
  },
  {
    displayName: "异常次数",
    fieldName: "isShow",
  },
];

export default {
  name: "abnormal",
  data() {
    return {
      pieTabList: [], //饼行table列表
      columnarTabList: [], //柱状图table列表
      tableNames: PIETABLELIST,
    }
  },
  components: {
    [HeaderSelect.name]: HeaderSelect
  },

  mounted() {
    this.PieChart()
    this.Columnar()
  },

  methods: {
    /*饼图 */
    PieChart() {
      const pieChart = echarts.init(this.$refs.piechart)
      let option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']
        },
        series: [{
          name: '访问来源',
          type: 'pie',
          radius: '70%',
          center: ['50%', '40%'],
          data: [{
              value: 335,
              name: '直接访问',
            },
            {
              value: 310,
              name: '邮件营销'
            },
            {
              value: 234,
              name: '联盟广告'
            },
            {
              value: 135,
              name: '视频广告'
            },
            {
              value: 1548,
              name: '搜索引擎'
            }
          ],
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
      pieChart.on("click", this.pieConsole)
    },
    pieConsole(event) {
      console.log(event)
    },
    /*柱状图 */
    Columnar() {
      const columnarChart = echarts.init(this.$refs.columnar)
      let option = {
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
          left: '3%',
          width: '96%'
        },
        xAxis: [{
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
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
          data: [120, 200, 150, 80, 70, 110, 130],
          barWidth: 40
        }]
      };

      columnarChart.setOption(option)
    }
  }
};