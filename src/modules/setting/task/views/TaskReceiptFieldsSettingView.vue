<template>
  <div class="setting-task" v-loading.fullscreen.lock="pending">
    <div class="setting-task-header">
      <p>工单表单设置  |  配置工单回执表单及选项</p>
      <div style="display: none">
        <button type="button" class="btn btn-text setting-back-btn" @click="back"><i class="iconfont icon-arrow-left"></i> 返回</button>
        <span class="setting-header-text">|</span>
        <button type="button" class="btn btn-primary" @click="submit" :disabled="pending">保存</button>
      </div>
    </div>

    <div class="setting-task-design">
      <form-design v-model="fields" mode="task_receipt" v-if="init"></form-design>
    </div>

    <other-setting @submit="submit" ref="otherSetting">

      <div class="btn-content">
        <button type="button" class="btn btn-default" style="margin-right:5px;" @click="back">返回</button>
        <button type="button" class="btn btn-primary" @click="submit" :disabled="pending">下一步</button>
      </div>

    </other-setting>

  </div>
</template>

<script>
/* api */
import {getFields, taskSettingSave} from '@src/api/TaskApi';
/* util */
import * as FormUtil from '@src/component/form/util';
import platform from '@src/platform';
/* components */
import OtherSetting from './components/OtherSetting';

export default {
  name: 'task-receipt-fields-setting-view',
  data(){
    return {
      init: false,
      pending: false,
      fields: [],
      templateId: '1',
      templateName: '默认工单',
      tenantId: '7416b42a-25cc-11e7-a500-00163e12f748'
    }
  },
  async mounted(){
    try {
      // TODO: 修改参数
      // let fields = await getTaskTemplateFields({ tableName: 'task_receipt', templateId: '1' });
      let fields = await getFields({ tableName: 'task_receipt', typeId: '1' });
      let sortedFields = fields.sort((a, b) => a.orderId - b.orderId);
      
      this.fields = FormUtil.toFormField(sortedFields);
      this.init = true;
      
    } catch (error) {
      console.log('task-receipt-fields-setting-view: mounted -> error', error)
    }
  },
  methods: {
    back(){
      window.parent.frameHistoryBack(window)
    },
    async submit(_obj){
      console.log("submit")
      console.log(_obj)
      // return false;
      try {
        let fields = FormUtil.toField(this.fields);
        let index = 0;
        fields.forEach(item => {
          item.tableName = 'task_receipt';
          item.orderId = index++;
          item.tenantId = this.tenantId;
          item.templateId = this.templateId;
          item.templateName = this.templateName;
        });

        let message = FormUtil.validate(fields);
        if(!FormUtil.notification(message, this.$createElement)) return;

        this.pending = true;

        let result = await taskSettingSave(fields);

        if(_obj.clickType) {
          console.log(this.$refs.otherSetting)
          this.$refs.otherSetting.didShowSystemPanel();
        }else{
          if(result.status == 0){
            platform.notification({
              type: 'success',
              title: '成功',
              message: '工单回执表单更新成功'
            })
            return window.location.reload()
          }else{
            platform.notification({
              type: 'error',
              title: '工单回执表单更新失败',
              message: result.message
            })
          }
        }

      } catch (error) {
        console.error(error)
      }
      this.pending = false;
    }
  },
  components: {
    [OtherSetting.name]: OtherSetting
  }
}
</script>
<style lang="scss">
html,body{
  height: 100%;
}

body{
  padding: 10px;
}

.setting-task{
  height: 100%;
  background-color: #fff;
}

.setting-header-text{
  margin-right: 12px;
}

.setting-task-header{
  padding: 10px;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  border-bottom: 1px solid #f4f7f5;
}

.setting-task-design{
  height: calc(100% - 53px);
}

.setting-back-btn{
  i.iconfont{
    line-height: 12px;
    font-size: 12px;
  }
}

.btn-content{
  position: relative;
  left: 50%;
  margin-bottom: 30px;
}


</style>
