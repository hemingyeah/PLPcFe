<template>
  <form-builder 
    v-if="init"
    ref="form" mode="task" 
    :fields="fields"
    :value="value" @update="update">
    <template slot="taskNo" slot-scope="{field, value}">
      <form-item :label="field.displayName" :validation="false">
        <div class="form-taskNo">{{value || '工单编号将在创建后由系统生成'}}</div>
      </form-item>
      <form-item label="工单类型" :validation="false">
        <el-select :value="templateId" @input="chooseTemplate">
          <el-option value="1">默认工单</el-option>
          <el-option value="other">其他工单</el-option>
        </el-select>
      </form-item>
    </template>

  </form-builder>
</template>

<script>
import * as TaskApi from '@src/api/TaskApi';

export default {
  name: 'task-edit-form',
  inject: ['initData'],
  props: {
    value: {
      type: Object,
      required: true
    }
  },
  data(){
    return {
      init: false,
      fields: [],
      templateId: '1'
    }
  },
  methods: {
    update({field, newValue, oldValue}){
      let {fieldName, displayName} = field;
      if (this.$appConfig.debug) {
        console.info(`[FormBuilder] ${displayName}(${fieldName}) : ${JSON.stringify(newValue)}`);
      }
      let value = this.value;
      this.$set(value, fieldName, newValue)
      this.$emit('input', value)
    },
    async chooseTemplate(id){
      let loading = this.$loading();
      try {
        
        this.templateId = id;
        // 清空表单
        this.$emit('input', {});
        this.init = false;

        this.fields = await TaskApi.getTemplateFields(id);
        
        this.init = true;
      } catch (error) {
        console.error(error);
      }

      loading.close();
    },
    initialize(){
      this.chooseTemplate(this.templateId);  
    }
  },
  mounted(){
    this.initialize();
  }
}
</script>

<style lang="scss">
.form-taskNo{
  color: #8a8a8a;
  font-style: italic;
  line-height: 32px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

