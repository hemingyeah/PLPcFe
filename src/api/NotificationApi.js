import http from '@src/util/http';

/**
 * 获取工作通知列表
 * @param {Object} params - 参数
 * @param {String} params.source - 来源
 * @param {String} params.startTime - 开始时间
 * @param {String} params.endTime - 结束时间
 * @param {Number} params.pageNum - 页数
 * @param {Number} params.pageSize - 每页条数
 * 
 * @returns Promise<JobList>
 */
export function getJobList(params) {
  return http.get('/message/work/getWorkMessage', params);
  // return Promise.resolve({

  // })
}

/**
 * 获取系统通知列表
 * @param {Object} params - 参数 
 * @param {String} params.source - 来源
 * @param {String} params.startTime - 开始时间
 * @param {String} params.endTime - 结束时间
 * @param {Number} params.pageNum - 页数
 * @param {Number} params.pageSize - 每页条数
 * 
 * @returns Promise<SystemList>
 */
export function getSystemList(params) {
  return http.get('/message/system/getSystemMessage', params);
}

/**
 * 消息标记已读
 * @param {Object} params - 参数
 * @param {String} params.type - 类型
 * @param {String} params.primaryId - 实体Id 
 * 
 * @returns Promise<res>
 */
export function haveRead(params) {
  return http.post('/message/updateMsgState', params, false);
}

/**
 * 删除通知
 * @param {Object} params - 参数
 * @param {String} params.type - 类型
 * @param {String} params.primaryId - 实体Id
 * 
 * @returns Promise<res> 
 */
export function deleteNotification(params) {
  return http.post('/message/deleteMessage', params, false);
}

/**
 * 轮询查询系统消息，未读通知条数
 *
 * @returns Promise<message>  
 */
export function getSystemMessage() {
  return http.get('/message/getSystemByPCStatus');
}


export function newGetMessage(type) {
  if (type == 'task') {
    return {
      "status": 0,
      "message": "查询系统通知列表成功",
      "data": {
        "pageNum": 1,
        "pageSize": 20,
        "size": 1,
        "orderBy": null,
        "startRow": 1,
        "endRow": 1,
        "total": 1,
        "pages": 1,
        "list": [
          {
            "id": 7,
            "source": "activity",
            "title": "大优惠",
            "content": "五一劳动节惊喜狂欢购，售后宝短信充值优惠啦！短信充值1万条赠送6千条，充值2万条赠送2万条（买一送一），单价低至0.05元 / 条！快去PC端通知中心，系统通知中点击图片进行优惠充值吧！也可直接联系获取优惠名额：010-86461890！",
            "status": 1,
            "url": "https://pubapp.shb.ltd/setting/message/smsmessage?isPay=true",
            "img": "https://she-dev.oss-cn-hangzhou.aliyuncs.com/acs/newfiles/sample/202004/message_send.png",
            "readed": 1,
            "createTime": 1587834000000,
            "isDelete": 0,
            type: 1
          }
        ],
        "firstPage": 1,
        "prePage": 0,
        "nextPage": 0,
        "lastPage": 1,
        "isFirstPage": true,
        "isLastPage": true,
        "hasPreviousPage": false,
        "hasNextPage": false,
        "navigatePages": 8,
        "navigatepageNums": [
          1
        ]
      },
      "succ": true
    }
  } else {
    return {
      "status": 0,
      "message": "查询成功",
      "data": {
        "pageNum": 1,
        "pageSize": 20,
        "size": 1,
        "orderBy": "readed asc, createTime desc",
        "startRow": 1,
        "endRow": 1,
        "total": 1,
        "pages": 1,
        "list": [
          {
            "id": "22187506",
            type: 2,
            "tenantId": "f110f40b-c678-11ea-9ddd-00163e0f1a1b",
            "userId": "f307e8b5-c678-11ea-9ddd-00163e0f1a1b",
            "source": "daily",
            "pcUrl": "/v_open/dailyReport?tenantId=f110f40b-c678-11ea-9ddd-00163e0f1a1b&module=personal&staffId=146424121533631117&tagId=null&sendDate=2020-07-22&appId=4522",
            "peUrl": "/report/subscibe?module=personal&staffId=146424121533631117&sendDate=2020-07-22&tagId=null&ranKey=jmHqrL",
            "primaryId": "personal",
            "readed": 0,
            "body": {
              "title": "07月22日个人日报",
              "content": "",
              "forms": [
                {
                  "key": "今日计划工单：",
                  "value": "0"
                },
                {
                  "key": "昨日完成工单：",
                  "value": "0"
                },
                {
                  "key": "近30天工单完成量排名：",
                  "value": "--"
                },
                {
                  "key": "统计时间：",
                  "value": "2020-07-22 01:00"
                }
              ]
            },
            "templateId": "2b13a57b-e581-4f3e-9ade-3a92d137bd63",
            "createTime": 1595372401000,
            "tag": "daily",
            "isDelete": 0
          }, {
            body: {
              content: '您已被【黄宝成】设置为【系统管理员】，请登录售后宝查看。',
              forms: null,
              title: '权限分配通知',
            },
            type: 2,
            createTime: 1594997488000,
            id: '202831',
            isDelete: 0,
            pcUrl: null,
            peUrl: null,
            primaryId: '7416b42a-25cc-11e7-a500-00163e12f748',
            readed: 0,
            source: 'authority',
            tag: 'RoleAppend',
            templateId: '4ffedb33-f7aa-4ef3-a464-4df6bfd6008b',
            tenantId: '7416b42a-25cc-11e7-a500-00163e12f748',
            userId: 'b9510211-d82f-11e8-b3c6-00163e304a25',
          }, {
            body: {
              content: '有一个新的工单需要分配，请及时处理',
              forms: [{ key: '客户：', value: 'caca' }, { key: '联系人：', value: 'csa' }, { key: '电话：', value: '17660626837' }, { key: '地址：', value: '山东省青岛市市北区' }, { key: '创建人：', value: '王越' }],
              title: '待分配订阅通知'
            },
            type: 2,
            createTime: 1594880065000,
            id: '202226',
            isDelete: 0,
            pcUrl: '/task/view/950bd322-c72b-11ea-b265-00163e304a25',
            peUrl: '/task/view?id=950bd322-c72b-11ea-b265-00163e304a25&templateId=8ec8db85-4913-4b60-be60-4414c134b1b3&ranKey=lO73oX',
            primaryId: '950bd322-c72b-11ea-b265-00163e304a25',
            readed: 0,
            source: 'task',
            tag: 'SubTaskAllot',
            templateId: '5de82234-2744-4a86-a022-4dd2fe3a8672',
            tenantId: '7416b42a-25cc-11e7-a500-00163e12f748',
            userId: 'b9510211-d82f-11e8-b3c6-00163e304a25',
          }
        ],
        "firstPage": 1,
        "prePage": 0,
        "nextPage": 0,
        "lastPage": 1,
        "isFirstPage": true,
        "isLastPage": true,
        "hasPreviousPage": false,
        "hasNextPage": false,
        "navigatePages": 8,
        "navigatepageNums": [
          1
        ]
      },
      "succ": true
    }
  }

}