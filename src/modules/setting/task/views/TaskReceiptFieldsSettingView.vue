<template>
  <div class="setting-task">
    <div class="setting-task-header">
      <div>
        <button type="button" class="btn btn-text setting-back-btn" @click="back"><i class="iconfont icon-arrow-left"></i> 返回</button>
        <span class="setting-header-text">|</span>
        <button type="button" class="btn btn-primary" @click="submit" :disabled="pending">保存</button>
      </div>
    </div>
    <div class="setting-task-design">
      <form-design v-model="fields" mode="task_receipt" v-if="init"></form-design>
    </div>
  </div>
</template>

<script>
/* api */
import { getTaskTemplateFields } from '@src/api/TaskApi';
/* util */
import * as FormUtil from '@src/component/form/util';
import http from '@src/util/http';
import platform from '@src/platform';

export default {
  name: 'task-receipt-fields-setting-view',
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
      let fields = await getTaskTemplateFields({ tableName: 'task_receipt', templateId: '1' });
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
    async submit(){
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
        
        let result = await http.post('/setting/taskType/field/save', fields);
        
        if(result.status == 0){
          platform.notification({
            type: 'success',
            title: '成功',
            message: '工单回执表单更新成功'
          })  
          return window.location.reload()
        }

        platform.notification({
          type: 'error',
          title: '工单回执表单更新失败',
          message: result.message
        })
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

</style>
