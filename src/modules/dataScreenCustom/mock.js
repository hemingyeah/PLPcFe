
// 模拟数据文件，测试完成后可删除

// 仅做模拟接口返回config数据使用
const config = {
  // 左侧顶部数据展示
  toDayCompleteTaskAndYesterdayCompare: true,
  thisMonthCompleteTaskAndLastMonthCompare: true,
  notCompletedTaskCount: true,
  notCompletedServerEvent: true,
  notCompletedTaskCustomerCount: true,
  serverInsertCustomerCount: false,
  // 右侧顶部数据展示
  completeTaskOverallRevenue: true,
  customerCount: true,
  cycleServerCustomerCount: true,
  cycleTaskCount: true,
  cycleCompleteEventCount: true,
  // 右侧报表展示
  cycleCompleteTaskCountAverageTime: true,
  cycleCompleteTaskAndTagUserCount: false,
  cycleServerContent: false,
  cycleServerTypeRankingCount: true,
  // 右侧饼状图展示
  cycleCompleteTaskTypeCount: true,
  cycleCompleteTaskProductCount: false,
  cycleEvaluateTaskCustomerSatisfied: true,
  
  // 时间范围配置
  cycleRange: '30day',

  // 左侧地图配置
  notCompleteTask: true, // 未完成工单
  staffInformation: true, // 展示数据人员信息
  customerInformation: false, // 展示数据客户信息
  serverTag: false, // 展示数据服务团队
  sparePartsLibrary: false, // 展示数据备件库
  taskState: 'all', // 工单状态 异常"unusual",已出发"goto",进行中"carryon",全部"all"
  staffState: 'all', // 人员信息
  hashMap: {}
}


export function getConfig() {
  return config;
  // return new Promise((resolve) => {
  //   resolve({
  //     succ: true,
  //     data: config
  //   })
  // })
}

export function getTopLeftData() {
  return new Promise((resolve) => {
    resolve({
      succ: true,
      data: {
        toDayCompleteTaskAndYesterdayCompare: {
          count: '112340',
          change: 45
        },
        thisMonthCompleteTaskAndLastMonthCompare: {
          count: '1234340',
          change: -45
        },
        notCompletedTaskCount: {
          count: '28392'
        },
        notCompletedServerEvent: {
          count: '1299'
        },
        notCompletedTaskCustomerCount: {
          count: '92321'
        },
        serverInsertCustomerCount: {
          count: '234909'
        },
      }
    })
  })
}

export function getRightTopData() {

  return new Promise((resolve) => {
    resolve({
      succ: true,
      data: {
        completeTaskOverallRevenue: {
          count: '425531',
        },
        customerCount: {
          count: '12325531',
        },
        cycleServerCustomerCount: {
          count: '45531'
        },
        cycleTaskCount: {
          count: '25531'
        },
        cycleCompleteEventCount: {
          count: '773481'
        },
      }
    })
  })
}


/**
 * 这里目前是作为返回全部数据来搞
 */
export function getAllData(dev) {
  return {
    rightFormData: {
      cycleCompleteTaskCountAverageTime: [
        {
          'finishedTask': dev || 12, // 数量
          'averageTime': 213.874094650206, // 平均用时
          'displayName': '孙冲', // 人员名称
          'userId': 'd33846ee-6fa9-11e9-bfc9-00163e304a25' // id
        },
        {
          'finishedTask': 9,
          'averageTime': 47.296001683502,
          'displayName': '黄宝成',
          'userId': 'b9510211-d82f-11e8-b3c6-00163e304a25'
        },
        {
          'finishedTask': 8,
          'averageTime': 25.871027777778,
          'displayName': '王欣宇',
          'userId': '873e415a-c867-11e9-bfc9-00163e304a25'
        },
        {
          'finishedTask': 7,
          'averageTime': 231.976111111111,
          'displayName': '孙文杰',
          'userId': 'd4384a18-8833-11e9-bfc9-00163e304a25'
        },
        {
          'finishedTask': 4,
          'averageTime': 455.886306818182,
          'displayName': '殷海峰',
          'userId': '1676d835-7f76-11e8-8546-00163e304a25'
        },
        {
          'finishedTask': 3,
          'averageTime': 0.025077160494,
          'displayName': '赵玉迪',
          'userId': 'dbbe863a-5422-11e9-bfc9-00163e304a25'
        },
        {
          'finishedTask': 3,
          'averageTime': 0.061944444444,
          'displayName': '姜玲',
          'userId': '48e28fc3-f11a-11e8-b3c6-00163e304a25'
        },
        {
          'finishedTask': 2,
          'averageTime': 162.124784722222,
          'displayName': '曹浩',
          'userId': '447d4235-e5f3-11e7-9070-00163e304a25'
        }
      ],
      cycleCompleteTaskAndTagUserCount: [
        {
          'tagId': '2aca023e-965a-11e9-bfc9-00163e304a25', // 团队id
          'tagName': '新建团队测试', // 团队名称
          'completeCount': 22, // 完成数量
          'tagUserCount': 152 // 团队人数
        },
        {
          'tagId': '3cd2dcdd-96ea-11e9-bfc9-00163e304a25',
          'tagName': '新建团队测试 子团队6',
          'completeCount': 13,
          'tagUserCount': 147
        },
        {
          'tagId': '23e40a3d-96ea-11e9-bfc9-00163e304a25',
          'tagName': '新建团队测试 子团队4',
          'completeCount': 13,
          'tagUserCount': 151
        },
        {
          'tagId': 'aaf59e9b-b298-11e9-bfc9-00163e304a25',
          'tagName': '测试五福',
          'completeCount': 12,
          'tagUserCount': 2
        },
        {
          'tagId': '17c33968-9663-11e9-bfc9-00163e304a25',
          'tagName': '测试新建团队test2',
          'completeCount': 10,
          'tagUserCount': 2
        },
        {
          'tagId': '14cd4f2d-96ea-11e9-bfc9-00163e304a25',
          'tagName': '新建团队测试 子团队3',
          'completeCount': 5,
          'tagUserCount': 2
        }
      ],
      cycleServerContent: [
        {
          'serviceContent': '安装', // 服务内容
          'count': 47 // 数量
        },
        {
          'serviceContent': '维修',
          'count': 9
        },
        {
          'serviceContent': '巡检',
          'count': 5
        },
        {
          'serviceContent': '未命名(mock)',
          'count': 0
        }
      ],
      cycleServerTypeRankingCount: [
        {
          'serviceType': '未命名(mock)',
          'count': 37
        },
        {
          'serviceType': '保内免费', // 类型名称
          'count': 52 // 数量
        },
        {
          'serviceType': '服务类型1',
          'count': 3
        }
      ]
    },
    // 右侧饼图数据
    'rightPieChart': { // 右侧饼状图数据
      'typeCountContrast': { // 要对比的数据
        'cycleCompleteTaskTypeCount': { // 周期内完成工单那类型
          '第十一个': 12,
          '何家乐的工单': 0,
          '测试审批': 4,
          '移动之附加组': 5,
          '示例数据默认工单': 8,
          '更换发动机': 1,
          '回执表单测试': 2,
          '测试服务报告': 1,
          '电子签名勿动': 3,
          '默认工单': 77,
          '短信测试QA': 4,
          '电子签名字段': 10,
          '千一的工单': 1
        },
        'cycleEvaluateTaskCustomerSatisfied': { // 周期内完成的客户满意度
          'satifaction': 4, // 满意
          'general': 0, // 一般
          'unSatifaction': 1 // 不满意
        },
        'cycleCompleteTaskProductCount': { // 周期内完成的产品类型
          '无': 146,
          '产品类型3': 12,
          '哈哈哈哈哈测试': 1,
          '测试1': 13
        }
      },
      'taskProuctTypeAndDegteeCount': { //  饼状图展示数据
        'cycleCompleteTaskTypeCount': { //  周期内完成工单的类型
          '第十一个': dev,
          '何家乐的工单': 10,
          '测试审批': 14,
          '移动之附加组': 4,
          '示例数据默认工单': 4,
          '更换发动机': 3,
          '回执表单测试': 6,
          '测试服务报告': 26,
          '电子签名勿动': 1,                
          '默认工单': 77,
          '短信测试QA': 1,
          '电子签名字段': 10,
          '千一的工单': 3
        },
        'cycleEvaluateTaskCustomerSatisfied': { // 周期内完成的客户满意度
          'satifaction': 4,
          'general': 0,
          'unSatifaction': 1
        },
        'cycleCompleteTaskProductCount': { // 周期内完成的产品类型
          '无': 146,
          '产品类型3': 12,
          '哈哈哈哈哈测试': 1,
          '测试1': 13
        }
      }
    }
  }

  // return new Promise(resolve => {
  //   resolve({
  //     succ: true,
  //     data: {
  //       rightFormData: {
  //         cycleCompleteTaskCountAverageTime: [
  //           {
  //             'finishedTask': dev || 12, // 数量
  //             'averageTime': 213.874094650206, // 平均用时
  //             'displayName': '孙冲', // 人员名称
  //             'userId': 'd33846ee-6fa9-11e9-bfc9-00163e304a25' // id
  //           },
  //           {
  //             'finishedTask': 9,
  //             'averageTime': 47.296001683502,
  //             'displayName': '黄宝成',
  //             'userId': 'b9510211-d82f-11e8-b3c6-00163e304a25'
  //           },
  //           {
  //             'finishedTask': 8,
  //             'averageTime': 25.871027777778,
  //             'displayName': '王欣宇',
  //             'userId': '873e415a-c867-11e9-bfc9-00163e304a25'
  //           },
  //           {
  //             'finishedTask': 7,
  //             'averageTime': 231.976111111111,
  //             'displayName': '孙文杰',
  //             'userId': 'd4384a18-8833-11e9-bfc9-00163e304a25'
  //           },
  //           {
  //             'finishedTask': 4,
  //             'averageTime': 455.886306818182,
  //             'displayName': '殷海峰',
  //             'userId': '1676d835-7f76-11e8-8546-00163e304a25'
  //           },
  //           {
  //             'finishedTask': 3,
  //             'averageTime': 0.025077160494,
  //             'displayName': '赵玉迪',
  //             'userId': 'dbbe863a-5422-11e9-bfc9-00163e304a25'
  //           },
  //           {
  //             'finishedTask': 3,
  //             'averageTime': 0.061944444444,
  //             'displayName': '姜玲',
  //             'userId': '48e28fc3-f11a-11e8-b3c6-00163e304a25'
  //           },
  //           {
  //             'finishedTask': 2,
  //             'averageTime': 162.124784722222,
  //             'displayName': '曹浩',
  //             'userId': '447d4235-e5f3-11e7-9070-00163e304a25'
  //           }
  //         ],
  //         cycleCompleteTaskAndTagUserCount: [
  //           {
  //             'tagId': '2aca023e-965a-11e9-bfc9-00163e304a25', // 团队id
  //             'tagName': '新建团队测试', // 团队名称
  //             'completeCount': 22, // 完成数量
  //             'tagUserCount': 152 // 团队人数
  //           },
  //           {
  //             'tagId': '3cd2dcdd-96ea-11e9-bfc9-00163e304a25',
  //             'tagName': '新建团队测试 子团队6',
  //             'completeCount': 13,
  //             'tagUserCount': 147
  //           },
  //           {
  //             'tagId': '23e40a3d-96ea-11e9-bfc9-00163e304a25',
  //             'tagName': '新建团队测试 子团队4',
  //             'completeCount': 13,
  //             'tagUserCount': 151
  //           },
  //           {
  //             'tagId': 'aaf59e9b-b298-11e9-bfc9-00163e304a25',
  //             'tagName': '测试五福',
  //             'completeCount': 12,
  //             'tagUserCount': 2
  //           },
  //           {
  //             'tagId': '17c33968-9663-11e9-bfc9-00163e304a25',
  //             'tagName': '测试新建团队test2',
  //             'completeCount': 10,
  //             'tagUserCount': 2
  //           },
  //           {
  //             'tagId': '14cd4f2d-96ea-11e9-bfc9-00163e304a25',
  //             'tagName': '新建团队测试 子团队3',
  //             'completeCount': 5,
  //             'tagUserCount': 2
  //           }
  //         ],
  //         cycleServerContent: [
  //           {
  //             'serviceContent': '安装', // 服务内容
  //             'count': 47 // 数量
  //           },
  //           {
  //             'serviceContent': '维修',
  //             'count': 9
  //           },
  //           {
  //             'serviceContent': '巡检',
  //             'count': 5
  //           },
  //           {
  //             'serviceContent': '未命名(mock)',
  //             'count': 0
  //           }
  //         ],
  //         cycleServerTypeRankingCount: [
  //           {
  //             'serviceType': '未命名(mock)',
  //             'count': 37
  //           },
  //           {
  //             'serviceType': '保内免费', // 类型名称
  //             'count': 52 // 数量
  //           },
  //           {
  //             'serviceType': '服务类型1',
  //             'count': 3
  //           }
  //         ]
  //       },
  //       // 右侧饼图数据
  //       'rightPieChart': { // 右侧饼状图数据
  //         'typeCountContrast': { // 要对比的数据
  //           'cycleCompleteTaskTypeCount': { // 周期内完成工单那类型
  //             '第十一个': 12,
  //             '何家乐的工单': 0,
  //             '测试审批': 4,
  //             '移动之附加组': 5,
  //             '示例数据默认工单': 8,
  //             '更换发动机': 1,
  //             '回执表单测试': 2,
  //             '测试服务报告': 1,
  //             '电子签名勿动': 3,
  //             '默认工单': 77,
  //             '短信测试QA': 4,
  //             '电子签名字段': 10,
  //             '千一的工单': 1
  //           },
  //           'cycleEvaluateTaskCustomerSatisfied': { // 周期内完成的客户满意度
  //             'satifaction': 4, // 满意
  //             'general': 0, // 一般
  //             'unSatifaction': 1 // 不满意
  //           },
  //           'cycleCompleteTaskProductCount': { // 周期内完成的产品类型
  //             '无': 146,
  //             '产品类型3': 12,
  //             '哈哈哈哈哈测试': 1,
  //             '测试1': 13
  //           }
  //         },
  //         'taskProuctTypeAndDegteeCount': { //  饼状图展示数据
  //           'cycleCompleteTaskTypeCount': { //  周期内完成工单的类型
  //             '第十一个': dev,
  //             '何家乐的工单': 10,
  //             '测试审批': 14,
  //             '移动之附加组': 4,
  //             '示例数据默认工单': 4,
  //             '更换发动机': 3,
  //             '回执表单测试': 6,
  //             '测试服务报告': 26,
  //             '电子签名勿动': 1,                
  //             '默认工单': 77,
  //             '短信测试QA': 1,
  //             '电子签名字段': 10,
  //             '千一的工单': 3
  //           },
  //           'cycleEvaluateTaskCustomerSatisfied': { // 周期内完成的客户满意度
  //             'satifaction': 4,
  //             'general': 0,
  //             'unSatifaction': 1
  //           },
  //           'cycleCompleteTaskProductCount': { // 周期内完成的产品类型
  //             '无': 146,
  //             '产品类型3': 12,
  //             '哈哈哈哈哈测试': 1,
  //             '测试1': 13
  //           }
  //         }
  //       }
  //     }
  //   })
  // })
}
