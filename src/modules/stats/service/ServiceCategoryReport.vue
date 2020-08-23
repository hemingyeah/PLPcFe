<template>
  <div class="service-report-container" ref="chartContainer">
    <!-- <div id="service-report-chart" v-show="chartData.length" ref="chart"></div> -->
    <!-- <stats-chart-empty v-show="!chartData.length">暂无数据</stats-chart-empty> -->
    <div id="service-category-chart" v-show="chartData.length" ref="chart"></div>
    <stats-chart-empty v-show="!chartData.length && !loading">暂无数据</stats-chart-empty>

    <div class="table-container" v-show="specificData.length" ref="table">
      <div class="stats-task-table-header">
        <h3>类别列表</h3>
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
            <template v-if="column.field === 'total'">
              {{scope.row.number * scope.row.sale}}
            </template>
            <template v-else-if="column.field === 'sale'">
              {{scope.row.sale.toFixed(2)}}
            </template>
            <template v-else>
              {{scope.row[column.field]}}
            </template>
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

  let chart = null;

  export default {
    name: 'service-category-report',
    data() {

      return {
        chartData: [],
        specificData: [],
        specificDataTotalCount: 0,
        specificDataParams: {
          servicePriceType: null,
          pageSize: 10,
          pageNum: 1,
        },
        columns: this.buildTableColumn(),
        requestOption:{
          params: this.requestParams,
          url: '/stats/servicePrice/getNumberByServicePriceType',
          exportDataUrl: '/stats/servicePrice/exportListByServicePriceType?',
          specificDataUrl: '/stats/servicePrice/getListByServicePriceType',
        },
        paramsBackup: null,
        loading: false,
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
          ...this.requestOption.params,
          ...this.requestParams
        };
        if (!params.tagId) {
          delete params.tagId;
        }
        return params;
      }
    },
    methods: {
      jump(currentPage){
        this.specificDataParams.pageNum = currentPage;
        this.loadSpecificData();
      },
      exportData(type) {
        const params = {
          servicePriceType: this.specificDataParams.servicePriceType,
          exportType: type,
          ...this.requestParams,
        };

        if(!params.tagId) {
          delete params.tagId;
        } 
        window.location.href = this.requestOption.exportDataUrl + qs.stringify(params);
      },
      loadChartData() {
        let instance = this.$loading.show(this.$refs.chartContainer);
        this.loading = true;

         return this.$http.get(this.requestOption.url, this.chartParams)
          .then(result => {
            const tempArr = [];
            // The result of request is a Object.
            for(let key in result) {
              tempArr.push({
                name: key,
                value: result[key],
              })
            }
            
            this.chartData = tempArr;

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
        const dom = document.getElementById("service-category-chart");
        if (!dom) return;
        chart = echarts.init(dom);
        window.addEventListener('resize', _.debounce(function(){
          chart.resize();
        }));
        if (!chart._$handlers.click || !chart._$handlers.click.length) {
          chart.on('click', event => {
            let origin = event.data._origin;
            this.specificDataParams.servicePriceType = origin.name;
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
        return {
          color: ["#2ec7c9","#ffb980","#5ab1ef","#d87a80","#5f5f6e","#07a2a4","#9a7fd1","#588dd5","#c05050","#f5994e","#59678c","#7eb00a","#749f83"],
          tooltip : {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
          },
          toolbox: {
            right: 115,
            top: 10,
            feature: {
              saveAsImage: {
                name: "服务项目-类别统计",
              },
            },
          },
          legend: {
            orient: 'vertical',
            left: 'left',
            data: this.chartData.map(row => row.name) || [],
          },
          series : [
            {
              name: '服务类别',
              type: 'pie',
              radius : '55%',
              center: ['50%', '50%'],
              data: this.chartData.map(row => ({
                ...row,
                _origin: row,
              })) || [],
              itemStyle: {
                emphasis: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              },
              label: {
                normal: {
                  formatter: "{b}： {c} ({d}%)"
                }
              }
            }
          ]
        };
      },
      buildTableColumn() {
        return [{
          label: '服务项目名称',
          field: 'servicePriceName',
          show: true,
        }, {
          label: '服务项目编号',
          field: 'serialNumber',
          show: true,
        }, {
          label: '服务类型',
          field: 'servicePriceType',
          show: true,
        }, {
          label: '使用数量',
          field: 'number',
          show: true,
        }, {
          label: '合计金额（单位：元）',
          field: 'sale',
          show: true,
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
  }

</script>

<style lang="scss" scoped>
  .service-report-container {
    min-height: 565px;
    position: relative;

    #service-category-chart {
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
