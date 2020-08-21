<template>
  <div class="setting-task" v-loading.fullscreen.lock="pending">
    <div class="setting-task-header">
      <p>工单表单设置  |  配置创建工单时填写的表单</p>
      <div v-if="false">
        <button type="button" class="btn btn-text setting-back-btn" @click="back"><i class="iconfont icon-arrow-left"></i> 返回</button>
        <span class="setting-header-text">|</span>
        <button type="button" class="btn setting-btn-primary" @click="submit" :disabled="pending">保存测试</button>
      </div>
    </div>
    <div class="setting-task-design">
      <form-design v-model="fields" mode="task" v-if="init"></form-design>
    </div>

    <div class="btn-content">
      <button type="button" class="btn setting-btn-default" style="margin-right:5px;" @click="back">返回</button>
      <button type="button" class="btn setting-btn-primary" @click="submit" :disabled="pending">下一步</button>
    </div>

  </div>
</template>

<script>
/* api */
import {getFields, taskSettingSave} from '@src/api/TaskApi';
/* util */
import * as FormUtil from '@src/component/form/util';
import http from '@src/util/http';
import platform from '@src/platform';

export default {
  name: 'task-fields-setting-view',
  data(){
    return {
      init: false,
      pending: false,
      fields: [],
      templateId: '1',
      templateName: '默认工单',
      tenantId: '7416b42a-25cc-11e7-a500-00163e12f748',
    }
  },
  async mounted(){
    try {
      // TODO: 修改参数
      // let fields = await getTaskTemplateFields({ tableName: 'task', templateId: '1' });
      let fields = await getFields({ tableName: 'task', typeId: '1' });
      let sortedFields = fields.sort((a, b) => a.orderId - b.orderId);

      // 工单自带的 attachment 字段需要特殊处理, 提交时需要将formType还原
      sortedFields.forEach(f => {
        if(f.formType == 'attachment' && f.isSystem == 1){
          f.formType = 'taskAttachment'
        }
      }) 
      
      this.fields = FormUtil.toFormField(sortedFields);
      this.init = true;

    } catch (error) {
      console.log('task-fields-setting-view: mounted -> error', error)
    }
  },
  methods: {
    back(){
      window.parent.frameHistoryBack(window)
    },
    async submit(){
      try {
        let fields = FormUtil.toField(this.fields);
        let index = 0;
        fields.forEach(item => {
          item.tableName = 'task';
          item.orderId = index++;
          item.tenantId = this.tenantId;
          item.templateId = this.templateId;
          item.templateName = this.templateName;
          if(item.formType == 'taskAttachment' && item.isSystem) {
            item.formType = 'attachment';
          }
        });

        let message = FormUtil.validate(fields);
        if(!FormUtil.notification(message, this.$createElement)) return;

        this.pending = true;

        let result = await taskSettingSave(fields);
        
        if(result.status == 0){
          platform.notification({
            type: 'success',
            title: '成功',
            message: '工单字段更新成功'
          })
          window.location.href = "/setting/task/receipt";
        }else{
          platform.notification({
            type: 'error',
            title: '工单字段更新失败',
            message: result.message
          })
        }

      } catch (error) {
        console.error(error)
      }
      this.pending = false;
    }
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
  position:fixed;
  right:100px;
  bottom:10px;
}

</style>
