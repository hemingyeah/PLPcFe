<template>
  <div class="service-report-container" ref="chartContainer">
    <div v-show="chartData.length" class="chart-container">
      <div id="service-cost-chart" ></div>
      <div class="stats-table-expand no-border" :class="{'stats-table-isExpand': 0}">
        <button type="button" @click="loadMoreChartData" :disabled="chartData.length === chartDataTotalCount">
          <!-- <i class="iconfont icon-zhankaisanjiao"></i>  -->
          {{btnText}}
        </button>
      </div> 
    </div>
    <stats-chart-empty v-show="!chartData.length && !loading">暂无数据</stats-chart-empty>

    <div class="table-container" v-show="specificData.length" ref="table">
      <div class="stats-task-table-header">
        <h3>费用列表</h3>
        <div class="btn-group">
          <button type="button" class="btn btn-primary btn-sm" @click="exportData('export')">导出</button>
          <button type="button" class="btn btn-primary btn-sm" @click="exportData('exportAll')">导出全部</button>
          <button type="button" class="btn btn-primary btn-sm" @click="specificData = []">收起</button>
        </div>
      </div>

      <el-table stripe :data="specificData" class="stats-table">
        <el-table-column
          v-for="column in columns"
          :key="column.field"
          :label="column.label"
          :width="column.width"
          :prop="column.field"
          show-overflow-tooltip>

           <template slot-scope="scope">
             <template v-if="column.field === 'taskNo'">
              <sample-tooltip :row="scope.row">
                  <template slot="content" slot-scope="{isContentTooltip}">
                    <el-tooltip :content="scope.row.taskNo" placement="top" :disabled="!isContentTooltip">
                      <a :href="`/task/view/${scope.row.taskId}`" :data-id="scope.row.taskId" @click="openDetail">{{scope.row.taskNo}}</a>
                    </el-tooltip>
                  </template>
                </sample-tooltip>
            </template>
             <template v-else-if="column.field === 'createTime'">{{scope.row.createTime | fmt}}</template>
             <template v-else-if="column.field === 'sale'">
              {{scope.row.sale.toFixed(2)}}
            </template>
             <template v-else>{{scope.row[column.field]}}</template>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="stats-pagination"
        background @current-change="jump"
        :page-size="specificDataParams.pageSize"
        :current-page="specificDataParams.pageNum"
        layout="total, prev, pager, next"
        :total="specificDataTotalCount">
      </el-pagination>
    </div>
  </div>
</template>
<script>
  import _ from "lodash";
  import qs from 'src/util/QueryString';
  import echarts from 'packages/Echarts';
  import SampleTooltip from 'packages/SampleTooltip';

  let chart = null;

  export default {
    name: 'service-cost-report',
    data() {

      return {
        chartData: [],
        specificData: [],
        chartDataTotalCount: 0,
        specificDataTotalCount: 0,
        loading: false,
        specificDataParams: {
          servicePriceName: null,
          pageSize: 10,
          pageNum: 1,
        },
        columns: this.buildTableColumn(),
        requestOption:{
          params: {
            pageSize: 10,
            pageNum: 1,
          },
          url: '/stats/servicePrice/getSaleByName',
          exportDataUrl: '/stats/servicePrice/exportListByServicePriceName?',
          specificDataUrl: '/stats/servicePrice/getListByServicePriceName',
        },
        paramsBackup: null,
        btnText: '加载更多数据',
      }
    },
    props: {
      requestParams: {
        type: Object,
      },
    },
    computed: {
      chartParams() {
        const params = {
          ...this.requestParams
        };
        if (!params.tagId) {
          delete params.tagId;
        }
        return params;
      }
    },
    methods: {
      openDetail(event){
        event.preventDefault();
        if (!window.frameElement) return;

        let el = event.target;
        var fromId = window.frameElement.getAttribute('id');

        parent.window.addTabs({
          id: "taskView_" + el.dataset.id,
          title: "正在加载",
          close: true,
          url: el.getAttribute('href'),
          fromId:fromId
        });
        parent.window.resizeFrame();
      },
      loadMoreChartData() {
        this.requestOption.params.pageNum++;
        this.loadChartData();
      },
      jump(currentPage){
        this.specificDataParams.pageNum = currentPage;
        this.loadSpecificData();
      },
      exportData(type) {
        const params = {
          servicePriceName: this.specificDataParams.servicePriceName,
          exportType: type,
          ...this.requestParams,
        };
       
        if(!params.tagId) {
          delete params.tagId;
        }

        params.source = 1;

        window.location.href = this.requestOption.exportDataUrl + qs.stringify(params);
      },
      // The meaning of the parameter of p:
      // The parent component changes search condition(eg: tagId, timeStart, timeEnd) and set pageNum to 1.
      loadChartData(p = {}) {
        let instance = this.$loading.show(this.$refs.chartContainer);
        this.loading = true;

        const params = {
          ...this.chartParams,
          ...this.requestOption.params,
        };
        if (p && p.pageNum) {
          params.pageNum = p.pageNum;
          this.requestOption.params.pageNum = p.pageNum;
        }

        return this.$http.get(this.requestOption.url, params)
          .then(result => {
            if (result && result.pageNum > 1) {
              this.chartData = [...this.chartData, ...result.list];
            } else {
              this.chartData = result.list;
            }
            this.chartDataTotalCount = result.total;
            if(this.chartData.length === this.chartDataTotalCount) {
              this.btnText = '已加载全部数据';
            } else {
              this.btnText = '加载更多数据'; 
            }

            if (chart) {
              this.renderChart();
              this.specificData = [];
            } else {
              this.$nextTick(this.initChart);
            }
            instance.hide();
            this.loading = false;
            return result;
          })
      },
      async loadSpecificData() {
        let instance = this.$loading.show(this.$refs.chartContainer);
       const params = {
          ...this.requestOption.params,
          ...this.specificDataParams,
          ...this.requestParams,
        };

        if(!params.tagId) {
          delete params.tagId;
        }

        const result = await this.$http.get(this.requestOption.specificDataUrl, params);
        this.specificData = result.list;
        this.specificDataParams.pageNum = result.pageNum;
        this.specificDataTotalCount = result.total;
        instance.hide();
      },
      initChart(){
        if(!this.chartData.length) return;
        const dom = document.getElementById("service-cost-chart");
        if (!dom) return;
        chart = echarts.init(dom);

        window.addEventListener('resize', _.debounce(function(){
          chart.resize();
        }));

        if (!chart._$handlers.click || !chart._$handlers.click.length) {
          chart.on('click', event => {
            let origin = event.data._origin;
            this.specificDataParams.servicePriceName = origin.servicePriceName;
            this.specificDataParams.pageNum = 1;
            this.loadSpecificData();
          });
        }

        this.renderChart();
      },

      renderChart(){
        let option = this.buildChartOption();
        chart.setOption(option);
      },
      // build chart option.
      buildChartOption(){
        const axisData = [];
        const seriesData = [];

        if (!Array.isArray(this.chartData)) {
          this.chartData = [];
        }

        this.chartData.forEach(d => {
          axisData.push({
            value: d.servicePriceName,
            _origin: d,
          });
          seriesData.push({
            value: d.sale,
            _origin: d,
          });
        });

        axisData.reverse();
        seriesData.reverse();

        let start = 0;
        let end = axisData.length - 1;
        if(axisData.length > 10) start = end - 9;

        return {
          xAxis: {
            type: 'value',
          },
          yAxis: {
            type: 'category',
            data: axisData,
            axisLabel: {
             formatter(originText) {
                if (!originText) return '';
                if(originText.length <= 10) {
                  return originText
                }
                return `${originText.slice(0, 8)}...`;
              }
            },
          },
          tooltip: {
            trigger: 'axis',
            formatter: "{b}<br /> {c} 元",
            axisPointer: {
              type: 'shadow'
            }
          },
          toolbox: {
            right: 115,
            top: 10,
            feature: {
              saveAsImage: {
                name: "服务项目-费用统计",
              },
            },
          },
          dataZoom: [
            {
              type: 'slider',
              show: true,
              yAxisIndex: [0],
              right: '20px',
              startValue: start,
              endValue: end,
              minValueSpan: 10,
              maxValueSpan: 30
            }
          ],
          series: [{
            name: '服务费用',
            color: ["#6da9e8"],
            barMaxWidth: "30px",
            type: 'bar',
            data: seriesData
          }],
          label: {
            normal: {
              show: true,
              position: 'right',
            }
          }
        };
      },
      buildTableColumn() {
        return [{
          label: '工单编号',
          field: 'taskNo',
          show: true,
        }, {
          label: '工单类型',
          field: 'templateName',
          show: true,
          width: '120px'
        },{
          label: '客户名称',
          field: 'customerName',
          show: true,
        }, {
          label: '服务项目名称',
          field: 'servicePriceName',
          show: true,
        }, {
          label: '服务项目编号',
          field: 'serialNumber',
          show: true,
        }, {
          label: '负责人',
          field: 'executorName',
          show: true,
        }, {
          label: '使用数量',
          field: 'number',
          show: true,
          width: '100px',
        },{
          label: '使用时间',
          field: 'createTime',
          show: true,
          width: '180px',
        }, {
          label: '合计金额（单位：元）',
          field: 'sale',
          show: true,
          width: '160px',
        }]
      }
    },
    mounted(){
      this.$nextTick(() => {
        this.loadChartData()
          .then(this.initChart);
      })
    },

    activated() {
      if(this.paramsBackup &&
        (this.requestParams.tagId !== this.paramsBackup.tagId ||
        this.requestParams.timeStart !== this.paramsBackup.timeStart ||
        this.requestParams.timeEnd !== this.paramsBackup.timeEnd)
      ) {
        this.loadChartData(); 
      }

      if(!chart) {
        this.initChart();
      }
    },
    deactivated() {
      const { tagId, timeStart, timeEnd, } = this.requestParams;
      this.paramsBackup = {
        tagId,
        timeStart,
        timeEnd,
      } 
    },
    components: {
      [SampleTooltip.name]: SampleTooltip,
    }
  }

</script>

<style lang="scss" scoped>
  .service-report-container {
    min-height: 565px;
    position: relative;

    .chart-container {
      padding-bottom: 15px;
    }

    .load-more-chart-data-btn {
      display: block;
      margin: 0 auto;
    }

    #service-cost-chart {
      min-height: 520px;
    }

    .table-container {

      .table-header {
        display: flex;
        justify-content: space-between;
        h3 {
          margin: 0;
          height: 40px;
          line-height: 40px;
          font-size: 16px;
        }

        .btn-group {
          width: 192px;
          display: flex;
          justify-content: space-around;
          align-items: center;
        }
      }
    }
  }
</style>