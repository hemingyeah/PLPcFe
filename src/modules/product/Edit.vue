<template>
  <div class="product-container" v-loading.fullscreen.lock="loadingPage">
    <form @submit.prevent="submit" class="base-form">
      <div class="page-title">
        <div class="title">
          <button type="button" class="btn-text btn-back" @click="goBack"><i class="iconfont icon-arrow-left"></i> 返回</button>
          <span class="text">|</span>
          <button type="submit" :disabled="pending" class="btn btn-primary">提交</button>
        </div>
      </div>

      <form-builder ref="form" :fields="productFields" :value="form" @update="update" />
    </form>
  </div>
</template>

<script>

import {getProductDetail} from '@src/api/ProductApi'
import * as FormUtil from '@src/component/form/util';

export default {
  name: 'product-edit',
  props: {
    initData: {
      type: Object,
      default: () => ({}),
    }
  },
  data() {
    return {
      loadingPage: false,
      pending: false,
      init: false,
      form: {},
    }
  },
  computed: {
    productFields() {
      return this.initData.productFields
    },
    auth() {
      return this.initData.auth || {};
    },
    productId() {
      return this.initData.id || '';
    },
    action() {
      return this.productId ? 'edit' : 'create';
    }
  },
  async mounted() {
    try {
      // 初始化默认值
      let form = {};
      if (this.initData.action === 'edit') {
        // 处理编辑时数据
        this.loadingPage = true;
        let cusRes = await getProductDetail(this.productId);
        this.loadingPage = false;
        if(!cusRes.status) form = cusRes.data;
      }


      this.form = FormUtil.initialize(this.productFields, form);
      this.init = true;
    } catch (e) {
      console.error('CustomerEditView caught an error ', e);
    }
  },

  methods: {
    update({field, newValue, oldValue}){
      let {fieldName, displayName} = field;
      if (this.$appConfig.debug) {
        console.info(`[FormBuilder] ${displayName}(${fieldName}) : ${JSON.stringify(newValue)}`);
      }
      let value = this.form;
      this.$set(value, fieldName, newValue);
      this.$emit('input', value)
    },
    submit() {

    },
    goBack() {
      parent.frameHistoryBack(window);
    }
  },
}
</script>

<style lang="scss">
body {
  padding: 10px;
}

.product-container {
  height: 100%;
  width: 100%;
  overflow: auto;
  background-color: #fff;

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