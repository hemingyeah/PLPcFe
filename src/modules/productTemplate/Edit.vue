<template>
  <div class="product-template-edit-container" v-loading.fullscreen.lock="loadingPage">

    <!-- start 新建编辑表单 -->
    <form @submit.prevent="submit" class="base-form" v-if="init" novalidate>

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

        <!-- start 产品类型 -->
        <template slot="type" slot-scope="{field}">
          <form-item :label="field.displayName" validation>
            <div class="input-and-btn">
              <form-select
                :field="field" 
                :source="field.setting.dataSource.map(d => {
                  return {
                    text: d,
                    value: d
                  }
                }) || []"
                v-model="form.type"
                :clearable="false"
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
import platform from '@src/platform';

import { productTemplateCreate, productTemplateUpdate, getProductTemplate , getProductFields } from '@src/api/ProductApi.js'

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
      fieldsLocal: [], // 字段列表
      form: {
        name: '',
        serialNumber: '',
        type: ''
      }, // 表单数据
      init: false, // 初始化
      loadingPage: false, // 加载页面
      pending: false, // 等待状态
      fieldsInfo: []
    }
  },
  computed: {
    action() {
      return this.initData.action
    },
    editId() {
      return this.initData.id
    },
    fields() {
      let originFields = (this.fieldsInfo.filter(f => {
          return (
            f.fieldName !== 'customer' 
            && f.fieldName !== 'tags'
          )
        })
      );
      let localFields = this.fieldsLocal;
      let fields = [...localFields, ...originFields];

      let sortedFields = fields.sort((a, b) => a.orderId - b.orderId)
        .map(f => {
          if (f.formType === 'address' && f.isSystem) {
            f.isNull = this.initData.isAddressAllowNull ? 1 : 0;
          }
          return f;
        });
      
      return FormUtil.migration(sortedFields)
    }
  },
  async mounted() {
    const { status, data, message } = await getProductFields({isFromSetting:true});
    if( status == 0 ){
      this.fieldsInfo = data;
    }
    // 初始化默认值
    let form = {};
    // 编辑
    if(this.action == 'edit' && this.initData.id) {
      try {
        this.loadingPage = true;
  
        let result = await getProductTemplate(this.initData.id);
  
        form = result;

        if(form.attribute) {
          form = {
            ...form,
            ...form.attribute
          }
        }
        this.loadingPage = false;

      } catch(err) {
        console.log(`edit mounted err ${err}`)
      }
      
    }
    this.form = FormUtil.initialize(this.fields, form);
    this.init = true;
  },
  methods: {
    createProductTemplate(params) {
      productTemplateCreate(params)
        .then(res => {
          const isSucc = (res.status == 0);

          platform.notification({
            type: isSucc ? 'success' : 'error',
            title: `创建产品模板${isSucc ? '成功' : '失败'}`,
            message: !isSucc && res.message
          })
          
          if(isSucc) {
            this.reloadTab();
            window.location.href = `/product/detail/${res.data}`;
          } else {
            this.pending = false;
            this.loadingPage = false;
          }
        })
        .catch(err => console.error('err', err));
    },
    editProductTemplate(params) {
      productTemplateUpdate(params)
        .then(res => {
          const isSucc = (res.status == 0);

          platform.notification({
            type: isSucc ? 'success' : 'error',
            title: `更新产品模板${isSucc ? '成功' : '失败'}`,
            message: !isSucc && res.message
          })

          if(isSucc) {
            this.reloadTab();
            this.goBack();
          } else {
            this.pending = false;
            this.loadingPage = false;
          }
        })
        .catch(err => console.error('err', err));
    },
    // 返回
    goBack() {
      if(this.action == 'create') {
        let id = window.frameElement.dataset.id;
        return this.$platform.closeTab(id);
      }
      parent.frameHistoryBack(window);
    },
    // 获取提示信息
    genPlaceholder(field){
      return FormUtil.genPlaceholder(field);
    },
    // 将form对象转换为产品对象 提交表单使用
    packForm(fields, form) {
      let product = {
        id: form.id,
        attribute: {}
      }

      fields.forEach(field => {
        let {fieldName, isSystem} = field;
        let value = form[fieldName];
        let tv = null;

        if (field.formType === 'location') {
          value = {};
        }
        if (field.formType === 'address' && !field.isSystem) {
          let all =  [value.province, value.city, value.dist, value.address].filter(str => !!str).join('');

          value = {
            ...value,
          };

          all ? value.all = all : '';

        }

        // 不为系统字段,放在attribute里面
        isSystem == 0
          ? product.attribute[fieldName] = value
          : product[fieldName] = value;
      })

      return product
    },
    reloadTab() {
      let fromId = window.frameElement.getAttribute('fromid');

      this.$platform.refreshTab(fromId);
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
  width: 700px;
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