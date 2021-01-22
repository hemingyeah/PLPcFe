/*
 * @Author: your name
 * @Date: 2021-01-19 13:47:54
 * @LastEditTime: 2021-01-21 16:33:26
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /shb-fe-pc/src/modules/dataScreenCustom/component/setting/config.js
 */

/**
 * 设置面板的基础配置信息
 */
export const settingMap = {
  // 左侧顶部数据展示
  toDayCompleteTaskAndYesterdayCompare: { label: '今日完成工单+较昨日增长或下降', value: true, belong: 'leftTop'},
  thisMonthCompleteTaskAndLastMonthCompare: { label: '本月完成工单+较上月增长或下降', value: true, belong: 'leftTop'},
  notCompletedTaskCount: { label: '未完成工单总数', value: true, belong: 'leftTop' },
  notCompletedServerEvent: { label: '未完成服务事件数量', value: true, belong: 'leftTop' },
  notCompletedTaskCustomerCount: { label: '未完成工单客户数量', value: true, belong: 'leftTop' },
  serverInsertCustomerCount: { label: '服务台接入客户数量', value: true, belong: 'leftTop' },
  // 右侧顶部数据展示
  // completeTaskOverallRevenue: { label: '总营收金额（完成工单的营收）', value: true, belong: 'rightTop' },
  customerCount: { label: '总客户数量', value: true, belong: 'rightTop' },
  cycleServerCustomerCount: { label: '周期内服务的客户数量', value: true, belong: 'rightTop' },
  cycleTaskCount: { label: '周期内工单数量', value: true, belong: 'rightTop' },
  cycleCompleteEventCount: { label: '周期内完成事件总数', value: true, belong: 'rightTop' },
  // 右侧报表展示
  cycleCompleteTaskCountAverageTime: { label: '人员周期内完成工单数量及平均工单用时', value: false, belong: 'rightHistogram' },
  cycleCompleteTaskAndTagUserCount: { label: '周期内完成的工单+当前团队人数', value: true, belong: 'rightHistogram' },
  cycleServerContent: { label: '周期内服务内容排名及数量', value: false, belong: 'rightHistogram' },
  cycleServerTypeRankingCount: { label: '周期内服务类型排名及数量', value: false, belong: 'rightHistogram' },
  // 右侧饼状图展示
  workTypeCount: { label: '周期内完成工单的按照类型显示数量和比例', value: true, belong: 'rightPieChart' },
  productTypeCount: { label: '周期内完成工单的按照产品类型显示数量和比例', value: true, belong: 'rightPieChart' },
  cycleEvaluateTaskCustomerSatisfied: { label: '周期内已评价工单的客户满意度比例', value: false, belong: 'rightPieChart' },
}

/**
 * 时间范围配置
 */
export const timeRange = [
  { key: '30day', label: '近30天' },
  { key: '90day', label: '近90天' },
  { key: 'thisMonth', label: '本月' },
  { key: 'lastMonth', label: '上月' },
]