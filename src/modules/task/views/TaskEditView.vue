<template>
  <div>
    <form @submit.prevent="submit">
      <button type="submit">提交</button>
      <form-builder 
        v-if="init"
        ref="form" mode="task" 
        :fields="fields"
        :value="form" @update="update">
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
    </form>
  </div>
</template>

<script>
import * as TaskApi from '@src/api/TaskApi';
import * as FormUtil from '@src/component/form/util';

export default {
  name: 'task-edit-view',
  inject: ['initData'],
  data(){
    return {
      init: false,
      fields: [],
      templateId: '1',
      form: {}
    }
  },
  methods: {
    submit(){
      console.log(this.form)
    },
    update({field, newValue, oldValue}){
      let {fieldName, displayName} = field;
      if (this.$appConfig.debug) {
        console.info(`[FormBuilder] ${displayName}(${fieldName}) : ${JSON.stringify(newValue)}`);
      }

      let value = this.form;
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
        this.initValue();
        
        this.$nextTick(() => this.init = true)
      } catch (error) {
        console.error(error);
      }

      loading.close();
    },
    initValue(){
      this.form = FormUtil.initialize(this.fields, this.form);
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

