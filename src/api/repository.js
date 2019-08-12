import http from '@src/util/http';

// 文档库

/**
 * 获取文档库列表
 * @param {Object} params - 参数
 * @param {String} params.keyword - 关键词
 * @param {String} params.view - 文章分类（我发布的、草稿箱）
 * @param {Number} params.TypeIds - 文章类别id
 * @param {String} params.sort - 排序标准
 * @param {Number} params.pageNum - 页数
 * @param {Number} params.pageSize - 每页条数
 * @param {String} params.tag - 标签
 * 
 * @returns Promise<List>
 */
export function getDocumentList (params) {
  return http.post('/outside/wiki/list', params);
}


/**
 * 获取文档库列表筛选统计
 * 
 * @returns Promise<Object>
 */
export function getDocumentViewCount () {
  return http.get('/outside/wiki/viewCount');
}

/**
 * 获取分类二级树形结构
 * 
 * @returns Promise<Object>
 */
export function getDocumentTypes () {
  return http.get('/outside/wiki/types');
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
  return http.post('/outside/wiki/type/create', params);
}

/**
 * 文档库分类修改
 * @param {Object} params 
 * @param {String} params.name - 分类名称
 * @param {String} params.parentId - 父级分类id
 * 
 * @returns Promise<Boolean>
 */
export function updateDocumentType (params) {
  return http.post('/outside/wiki/type/update', params);
}

/**
 * 文档库分类删除
 * @param {Object} typeId - 分类id
 * 
 * @returns Promise<Boolean>
 */
export function deleteDocumentType (typeId) {
  return http.get('/outside/wiki/type/delete', typeId);
}

/**
 * 获取每个分类下文章数量
 * @param {String} params.view - 文章属性（all、my-我发布的、draft-草稿箱）
 * 
 * @returns Promise<List>
 */
export function getTypesCount (params) {
  return http.get('/outside/wiki/typesCount', params);
}

/**
 * 获取文章详情内容-钉钉内
 * @param {String} params - 文档库id
 * 
 * @returns Promise<Object>
 */
export function getOutsideDetail (wikiId) {
  return http.get('/outside/wiki/get', wikiId);
}

/**
 * 获取文章详情内容-外部
 * @param {String} params - 文档库id
 * 
 * @returns Promise<Object>
 */
export function getPublicDetail (wikiId) {
  return http.get('/public/wiki/get', wikiId);
}

/**
 * 删除文档库
 * @param {String} params - 文档库id
 * 
 * @returns Promise<Object>
 */
export function deleteDocument (wikiId) {
  return http.get('/outside/wiki/delete', wikiId);
}

/**
 * 获取文章日志
 * @param {String} params - 文档库id
 * 
 * @returns Promise<Object>
 */
export function getRecord (wikiId) {
  return http.get('/outside/wiki/record/get', wikiId);
}

/**
 * 文档库保存草稿
 * @param {Object} params
 * // TODO: 
 * 
 * @returns Promise<Boolean>
 */
export function saveDraft (params) {
  return http.post('/outside/wiki/draft/save', params);
}

/**
 * 文档库删除草稿
 * @param {String} draftId - 草稿id
 * 
 * @returns Promise<Boolean>
 */
export function deletedraft (draftId) {
  return http.get('/outside/wiki/draft/delete', draftId);
}

/**
 * 文档库保存并提交
 * @param {Object} params
 * // TODO: 
 * 
 * @returns Promise<Boolean>
 */
export function saveAndSumbit (params) {
  return http.post('/outside/wiki/submit', params);
}

/**
 * 系统设置接口-开启关闭审批
 * @param {Boolean} state - 开关状态
 * 
 * @returns Promise<Boolean>
 */
export function approveSetting (state) {
  return http.get('/outside/wiki/setting/approve', state)
}

/**
 * 系统设置接口-开启关闭分享
 * @param {Boolean} state - 开关状态
 * 
 * @returns Promise<Boolean>
 */
export function shareSetting (state) {
  return http.get('/outside/wiki/setting/share', state)
}

/**
 * 分享接口-推送钉钉工作通知使用协同人选人框，推送给人
 * TODO: 不理解
 */
export function shareDocument () {
  return http.get('/outside/wiki/share')
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
  return http.post('/outside/notice/list', params);
}


/**
 * 获取分类一级树形结构
 * 
 * @returns Promise<Object>
 */
export function getBulletinTypes () {
  return http.get('/outside/notice/types');
}

/**
 * 文档库分类添加
 * @param {Object} params 
 * @param {String} params.name - 分类名称
 * 
 * @returns Promise<Boolean>
 */
export function addBulletinType (params) {
  return http.post('/outside/notice/type/create', params);
}

/**
 * 文档库分类修改
 * @param {Object} params 
 * @param {String} params.name - 分类名称
 * 
 * @returns Promise<Boolean>
 */
export function updateBulletinType (params) {
  return http.post('/outside/notice/type/update', params);
}

/**
 * 文档库分类删除
 * @param {Object} typeId - 分类id
 * 
 * @returns Promise<Boolean>
 */
export function deleteBulletinType (typeId) {
  return http.get('/outside/notice/type/delete', typeId);
}

/**
 * 获取每个分类下文章数量
 * 
 * @returns Promise<List>
 */
export function getBulletinTypesCount () {
  return http.get('/outside/notice/typesCount');
}

/**
 * 获取通知公告详情
 * @param {String} params - 文档库id
 * 
 * @returns Promise<Object>
 */
export function getBulletinDetail (noticeId) {
  return http.get('/outside/notice/get', noticeId);
}

/**
 * 删除通知公告
 * @param {String} params - 文档库id
 * 
 * @returns Promise<Object>
 */
export function deleteBulletin (noticeId) {
  return http.get('/outside/notice/delete', noticeId);
}

/**
 * 新建通知公告
 * @param {Object} params
 * // TODO: 
 * 
 * @returns Promise<Boolean>
 */
export function createBulletin (params) {
  return http.post('/outside/notice/create', params);
}

/**
 * 更新通知公告
 * @param {Object} params
 * // TODO: 
 * 
 * @returns Promise<Boolean>
 */
export function updateBulletin (params) {
  return http.post('/outside/notice/update', params);
}

/**
 * 获取最近5条已读未读用户
 * @param {String} noticeId - 通知公告id
 * 
 * @returns Promise<Object>
 */
export function getReadOrNotLatest (noticeId) {
  return http.get('/outside/notice/readOrNot/latest', noticeId);
}

/**
 * 获取所有已读用户
 * @param {String} noticeId - 通知公告id
 * 
 * @returns Promise<Object>
 */
export function getReadPerson (noticeId) {
  return http.get('/outside/notice/read', noticeId);
}

/**
 * 获取所有未读用户
 * @param {String} noticeId - 通知公告id
 * 
 * @returns Promise<Object>
 */
export function getUnreadPerson (noticeId) {
  return http.get('/outside/notice/unread', noticeId);
}