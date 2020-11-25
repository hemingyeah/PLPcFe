import Result from '@model/Result'
import EsTask from '@model/entity/EsTask'
import TaskView from '@model/entity/TaskView'
import Page from '@model/types/Page'
import MsgModel from '@model/MsgModel'
import LoginUser from '@model/entity/LoginUser/LoginUser'
import TaskConfig from '@model/types/TaskConfig'
import AutoDispatchListItem from '@model/types/AutoDispatchListItem'
import UserCardInfo from '@model/entity/UserCardInfo'
import PageInfo from '@model/entity/PageInfo'
import TaskAllotUserInfo from '@model/entity/TaskAllotUserInfo'
import TaskApprove from '@model/entity/TaskApprove'
import Tag from '@model/entity/Tag/Tag'
import TaskPoolUser from '@model/entity/TaskPoolUser'
import TaskType from '@model/entity/TaskType'


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

/* 自动派单-获取预估列表结果 */
export type getAutoDispatchResultListResult = Result<AutoDispatchListItem[]>

/* 工单指派-获取人员卡片信息 */
export type getTaskUserCardInfoResult = Result<UserCardInfo>

/* 工单指派-获取人员列表信息 */
export type getTaskAllotUserInfoResult = Result<PageInfo<TaskAllotUserInfo>>

/* 工单指派-指派审批信息 */
export type getTaskAllotApproveResult = MsgModel<TaskApprove>

/* 工单指派-指派工单池-审批信息 */
export type getTaskAllotTaskPollApproveResult = MsgModel<TaskApprove>

/* 工单指派-指派-负责人 */
export type getTaskAllotResult = Result<{ state: string, stateDisplayName: string }>

/* 工单指派-指派-工单池 */
export type getTaskAllotTaskPoolResult = Result<{ state: string, stateDisplayName: string }>

/* 工单指派-指派-工单池 有权限接单 人员列表 */
export type getTaskPoolAuthUsersResult = MsgModel<TaskPoolUser[]>

/* 工单指派-指派-工单池订阅人员列表 */
export type getTaskPoolSubscriptionUsersResult = Result<TaskPoolUser[]>

/* 工单指派-指派-客户团队工单池数量 */
export type getCustomerTagTaskPoolCountResult = Result<number>

/* 工单指派-转派 团队列表信息 */
export type getTaskTagListResult = PageInfo<Tag[]>

/* 工单-工单类型信息 */
export type getTaskTypeResult = MsgModel<TaskType>