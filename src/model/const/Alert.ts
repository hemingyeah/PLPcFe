import { PLAN_TASK_MAX_PERFORM_NUMBER } from './Number';

// 工单产品联系人地址不相同的提示
export const TASK_PRODUCT_LINKMAN_AND_ADDRESS_NOT_EQUAL_MESSAGE: string = '您选择的产品的「联系人和地址」与已填写的「联系人和地址」不一致，是否替换成产品关联的信息？';
// 工单产品联系人不相同的提示
export const TASK_PRODUCT_LINKMAN_NOT_EQUAL_MESSAGE: string = '您选择的产品的「联系人」与已填写的「联系人」不一致，是否替换成产品关联的联系人？';
// 工单产品地址不相同的提示
export const TASK_PRODUCT_ADDRESS_NOT_EQUAL_MESSAGE: string = '您选择的产品的「地址」与已填写的「地址」不一致，是否替换成产品关联的地址？';
// 计划任务计划时间必填提示
export const PLATN_TASK_PLAN_TIME_REQUIRES_MESSAGE: string = '计划任务必须指定第一个工单的计划时间';
// 计划任务计划时间必填提示
export const TASK_NO_EXECUTOR_MESSAGE: string = '请选择工单负责人';
// 计划任务重复周期不能为0
export const PLATN_TASK_PERIOD_NOT_ZERO_MESSAGE: string = '重复周期不能为0';
// 计划任务创建时间不得超过周期天数
export const PLATN_TASK_CREATE_TIME_NOT_GREATER_THEAN_PERIOD_TIME_MESSAGE: string = '创建时间不得超过周期天数';
// 计划任务截止日期不得超过1年
export const PLATN_TASK_END_TIME_NOT_GREATER_ONE_YEAR_MESSAGE: string = '截止日期不得超过1年';
// 计划任务执行次数不能超过 PLAN_TASK_MAX_PERFORM_NUMBER
export const PLATN_TASK_PERFORM_NUMBER_MAX_MESSAGE: string = `执行次数不能超过${PLAN_TASK_MAX_PERFORM_NUMBER}次`;
// 请选择产品
export const REQUIRES_PRODUCT_MESSAGE: string = '请选择产品';
// 计划时间不能早于现在
export const PLAN_TIME_NOT_LESS_THEN_NOW_MEESSAGE: string = '计划时间不能早于现在';
// 计划时间不能早于现在
export const REQUIRE_OTHER_NOTIFICATION_USER_MEESSAGE: string = '请先选择其他需要通知的人';
// 工单指派地理位置 最大值不能小于最小值
export const MAX_GREATER_THAN__MIN_MESSAGE: string = '最大值不能小于最小值';
// 工单指派地理位置 最大值不能小于最小值
export const REQUIRED_MIN_MESSAGE: string = '请输入最小值';
// 工单指派地理位置 最大值不能小于最小值
export const REQUIRED_MAX_MESSAGE: string = '请输入最大值';
// 转派说明必填提示
export const TASK_NO_REALLOT_REASON_MESSAGE: string = '请填写转派说明';
// 不能将工单转派给原负责人
export const TASK_REALLOT_NOT_SAME_USER_MESSAGE: string = '不能将工单转派给原负责人，请检查';
