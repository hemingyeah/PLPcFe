<template>
  <div class="setting-product" v-loading="loading">
    <div class="setting-product-header">
      <div>
        <button
          type="button"
          class="btn btn-text setting-back-btn"
          @click="back"
        >
          <i class="iconfont icon-arrow-left"></i> 返回
        </button>
        <span class="setting-header-text">|</span>
        <span>配置自定义字段</span>
      </div>
      <base-button
        type="primary"
        native-type="submit"
        :disabled="pending"
        @event="submit"
      >保存</base-button
      >
    </div>
    <div class="setting-product-design">
      <form-design
        v-model="fields"
        :max="maxField"
        mode="product_menu"
      ></form-design>
    </div>
  </div>
</template>

<script>
import * as FormUtil from '@src/component/form/util';
// import http from '@src/util/http';
import platform from '@src/platform';
import {
  getProductMenuField,
  setProductMenuField,
} from '@src/api/ProductV2Api';
/* mixin */
import fieldMixin from '@src/mixins/fieldMixin';
import FormDesignMixin from '@src/mixins/formDesign';

export default {
  name: 'setting-product-menu-fields-view',
  mixins: [fieldMixin, FormDesignMixin],
  props: {
    initData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      loading: true,
      excludeFormType: ['separator', 'email', 'phone', 'radio'],
      fields: [],
      pending: false,
      maxField: this.initData.fieldNum,
    };
  },
  mounted() {
    // this.setFieldDesignHeight();

    // this.computedFormWidthAndHeight('setting-product');
    // window.addEventListener('resize', this.resizeHandler);
    this.getFieldsInfoReq();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeHandler);
  },
  methods: {
    back() {
      window.parent.frameHistoryBack(window);
    },
    resizeHandler(event) {
      this.computedFormWidthAndHeight('setting-product');
    },
    async submit() {
      try {
        let fields = FormUtil.toField(this.fields);

        fields.forEach((item) => {
          item.tableName = 'product';
          if (item.fieldName == 'serialNumber' && item.isSystem) {
            item.setting.serialNumberUnique = item.setting.serialNumberUnique === true;
          }
        });

        let message = FormUtil.validate(fields);
        if (!FormUtil.notification(message, this.$createElement)) return;

        this.pending = true;

        setProductMenuField(fields).then((result) => {
          if (result.code == 0) {
            platform.notification({
              type: 'success',
              title: '成功',
              message: '产品目录字段更新成功',
            });
            return window.location.reload();
          }
          platform.notification({
            type: 'error',
            title: '产品目录字段更新失败',
            message: result.message,
          });
        });
        // let result = await http.post('/setting/product/saveFields', fields);
        // if (result.status == 0) {
        //   platform.notification({
        //     type: 'success',
        //     title: '成功',
        //     message: '产品字段更新成功',
        //   });
        //   return window.location.reload();
        // }

        // platform.notification({
        //   type: 'error',
        //   title: '产品字段更新失败',
        //   message: result.message,
        // });
      } catch (error) {
        console.error(error);
      }
      this.pending = false;
    },
    // 获取产品表单属性列表
    getFieldsInfoReq() {
      getProductMenuField()
        .then((res) => {
          const { status, result, message } = res;
          // if( status == 0){
          const fields = result || [];
          const sortedFields = fields.sort((a, b) => a.orderId - b.orderId);
          this.fields = FormUtil.toFormField(sortedFields);
          // }

          this.loading = false;
        })
        .catch((error) => {
          this.loading = false;
        });
    },
  },
};
</script>

<style lang="scss">
html,
body {
  height: 100%;
}
.setting-product {
  height: 100%;
  overflow-y: hidden;
  background: #f5f5f5;
}

.setting-header-text {
  margin-right: 12px;
}

.setting-product-header {
  padding: 10px;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  border-bottom: 1px solid #f4f7f5;
}

.setting-product-design {
  margin: 10px;
  height: calc(100% - 53px);
}

.setting-back-btn {
  i.iconfont {
    line-height: 12px;
    font-size: 12px;
  }
}
</style>
