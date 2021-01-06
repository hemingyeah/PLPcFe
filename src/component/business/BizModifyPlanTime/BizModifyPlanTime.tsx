
/* components */
import PlanTimeDialog from '@src/modules/task/view/components/PlanTimeDialog.vue'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* entity */
import Field from '@model/entity/Field'
/* vue */
import VC from '@model/VC'
import { Component, Emit, Prop, Ref } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* util */
import Log from '@src/util/log.ts'
import Platform from '@src/util/Platform'
/* scss */
import '@src/component/business/BizModifyPlanTime/BizModifyPlanTime.scss'

enum BizModifyPlanTimeEmitEventNameEnum {
  Success = 'success'
}

@Component({ 
  name: ComponentNameEnum.BizModifyPlanTime,
  components: {
    [PlanTimeDialog.name]: PlanTimeDialog
  }
})
export default class BizModifyPlanTime extends VC {
  /* 计划时间弹窗 */
  @Ref() readonly PlanTimeDialogComponent !: PlanTimeDialog
  
  /* 工单信息 */
  @Prop() readonly task: any | undefined
  /* 计划时间字段 */
  @Prop() readonly field: Field | undefined
  
  /** 
   * @description 显示修改计划时间弹窗
  */
  private showModifyPlanTimeDialog() {
    Log.succ(Log.Start, this.showModifyPlanTimeDialog.name)
    // @ts-ignore
    this.PlanTimeDialogComponent?.openDialog()
  }
  
  /** 
   * @description 修改计划时间完成回调
  */
  @Emit(BizModifyPlanTimeEmitEventNameEnum.Success)
  private modifyPlanTimeSuccessCallBack(planTime: string) {
    Log.succ(Log.Start, this.modifyPlanTimeSuccessCallBack.name)
    return planTime
  }
  
  render(h: CreateElement) {
    return (
      <div class={ComponentNameEnum.BizModifyPlanTime}>
        <el-tooltip class='item' effect='dark' content='修改计划时间' placement='top'>
          <i class='iconfont icon-bianji1 link-text' onClick={() => this.showModifyPlanTimeDialog()}></i>
        </el-tooltip>
        <plantime-dialog
          ref='PlanTimeDialogComponent' 
          task={this.task}
          field={this.field}
          successCallback={(planTime: string) => this.modifyPlanTimeSuccessCallBack(planTime)}
        />
      </div>
    )
  }
}

