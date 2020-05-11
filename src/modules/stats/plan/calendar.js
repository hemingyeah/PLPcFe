import echarts from "echarts/lib/echarts";

import "echarts/lib/component/legend";
import "echarts/lib/component/calendar";

import "echarts/lib/chart/scatter";
import "echarts/lib/chart/pie";

import DateUtil from 'src/util/DateUtil';

let cellSize = [64, 64];
let pieRadius = 20;
let nameMap = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

class Calendar{

  constructor(){
    this.el = null;
    this.ctx = null;
    this.chart = null;
  }

  init(el, ctx){
    this.el = el;
    this.ctx = ctx;

    this.chart = echarts.init(el);
  }

  render(startDate, endDate, data = {}){
    this.chart.clear();

    let start = DateUtil.format(startDate, "yyyy-MM-dd");
    let end = DateUtil.format(endDate, "yyyy-MM-dd");

    let range = [start, end];
    let days = this.getDaysOfMonth(startDate, endDate);

    //绘制日历
    let scatter = this.getScatter(days);
    let option = this.getOption(range, scatter);
    this.chart.setOption(option);

    //绘制饼图
    let pies = this.getPies(days, data);
    this.chart.setOption({
      series: pies
    })
  }

  getScatter(days){
    let data = [];
    let today = DateUtil.format(new Date(), "yyyy-MM-dd")

    days.forEach(day => {
      if(today == day[0]){
        data.push({
          value: day,
          label: {
            normal:{
              color: '#f00',
              fontWeight: 700
            }
          }
        })
      }else{
        data.push(day)
      }
    });

    return {
      id: "label",
      type: "scatter",
      coordinateSystem: "calendar",
      symbolSize: 1,
      itemStyle: {
        normal: {
          color: 'none'
        }
      },
      label: {
        normal: {
          show: true,
          formatter: function(params) {
            return echarts.format.formatTime("dd", params.value[0]);
          },
          offset: [-cellSize[0] / 2 + 10, -cellSize[1] / 2 + 10],
          textStyle: {
            color: "#000",
            fontSize: 14
          }
        }
      },
      data: data
    }
  }

  getPies(days, data){
    let chart = this.chart;
    let finishedMap = {};
    let unFinishedMap = {};
    let finished = data.finished || [];
    let unFinished = data.unFinished || [];

    finished.forEach(item => finishedMap[item.dateTime] = item)
    unFinished.forEach(item => unFinishedMap[item.dateTime] = item)

    return echarts.util.map(days, function(item, index) {
      let day = item[0];
      let finishedData = finishedMap[day] || {};
      let unFinishedData = unFinishedMap[day] || {};

      let data = [];

      if(unFinishedData.unfinished){
        data.push({
          name: '未完成',
          value: unFinishedData.unfinished || 0,
          _origin: unFinishedData
        })
      }

      if(finishedData.finished){
        data.push({
          name: '已完成',
          value: finishedData.finished || 0,
          _origin: finishedData
        })
      }
      
      return {
        id: index + "pie",
        type: "pie",
        center: chart.convertToPixel("calendar", item),
        label: {
          normal: {
            formatter: "{c}",
            position: "inside"
          }
        },
        //silent: true,
        radius: pieRadius,
        data: data
      };
    });
  }

  getDaysOfMonth(startDate, endDate){
    let start = startDate.getTime();
    let end = endDate.getTime();
    var dayTime = 3600 * 24 * 1000;
    var data = [];

    for (let time = start; time <= end; time += dayTime) {
      data.push([
        echarts.format.formatTime("yyyy-MM-dd", time),
        0
      ]);
    }
    return data;
  }

  getOption(range, scatter, pies){
    let series = [];

    if(scatter) series.push(scatter);

    return {
      legend: {
        data: ["未完成", "已完成"],
        bottom: 10
      },
      color: ['#03b3e2', '#18eac0'],
      calendar: {
        top: "middle",
        left: "center",
        orient: "vertical",
        cellSize: cellSize,
        yearLabel: {
          show: false
        },
        monthLabel: {
          show: false
        },
        dayLabel: {
          textStyle: {
            fontSize: 14
          },
          margin: 10,
          firstDay: 1,
          nameMap: nameMap
        },
        range: range
      },
      series: series
    }
  }

}

export default new Calendar();