import _ from 'lodash';

/**
 * @description 审批设置转化成参数
 */
function formatApproveSetting(setting) {
  if(setting === undefined) return {};
  let approveSetting = _.cloneDeep(setting);
  if(approveSetting.level < 2) {
    delete approveSetting.multiApproverSetting;
  }
  if(approveSetting.level === 0) {
    approveSetting.leader = 'none';
  }
      
  // 发起人选择
  if(approveSetting.leader === 'promoter') {
    approveSetting.approvers = [];
    approveSetting.displayName = '';
    approveSetting.taskTemplateId = '';
  }
      
  // leader审批类型为表单人员
  if(approveSetting.leader && !approveSetting.leader.indexOf('formUser') > -1 && approveSetting.leader !== 'users'){
    approveSetting.approvers = [];
  }else{
    approveSetting.taskTemplateId = '';
  }
      
  // 递归:格式化多级审批
  if(Array.isArray(approveSetting.multiApproverSetting)) {
    approveSetting.multiApproverSetting = approveSetting.multiApproverSetting.map(item => formatApproveSetting(item));
  }
      
  if(typeof approveSetting.leader === 'undefined') approveSetting.leader = '';
      
  return approveSetting;
}

/** @description 将数据转化成保存需要的数据结构 */
export function convertDataToParams(config) {
  let taskTypeConfig = _.cloneDeep(config);
  let {id, flowSetting, delayBack, delayBackMin, allowPause, pauseApproveSetting,
    planRemindSetting, noticeLeader, noticeUsers, cancelApproveSetting,
    autoReviewState, taskOverTimeModels } = taskTypeConfig;
  Object.keys(flowSetting).map(key => {
    let {state, overTime, approveSetting, reallotAppr} = flowSetting[key];
    flowSetting[key] = {
      state,
      overTime,
      ...formatApproveSetting(approveSetting)
    }

    if(key === 'allot') {
      flowSetting[key].reallotAppr = reallotAppr !== 'none';
    }

    if(key === 'off') {
      flowSetting[key] = {
        ...flowSetting[key],
        ...formatApproveSetting(cancelApproveSetting),
        state: taskTypeConfig.allowCancel
      }
    }
  });
  flowSetting.pause = {
    state: allowPause,
    ...formatApproveSetting(pauseApproveSetting)
  }
  delete flowSetting.autoReview;
  let params = {
    typeId: id,
    flowSetting,
    delayBack,
    delayBackMin,
    state: planRemindSetting.state,
    minutes: Number(planRemindSetting.minutes),
    minutesType: planRemindSetting.minutesType,
    planningTimeState: 'notice',
    planningTimeMes: noticeLeader ? ['none', 'leader', 'users'][Number(noticeLeader)] : 'none',
    usersIds: noticeUsers.map(item => item.userId).join(','),
    taskOverTimeModels: taskOverTimeModels.map(item => {
      let {reminders = [], overTimeState, isAhead = '0', minutes = '0', remindType, overTimeStatus} = item;
      return {
        overTimeState, 
        isAhead, 
        minutes, 
        remindType,
        overTimeStatus,
        ids: reminders.map(item => item.userId).join(','),
      };
    }),
    autoReviewState
  };
  return params;
}
