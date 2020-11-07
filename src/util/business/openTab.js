import qs from 'qs';
import platform from './../../platform';

/** 
 * @description 获取fromId 刷新tab用
*/
function getFromId() {
  let fromId = '';

  try {
    fromId = window.frameElement.getAttribute('id');
  } catch (error) {
    console.warn('getFromId -> error', error)
  }

  return fromId
}

/* ----- start 工单 ------- */
/** 
 * @description 打开工单详情tab
 * @param {String} taskId 工单id
 * @param {Boolean} isNoHistory 是否不显示历史参数
*/
export function openTabForTaskView(taskId = '', isNoHistory = true) {
  let fromId = getFromId();

  platform.openTab({
    id: `task_view_${taskId}`,
    url:`/task/view/${taskId}${isNoHistory ? '?noHistory=1' : ''}`,
    title: `工单${taskId}`,
    close: true,
    fromId
  })
}
/** 
 * @description 打开工单新建/编辑tab
 * @param {String} defaultTypeId 默认工单类型id
*/
export function openTabForTaskCreate(defaultTypeId = '') {
  let fromId = getFromId();

  platform.openTab({
    id: 'task_edit',
    title: '正在加载',
    url: `/task/edit?defaultTypeId=${defaultTypeId}`,
    close: true,
    fromId,
  });
}
/* ----- end 工单 ------- */


/* ----- start 客户 ------- */
/** 
 * @description 打开客户详情tab
 * @param {String} customerId 客户id
 * @param {Boolean} isNoHistory 是否不显示历史参数
*/
export function openTabForCustomerView(customerId = '', isNoHistory = true) {
  let fromId = getFromId();
  
  platform.openTab({
    id: `customer_view_${customerId}`,
    title: '客户详情',
    close: true,
    url: `/customer/view/${customerId}${isNoHistory ? '?noHistory=1' : ''}`,
    fromId
  });
}
/* ----- end 客户 ------- */


/* ----- start 产品 ------- */
/** 
 * @description 打开产品详情tab
 * @param {String} productId 产品id
 * @param {Boolean} isNoHistory 是否不显示历史参数
*/
export function openTabForProductView(productId = '', isNoHistory = true) {
  let fromId = getFromId();

  platform.openTab({
    id: `product_view_${productId}`,
    title: '产品详情',
    close: true,
    url: `/customer/product/view/${productId}${isNoHistory ? '?noHistory=1' : ''}`,
    fromId
  })
}
/* ----- end 产品 ------- */


/* ----- start 团队 ------- */
/** 
 * @description 打开团队详情tab
 * @param {String} teamId 团队id
 * @param {Boolean} isNoHistory 是否不显示历史参数
*/
export function openTabForTeamtView(teamId = '', isNoHistory = true) {
  let fromId = getFromId();

  platform.openTab({
    id: `team_view_${teamId}`,
    title: '团队详情',
    url: `/security/tag/view/${teamId}${isNoHistory ? '?noHistory=1' : ''}`,
    reload: true,
    close: true,
    fromId
  });
}

/** 
 * @description 打开新建团队tab
 * @param {Boolean} isNoHistory 是否不显示历史参数
*/
export function openTabForTeamCreate(isNoHistory = true) {
  let fromId = getFromId();

  platform.openTab({
    id: 'team_create',
    title: '新建团队',
    url: `/security/tag/createTag${isNoHistory ? '?noHistory=1' : ''}`,
    reload: true,
    close: true,
    fromId
  });
}

/** 
 * @description 打开新建子团队tab
 * @param {String} parentData 父团队数据
*/
export function openTabForTeamChildCreate(parentData) {
  let fromId = getFromId();

  platform.openTab({
    id: 'team_create',
    title: '新建子团队',
    url: `/security/tag/createTag?${qs.stringify(parentData)}`,
    reload: true,
    close: true,
    fromId
  });
}
/* ----- end 团队 ------- */


/* ----- start 用户 ------- */
/** 
 * @description 打开用户详情
 * @param {String} parentData 父团队数据
 * @param {Object} params 参数对象
*/
export function openTabForUserView(userId, params) {
  let fromId = getFromId();

  platform.openTab({
    id: `tab_team_view_${userId}`,
    title: '成员详情',
    close: true,
    reload: true,
    url: `/security/user/view/${userId}?${qs.stringify(params)}`,
    fromId
  });
}
/* ----- end 用户 ------- */


/* ----- start 绩效 ------- */
/** 
 * @description 打开绩效详情
 * @param {String} performanceId 绩效id
*/
export function openTabForPerformanceView(performanceId) {
  let fromId = getFromId();

  platform.openTab({
    id: `performance_reposrt_${performanceId}`,
    title: '绩效报告详情',
    close: true,
    url: `/performance/v2/report/desc/${performanceId}`,
    fromId
  })

}
/* ----- end 绩效 ------- */


/* ----- start 知识库 ------- */
/** 
 * @description 打开知识库新建
*/
export function openTabForWikiCreate() {
  let fromId = getFromId();

  platform.openTab({
    id: 'wiki_create',
    title: '知识库新建',
    url: '/wiki/create/page',
    reload: true,
    close: true,
    fromId
  });
}

/** 
 * @description 打开知识库编辑
 * @param {String} wikiId 知识库id
*/
export function openTabForWikiEdit(wikiId = '') {
  let fromId = getFromId();

  platform.openTab({
    id: `wiki_create_${wikiId}`,
    title: '知识库编辑',
    url: `/wiki/edit/page?wikiId=${wikiId}`,
    reload: true,
    close: true,
    fromId
  });
}

/** 
 * @description 打开知识库详情
 * @param {String} wikiId 知识库id
*/
export function openTabForWikiView(wikiId = '') {
  let fromId = getFromId();

  platform.openTab({
    id: `document_detail_${wikiId}`,
    title: '知识库详情',
    url: `/wiki/detail/page?wikiId=${wikiId}`,
    reload: true,
    close: true,
    fromId
  });
}

/** 
 * @description 打开知识库列表
*/
export function openTabForWikiList() {
  let fromId = getFromId();

  platform.openTab({
    id: 'wiki',
    title: '知识库列表',
    url: '/wiki',
    reload: true,
    close: true,
    fromId
  });
}
/* ----- end 知识库 ------- */

/* ----- start 事件 ------- */
/** 
 * @description 打开事件详情
 * @param {String} eventId 事件id
*/
export function openTabForEventView(eventId) {
  let fromId = getFromId();
  platform.openTab({
    id: `event_view_${eventId}`,
    title: '事件详情',
    close: true,
    url: `/event/view/${eventId}`,
    fromId
  })
}
/* ----- end 事件 ------- */


/* ----- start 通用 ------- */
/** 
 * @description 打开tab
 * @param {object} tabParams tab参数数据
*/
export function openTabCommon(tabParams = {}) {
  let fromId = getFromId();

  platform.openTab({
    ...tabParams,
    fromId
  });
}
/* ----- end 通用 ------- */


