import http from '@src/util/http';
// let head = '/api/app';
// let head = '';
let prefixAppPath = '/api/app';
let prefixSearchPath = '/api/search';


if(process && process.env.NODE_ENV === 'development') {
  prefixAppPath = '';
  prefixSearchPath = '';
}

// 文档库

/**
 * 获取文档库列表
 * @param {Object} params - 参数
 * @param {String} params.keyword - 关键词
 * @param {String} params.view - 文章分类（my、draft）
 * @param {Number} params.typeIds - 文章类别id
 * @param {String} params.sort - 排序标准(createTime、readTimes)
 * @param {Number} params.pageNum - 页数
 * @param {Number} params.pageSize - 每页条数
 * @param {String} params.label - 标签
 * 
 * @returns Promise<List>
 */
export function getDocumentList (params) {
  return http.post(`${ prefixSearchPath }/outside/es/wiki/list`, params);
  // return http.post('/api/search/outside/es/wiki/list', params);
}


/**
 * 获取文档库列表筛选统计
 * 
 * @returns Promise<Object>
 */
export function getDocumentViewCount () {
  return http.get(`${ prefixAppPath }/outside/wiki/viewCount`);
}

/**
 * 获取分类二级树形结构
 * 
 * @returns Promise<Object>
 */
export function getDocumentTypes () {
  return http.get(`${ prefixAppPath }/outside/wiki/types`);
}

/**
 * 文档库分类添加
 * @param {Object} params 
 * @param {String} params.name - 分类名称
 * @param {String} params.parentId - 父级分类id
 * 
 * @returns Promise<Boolean>
 */
export function addDocumentType (params) {
  return http.post(`${ prefixAppPath }/outside/wiki/type/create`, params);
}

/**
 * 文档库分类修改
 * @param {Object} params 
 * @param {String} params.name - 分类名称
 * @param {String} params.id - 分类id
 * @param {String} params.parentId - 父级分类id
 * 
 * @returns Promise<Boolean>
 */
export function updateDocumentType (params) {
  return http.post(`${ prefixAppPath }/outside/wiki/type/update`, params);
}

/**
 * 文档库分类删除
 * @param {Object} typeId - 分类id
 * 
 * @returns Promise<Boolean>
 */
export function deleteDocumentType (typeId) {
  return http.get(`${ prefixAppPath }/outside/wiki/type/delete`, typeId);
}

/**
 * 获取每个分类下文章数量
 * @param {String} params.view - 文章属性（all、my-我发布的、draft-草稿箱）
 * 
 * @returns Promise<List>
 */
export function getTypesCount (params) {
  return http.get(`${ prefixAppPath }/outside/wiki/typesCount`, params);
}

/**
 * 获取文章详情内容-钉钉内
 * @param {String} params - 文档库id
 * 
 * @returns Promise<Object>
 */
export function getInlineDetail (wikiId) {
  return http.get(`${ prefixAppPath }/outside/wiki/get`, wikiId);
}

/**
 * 获取文章详情内容-外部
 * @param {String} params - 文档库id
 * 
 * @returns Promise<Object>
 */
// export function getPublicDetail (wikiId) {
//   return http.get('/share/wiki/view', wikiId);
// }

/**
 * 删除文档库
 * @param {String} params - 文档库id
 * 
 * @returns Promise<Object>
 */
export function deleteDocument (wikiId) {
  return http.get(`${ prefixAppPath }/outside/wiki/delete`, wikiId);
}

/**
 * 获取文章日志
 * @param {String} params - 文档库id
 * @param {Number} params.pageNum - 页数
 * @param {Number} params.pageSize - 每页条数
 * 
 * @returns Promise<List>
 */
export function getRecord (params) {
  return http.get(`${ prefixAppPath }/outside/wiki/record/list`, params);
}

/**
 * 文档库保存草稿
 * @param {Object} params
 * @param {String} params.id - 草稿id
 * @param {String} params.title - 标题
 * @param {String} params.content - 内容
 * @param {Number} params.typeId - 类别id
 * @param {Number} params.allow_share - 是否允许分享 0-否 1-是
 * @param {Array} params.label - 标签
 * @param {Array} params.attachment - 附件
 * @param {Number} params.originalId - 编辑文档时需要
 * 
 * @returns Promise<Boolean>
 */
export function saveDraft (params) {
  return http.post(`${ prefixAppPath }/outside/wiki/draft/save`, params);
}

/**
 * 文档库保存并提交
 * @param {Object} params
 * @param {String} params.title - 标题
 * @param {String} params.content - 内容
 * @param {Number} params.typeId - 类别id
 * @param {Number} params.allow_share - 是否允许分享 0-否 1-是
 * @param {Array} params.label - 标签
 * @param {Array} params.attachment - 附件
 * @param {Number} params.originalId - 编辑文档时需要 
 * 
 * @returns Promise<Boolean>
 */
export function saveAndSumbit (params) {
  return http.post(`${ prefixAppPath }/outside/wiki/submit`, params);
}

/**
 * 系统设置接口-开启关闭审批
 * @param {Boolean} state - 开关状态
 * 
 * @returns Promise<Boolean>
 */
export function approveSetting (state) {
  return http.get(`${ prefixAppPath }/outside/wiki/setting/approve`, state)
}

/**
 * 系统设置接口-开启关闭分享
 * @param {Boolean} state - 开关状态
 * 
 * @returns Promise<Boolean>
 */
export function shareSetting (state) {
  return http.get(`${ prefixAppPath }/outside/wiki/setting/share`, state)
}

/**
 * 分享接口-推送钉钉工作通知使用协同人选人框，推送给人
 */
export function shareDocument (wikiId, params) {
  return http.post(`${ prefixAppPath }/outside/wiki/share?wikiId=${ wikiId }`, params)
}

/**
 * 文档库创建审批
 * @param {String} params.wikiId - 文档库Id
 * @param {String} params.applyRemark - 发起审批备注
 * 
 * @returns Promise<Boolean>
 */
export function createApprove (params) {
  return http.post(`${ prefixAppPath }/outside/approve/create`, params)
}

/**
 * 文档库处理审批
 * @param {String} params.id - 审批Id
 * @param {String} params.approveRemark - 审批备注
 * @param {String} params.state - 审批结果（fail success）
 * @param {String} params.source - 审批来源
 * 
 * @returns Promise<Boolean>
 */
export function operateApprove (params) {
  return http.post(`${ prefixAppPath }/outside/approve/operate`, params)
}

/**
 * 获取审批详情
 * @param {Object} params
 * @param {String} params.objId - 文档库Id
 * 
 * @returns Promise<Boolean>
 */
export function getApprove (params) {
  return http.get(`${ prefixAppPath }/outside/approve/pending`, params)
}

/**
 * 撤回审批
 * @param {Object} params 
 * @param {String} params.id - 审批id
 */
export function revoke (params) {
  return http.post(`${ prefixAppPath }/outside/approve/revoke`, params)
}



// 通知公告

/**
 * 获取通知公告列表
 * @param {Object} params - 参数
 * @param {String} params.keyword - 关键词
 * @param {Number} params.TypeIds - 文章类别id
 * @param {String} params.sort - 排序标准
 * @param {Number} params.pageNum - 页数
 * @param {Number} params.pageSize - 每页条数
 * 
 * @returns Promise<List>
 */
export function getBulletinList (params) {
  return http.post(`${ prefixSearchPath }/outside/es/notice/search`, params);
  // return http.post('/api/search/outside/es/notice/search', params);
}


/**
 * 获取分类一级树形结构
 * 
 * @returns Promise<Object>
 */
export function getBulletinTypes () {
  return http.get(`${ prefixAppPath }/outside/noticeType/types`);
}

/**
 * 文档库分类添加
 * @param {Object} params 
 * @param {String} params.name - 分类名称
 * 
 * @returns Promise<Boolean>
 */
export function addBulletinType (params) {
  return http.post(`${ prefixAppPath }/outside/noticeType/create`, params);
}

/**
 * 文档库分类修改
 * @param {Object} params 
 * @param {String} params.name - 分类名称
 * 
 * @returns Promise<Boolean>
 */
export function updateBulletinType (params) {
  return http.post(`${ prefixAppPath }/outside/noticeType/update`, params);
}

/**
 * 文档库分类删除
 * @param {Object} typeId - 分类id
 * 
 * @returns Promise<Boolean>
 */
export function deleteBulletinType (typeId) {
  return http.get(`${ prefixAppPath }/outside/noticeType/delete`, typeId);
}

/**
 * 获取每个分类下文章数量
 * 
 * @returns Promise<List>
 */
export function getBulletinTypesCount () {
  return http.get(`${ prefixAppPath }/outside/notice/typesCount`);
}

/**
 * 获取通知公告详情
 * @param {String} params - 文档库id
 * 
 * @returns Promise<Object>
 */
export function getBulletinDetail (noticeId) {
  return http.get(`${ prefixAppPath }/outside/notice/get`, noticeId);
}

/**
 * 删除通知公告
 * @param {String} params - 文档库id
 * 
 * @returns Promise<Object>
 */
export function deleteBulletin (noticeId) {
  return http.get(`${ prefixAppPath }/outside/notice/delete`, noticeId);
}

/**
 * 新建通知公告
 * @param {Object} params
 * @param {String} params.title - 标题
 * @param {String} params.type - 分类名称
 * @param {String} params.typeId - 分类Id
 * @param {String} params.openIds - 通知人员
 * @param {String} params.dingIds - 通知部门
 * @param {Array} params.attachment - 附件列表
 * @param {String} params.content - 内容
 * 
 * @returns Promise<Boolean>
 */
export function createBulletin (params) {
  return http.post(`${ prefixAppPath }/outside/notice/create`, params);
}

/**
 * 更新通知公告
 * @param {Object} params
 * @param {String} params.title - 标题
 * @param {String} params.type - 分类名称
 * @param {String} params.typeId - 分类Id
 * @param {String} params.openIds - 通知人员
 * @param {String} params.dingIds - 通知部门
 * @param {Array} params.attachment - 附件列表
 * @param {String} params.content - 内容
 * 
 * @returns Promise<Boolean>
 */
export function updateBulletin (params) {
  return http.post(`${ prefixAppPath }/outside/notice/update`, params);
}

/**
 * 获取最近5条已读未读用户
 * @param {String} noticeId - 通知公告id
 * 
 * @returns Promise<Object>
 */
export function getReadOrNotLatest (noticeId) {
  return http.get(`${ prefixAppPath }/outside/noticeRead/latest`, noticeId);
}

/**
 * 获取所有已读用户
 * @param {String} noticeId - 通知公告id
 * 
 * @returns Promise<Object>
 */
export function getReadPerson (noticeId) {
  return http.get(`${ prefixAppPath }/outside/noticeRead/read`, noticeId);
}

/**
 * 获取所有未读用户
 * @param {String} noticeId - 通知公告id
 * 
 * @returns Promise<Object>
 */
export function getUnreadPerson (noticeId) {
  return http.get(`${ prefixAppPath }/outside/noticeRead/unread`, noticeId);
}