<template>
  <div class="form-setting-panel">
    <h3>基础字段 -- {{setting.name}}</h3>
    <div class="form-setting-group">
      <input type="text" placeholder="[必填] 请输入字段标题" data-prop="displayName" :value="field.displayName" @input="updateForDom" :maxlength="nameMaxLength">
    </div>
    <div class="form-setting-group">
      <textarea placeholder="请在此添加描述信息" rows="3" data-prop="placeHolder" :value="field.placeHolder" @input="updateForDom" :maxlength="placeholderMaxLength"></textarea>
    </div>
    <div class="form-setting-group">
      <el-checkbox :value="field.isNull" @input="update($event, 'isNull')" @change="isNullUserField" :true-label="0" :false-label="1">必填</el-checkbox>
      <el-checkbox :value="field.isSearch" @input="update($event, 'isSearch')" :true-label="1" :false-label="0">搜索</el-checkbox>
      <mobile-show-setting v-if="isTaskMode" :field="field" :fields="fields" @input="update"></mobile-show-setting>
    </div>
  </div>
</template>

<script>
import SettingMixin from '@src/component/form/mixin/setting';
import { settingProps } from '@src/component/form/components/props';
import {checkUser,cancelUserApproval} from "@src/api/TaskApi";

export default {
  name: 'form-user-setting',
  mixins: [SettingMixin],
  props: settingProps,
  methods: {
    updateForDom(event){
      let el = event.target;
      let prop = el.dataset.prop;
      let value = el.value;
      
      this.update(value, prop)
    },
    update(value, prop){
      this.$emit('input', {value, prop})
    },
    async isNullUserField() {
      let { id , isNull } = this.field;
      //mode:task为工单设置form
      if((this.mode === 'task' || this.mode === "task_receipt")
          && (id && isNull)) {
        //后端已经存在的人员字段，如果从必填变成非必填，与后端做交互
        let result = await checkUser({id});
        if(result.status == 0) {
          if(result.data && result.data.show == 1) {
            //是审批人
            let confirm = await this.$platform.confirm('该人员字段已在审批流程中选择，如果取消必填，对应的审批流程将设置为“无需审批”，确定要继续吗？');
            if(confirm) {
              this.cancelFormUserAprover(id);
            }else{
              this.field.isNull = 0;
            }
          }
        }else{
          console.log("校验审批人失败！");
        }
      }
    },
    async cancelFormUserAprover(id) {
      //取消该id对应的人员字段必填后，指向该人员的审批流程变为“无需审批”
      // let result = await  http.post("/setting/fieldInfo/confirm",{ id },false);
      let result = await cancelUserApproval({id});
      if(result.status) {
        this.$platform.alert(result.message);
      }
    }
  }
}
</script>
