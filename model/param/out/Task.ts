import Result from '@model/Result'
import EsTask from '@model/entity/EsTask'
import TaskView from '@model/entity/TaskView'

import Page from '@model/types/Page'
import MsgModel from '@model/MsgModel'
import LoginUser from '@model/entity/LoginUser/LoginUser'
import TaskConfig from '@model/types/TaskConfig'


/** 获取用户视图列表返回值 */
export type getUserViewsResult = Result<TaskView[]>

/** 获取工单状态数量返回值 Map<string, number> */
export type getTaskCountByStateResult = Result<any>

/** 工单列表查询返回值 */
export type getTaskSearchListResult = Result<Page<EsTask[]>>

/* 筛选已经关联过备件的工单 返回值 */
export type getTaskFilterWithPartResult = MsgModel<string[]>

/* 获取工单最近更新记录 */
export type getLatestRecordResult = MsgModel<string>

/* 获取工单指派人员列表 */
export type getUserListByTagResult = MsgModel<LoginUser[]>

/* 获取工单配置 */
export type getTaskConfigResult = { taskConfig: TaskConfig}