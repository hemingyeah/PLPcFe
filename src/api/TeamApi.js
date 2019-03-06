import http from '@src/util/http';
/**
 * 获取团队分页数据
 * @returns 分页数据
 */
export function list(){
  return new Promise((resolve, reject) => {
    let base = [
      {
        id: Math.random() * 10000000 >> 0,
        name: '山东团队',
        manager: '张三',
        phone: '13895546633',
        location: '九江路22号(九江路和宜丰路交汇处)',
        area: '山东省青岛市市北区',
        children: [
          {
            id: Math.random() * 10000000 >> 0,
            name: '济南团队',
            manager: '张三',
            phone: '13895546633',
            area: '青岛市市北区',
            location: '重庆南路178号'              
          },
          {
            id: Math.random() * 10000000 >> 0,
            name: '青岛团队',
            manager: '李四',
            phone: '13895546633',
            area: '青岛市市北区',
            location: '重庆南路178号'
          },
          {
            id: Math.random() * 10000000 >> 0,
            name: '临沂团队',
            manager: '王五',
            phone: '13895546633',
            area: '青岛市市北区',
            location: '重庆南路178号'
          }
        ],
      },
      {
        id: Math.random() * 10000000 >> 0,
        name: '山西团队',
        manager: '张三',
        phone: '13895546633',
        area: '内蒙古自治区呼和浩特市金山开发区',
        location: '金山大道(牛牛营村)',
        children: [],
      },
      {
        id: Math.random() * 10000000 >> 0,
        name: '北京团队',
        manager: '张三',
        phone: '13895546633',
        area: '青岛市市北区',
        location: '重庆南路178号',
        children: [
          {
            id: Math.random() * 10000000 >> 0,
            name: '海淀团队',
            manager: '张三',
            phone: '13895546633',
            area: '青岛市市北区',
            location: '重庆南路178号',
          },
          {
            id: Math.random() * 10000000 >> 0,
            name: '朝阳团队',
            manager: '张三',
            phone: '13895546633',
            area: '青岛市市北区',
            location: '重庆南路178号',
          },
          {
            id: Math.random() * 10000000 >> 0,
            name: '中关村团队',
            manager: '张三',
            phone: '13895546633',
            area: '青岛市市北区',
            location: '重庆南路178号',
          }
        ]
      }
    ]
  
    for(let i = 0; i < 50; i++){
      base.push({
        id: Math.random() * 10000000 >> 0,
        name: `测试团队 -- ${i}`,
        manager: `测试人员 -- ${i}`,
        phone: '13895546633',
        area: '山东省青岛市李沧区',
        location: `重庆南路${100 + i}号`
      })
    }
  
    setTimeout(() => {
      resolve({list: base, hasPreviousPage: false, hasNextPage: false, pageNum: 1, total: base.length})
    }, 1000);
  })
}

/**
 * 获取团队列表数据
 *  * @param {Object} params
 * @param {Number} params.pageNum -- 页码
 * @param {Number} params.pageSize -- 页面大小
 * @returns Promise<Team>
 */
export function tagList(params) {
  return http.post('/security/tag/list', params);
}

/**
 * 删除团队
 * @param {Array} ids - 团队id数组
 * @returns Promise<Team>
 */
export function deleteTag(ids) {
  return http.post('/security/tag/deleteTag', ids);
}

/**
 * 新建团队/子团队
 * @param {Object} params
 * 
 * @returns Promise<Team>
 */
export function createTag(params) {
  return http.post('/security/tag/createTag', params);
}

/**
 * 编辑团队/子团队
 * @param {Object} params
 * 
 * @returns Promise<Team>
 */
export function updateTag(params) {
  return http.post('/security/tag/updateTag', params);
}

/**
 * 查询单个团队信息
 * @param {String} params.id -- 团队id
 * @returns Promise<Team>
 */
export function getTag(params) {
  return http.get('/security/tag/get', params);
}

/**
 * 查询团队下的人员
 * @param {Object} params
 * @param {Number} params.pageNum -- 页码
 * @param {Number} params.pageSize -- 页面大小
 * @param {String} params.id -- 团队id
 * @returns Promise<Team>
 */
export function userList(params) {
  return http.post('/security/tag/userList', params, false);
}

/**
 * 添加团队  人员
 * @param {String} params.tagId -- 团队id
 * @param {Array} params.userIds -- 用户id数组
 * @returns Promise<Team>
 */
export function addUser(params) {
  return http.post('/security/tag/addUser', params, false);
}

/**
 * 删除团队  人员
 * @param {String} params.tagId -- 团队id
 * @param {String} params.userIds -- 用户ids
 * @returns Promise<Team>
 */
export function deleteUser(params) {
  return http.post('/security/tag/deleteUser', params, false);
}
