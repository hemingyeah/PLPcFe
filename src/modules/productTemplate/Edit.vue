<template>
  <div class="product-template-edit-container" v-loading.fullscreen.lock="loadingPage">

    <!-- start 新建编辑表单 -->
    <form @submit.prevent="submit" class="base-form" v-if="init">

      <!-- start 页面顶部按钮 -->
      <div class="page-title">
        <div class="title">
          <button type="button" class="btn-text btn-back" @click="goBack"><i class="iconfont icon-arrow-left"></i> 返回</button>
          <span class="text">|</span>
          <button type="submit" :disabled="pending" class="btn btn-primary">提交</button>
        </div>
      </div>
      <!-- end 页面顶部按钮 -->

      <!-- start form builder -->
      <form-builder ref="productTemplateEditForm" :fields="fields" :value="form" @update="update">

        <!-- start 产品名称 -->
        <template slot="name" slot-scope="{field}">
          <form-item :label="field.displayName" validation>
            <form-text
              :field="field"
              :value="form.name" @update="update"
              :placeholder="genPlaceholder(field)"/>
          </form-item>
        </template>
        <!-- end 产品名称 -->

        <!-- start 产品编号 -->
        <template slot="serialNumber" slot-scope="{field}">
          <form-item :label="field.displayName" validation>
            <form-text
              :field="field"
              :value="form.serialNumber" @update="update"
              :placeholder="genPlaceholder(field)"/>
          </form-item>
        </template>
        <!-- end 产品编号 -->

        <!-- start 产品类型  -->
        <template slot="type" slot-scope="{field}">
          <form-item :label="field.displayName" validation>
            <div class="input-and-btn">
              <form-select
                :field="field" 
                :source="productTemplateType || []"
                :value="form.type" @update="update"
                :placeholder="genPlaceholder(field)"/>
            </div>
          </form-item>
        </template>
        <!-- end 产品类型 -->
        
      </form-builder>
      <!-- end form builder -->

    </form>
    <!-- end 新建编辑表单 -->

  </div>
</template>

<script>
import * as FormUtil from '@src/component/form/util';
import platform from '@src/platform'

export default {
  name: 'product-template-edit',
  props: {
    initData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      auth: {}, // 权限
      fields: [
        {
          displayName: '产品名称', 
          fieldName: 'name',
          formType: 'text',
          placeHolder: '',
          isNull: 0
        },
        {
          displayName: '产品编号', 
          fieldName: 'serialNumber',
          formType: 'text', 
          isNull: 1
        },
        {
          displayName: '产品类型', 
          fieldName: 'type',
          formType: 'select', 
          isNull: 1,
        },
      ], // 字段列表
      form: {
        name: '',
        serialNumber: '',
        type: ''
      }, // 表单数据
      init: false, // 初始化
      loadingPage: false, // 加载页面
      pending: false, // 等待状态
      productTemplateType: [], // 产品类型列表
    }
  },
  mounted() {
    let fields = 
      [{"id":476,"tenantId":"7416b42a-25cc-11e7-a500-00163e12f748","tableName":"customer","isSystem":1,"fieldName":"name","displayName":"客户","formType":"text","defaultValue":null,"isNull":0,"isSearch":1,"placeHolder":null,"setting":{},"orderId":0,"isDelete":0},{"id":717,"tenantId":"7416b42a-25cc-11e7-a500-00163e12f748","tableName":"customer","isSystem":0,"fieldName":"field_t5eFptCUdOKIaujS","displayName":"逻辑项","formType":"select","defaultValue":null,"isNull":1,"isSearch":0,"placeHolder":null,"setting":{"isMulti":false,"dataSource":["选项1","选项2","选项3","选项4","选项5","选项6","选项7","选项8"]},"orderId":1,"isDelete":0},{"id":475,"tenantId":"7416b42a-25cc-11e7-a500-00163e12f748","tableName":"customer","isSystem":1,"fieldName":"serialNumber","displayName":"客户编号","formType":"text","defaultValue":null,"isNull":0,"isSearch":1,"placeHolder":null,"setting":{},"orderId":2,"isDelete":0},{"id":481,"tenantId":"7416b42a-25cc-11e7-a500-00163e12f748","tableName":"customer","isSystem":1,"fieldName":"manager","displayName":"客户负责人","formType":"user","defaultValue":null,"isNull":1,"isSearch":1,"placeHolder":null,"setting":{},"orderId":3,"isDelete":0},{"id":830,"tenantId":"7416b42a-25cc-11e7-a500-00163e12f748","tableName":"customer","isSystem":0,"fieldName":"field_AzGv2yDylwvpJ6VB","displayName":"逻辑项测试","formType":"select","defaultValue":null,"isNull":1,"isSearch":0,"placeHolder":null,"setting":{"isMulti":false,"dataSource":["测1","测2","测3","测4","测5"]},"orderId":4,"isDelete":0},{"id":477,"tenantId":"7416b42a-25cc-11e7-a500-00163e12f748","tableName":"customer","isSystem":1,"fieldName":"lmName","displayName":"联系人","formType":"text","defaultValue":null,"isNull":0,"isSearch":1,"placeHolder":null,"setting":{},"orderId":5,"isDelete":0},{"id":478,"tenantId":"7416b42a-25cc-11e7-a500-00163e12f748","tableName":"customer","isSystem":1,"fieldName":"lmPhone","displayName":"电话","formType":"phone","defaultValue":null,"isNull":0,"isSearch":1,"placeHolder":null,"setting":{},"orderId":6,"isDelete":0},{"id":718,"tenantId":"7416b42a-25cc-11e7-a500-00163e12f748","tableName":"customer","isSystem":0,"fieldName":"field_99yjJuwQV8Yn8iam","displayName":"多选","formType":"select","defaultValue":null,"isNull":1,"isSearch":0,"placeHolder":"","setting":{"isMulti":true,"dataSource":["选项1","选项2"]},"orderId":8,"isDelete":0},{"id":480,"tenantId":"7416b42a-25cc-11e7-a500-00163e12f748","tableName":"customer","isSystem":1,"fieldName":"tags","displayName":"服务团队","formType":"select","defaultValue":null,"isNull":1,"isSearch":1,"placeHolder":null,"setting":{"isMulti":true,"dataSource":["选项1"]},"orderId":9,"isDelete":0},{"id":752,"tenantId":"7416b42a-25cc-11e7-a500-00163e12f748","tableName":"customer","isSystem":0,"fieldName":"field_FS370VybAi6R6CVw","displayName":"附件测试PL","formType":"attachment","defaultValue":null,"isNull":1,"isSearch":0,"placeHolder":"附件的pleaseholder测试附件的pleaseholder测试附件的pleaseholder测试附件的pleaseholder测试附件的pleaseholder测试附件的pleaseholder测试附件的pleaseholder测试附件的please","setting":{},"orderId":10,"isDelete":0},{"id":716,"tenantId":"7416b42a-25cc-11e7-a500-00163e12f748","tableName":"customer","isSystem":0,"fieldName":"field_NTASlf2KNXmUOSXl","displayName":"日期","formType":"date","defaultValue":null,"isNull":1,"isSearch":0,"placeHolder":null,"setting":{},"orderId":11,"isDelete":0},{"id":719,"tenantId":"7416b42a-25cc-11e7-a500-00163e12f748","tableName":"customer","isSystem":0,"fieldName":"field_iN6yC8a8x8iKmHfS","displayName":"人员","formType":"user","defaultValue":null,"isNull":1,"isSearch":0,"placeHolder":null,"setting":{},"orderId":12,"isDelete":0},{"id":715,"tenantId":"7416b42a-25cc-11e7-a500-00163e12f748","tableName":"customer","isSystem":0,"fieldName":"field_ambl1C222CNvS2Pc","displayName":"时间","formType":"datetime","defaultValue":null,"isNull":1,"isSearch":0,"placeHolder":null,"setting":{},"orderId":13,"isDelete":0},{"id":826,"tenantId":"7416b42a-25cc-11e7-a500-00163e12f748","tableName":"customer","isSystem":0,"fieldName":"field_0RXU221agLm79ptT","displayName":"日期","formType":"date","defaultValue":null,"isNull":1,"isSearch":1,"placeHolder":"下单日期","setting":{},"orderId":14,"isDelete":0},{"id":827,"tenantId":"7416b42a-25cc-11e7-a500-00163e12f748","tableName":"customer","isSystem":0,"fieldName":"field_5q4XKSTVj0cNNIvA","displayName":"单行","formType":"text","defaultValue":null,"isNull":1,"isSearch":0,"placeHolder":null,"setting":{},"orderId":15,"isDelete":0}]
    
    this.fields = [...this.fields, ...fields];
    this.productTemplateType = this.initData && this.initData.productTemplateType || ["产品类型1", "产品类型2", "产品类型3", "产品类型4", "6278￥@6dxm"];
    this.productTemplateType = this.productTemplateType.map(type => ({text: type, value: type}))
    let form = {};

    form = this.unPackForm(this.fields, form);
    this.form = FormUtil.initialize(this.fields, form);
    this.init = true;
      
    console.log('product-edit mounted')
  },
  methods: {
    // 创建产品模板
    createProductTemplate(params) {
      
    },
    // 修改产品模板
    editProductTemplate(params) {
      // 
    },
    // 返回
    goBack() {
      parent.frameHistoryBack(window);
    },
    // 获取提示信息
    genPlaceholder(field){
      return FormUtil.genPlaceholder(field);
    },
    // 将form对象转换为产品对象
    packForm(fields, form) {
      let product = {
        id: form.id,
        attribute: {}
      }

      fields.forEach(field => {
        let {fieldName, isSystem} = field;
        let value = form[fieldName];

        isSystem == 0
          ? product.attribute[fieldName] = value
          : product[fieldName] = value;
      })

      return product
    },
    // 提交
    submit() {
      this.$refs.productTemplateEditForm.validate()
        .then(valid => {
          if (!valid) return Promise.reject('productTemplateEditForm validate fail.');

          const params = this.packForm(this.fields, this.form);
        
          this.pending = true;
          this.loadingPage = true;

          if (this.action === 'edit') {
            return this.editProductTemplate(params);
          }

          this.createProductTemplate(params);
        })
        .catch(err => {
          console.error(err);
          this.pending = false;
          this.loadingPage = false;
        });
    },
    // 将服务端数据 转换为 form 对象
    unPackForm(field, data) {
      return {
        id: data.id,
        name: data.name,
        type: data.type,
        serialNumber: data.serialNumber,
      }
    },
    // 更新数据
    update({field, newValue, oldValue}){
      let {fieldName, displayName} = field;

      if (this.$appConfig.debug) {
        console.info(`[FormBuilder] ${displayName}(${fieldName}) : ${JSON.stringify(newValue)}`);
      }

      this.$set(this.form, fieldName, newValue);
    },
  }
}
</script>

<style lang="scss">
body {
  padding: 10px;
}

.product-template-edit-container {
  background-color: #fff;
  
  height: 100%;
  width: 100%;
  overflow: auto;

  .page-title {
    border-bottom: 1px solid #f4f7f5;
    padding: 12px 10px;

    display: flex;
    justify-content: space-between;

    .iconfont {
      font-size: 12px;
    }

    .title {
      display: flex;
      justify-content: space-between;
      span.text {
        line-height: 34px;
        margin-right: 12px;
      }
    }
  }
}

.form-builder{
  width: 655px;
  padding: 10px 0 0 10px;

  .input-and-btn{
    display: flex !important;
    flex-flow: row nowrap;

    .form-item, .form-text, .form-select, .biz-team-select {
      flex: 1;
    }

    .base-dist-picker{
      padding-right: 0;
    }

    button{
      margin-left: 10px;
    }
  }
}
</style>