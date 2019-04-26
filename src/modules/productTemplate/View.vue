<template>
  <div class="product-template-view-container">

    <!-- start 顶部工具栏 -->
    <div class="product-template-toolbar">
      <div class="product-template-toolbar-left" v-if="allowBack || !isDelete">
        <button type="button" class="btn btn-text" @click="goBack" v-if="allowBack"><i class="iconfont icon-arrow-left"></i> 返回</button>
        <template v-if="!isDelete">
          <button type="button" class="btn btn-text" @click="goEdit" v-if="allowEditCustomer"><i class="iconfont icon-edit"></i> 编辑</button>
          <button type="button" class="btn btn-text" @click="deleteProductTemplate" v-if="allowDeleteProductTemplate"><i class="iconfont icon-yemianshanchu"></i> 删除</button>
        </template>
      </div>
    </div>
    <!-- end 顶部工具栏 -->

    <!-- start content -->
    <div class="main-content" v-loading="loading">
      <div class="product-template-detail" v-if="!loading">

        <!-- start 已删除 -->
        <h3 class="product-template-name" :class="{'product-template-name-expand': showWholeName == 1}">
          <span class="product-template-name-delete" v-if="isDelete" title="该客户已被删除，只能查看数据。" v-tooltip>已删除</span>
          <span ref="productTemplateName">{{ productTemplate.name }}</span>
          <i v-if="showWholeName >= 0" @click="showWholeName = !showWholeName" class="iconfont icon-gongsimingchengxiala"></i>
        </h3>
        <!-- end 已删除 -->
        
        <!-- start form表单展示 -->
        <form-view :fields="fields" :value="productTemplate">

          <!-- start  -->
          <template slot="createTime" slot-scope="{value}">
            <div class="form-view-row" v-if="value">
              <label>创建时间</label>
              <div class="form-view-row-content">
                <span>{{ value | fmt_datetime }}</span>
              </div>
            </div>
          </template>
        </form-view>
        <!-- end form 表单展示 -->

      </div>
      <!-- start  -->
      <div class="product-template-relation" v-if="productTemplate.id">
        <base-tabbar :tabs="tabs" v-model="currentTab"></base-tabbar>
        <div class="product-template-relation-content">
          <keep-alive>
            <component :is="currentTab" :share-data="propsForSubComponents"></component>
          </keep-alive>
        </div>
      </div>
      <!-- end -->
    </div>
    <!-- end content -->

  </div>
</template>

<script>
import qs from 'qs';
import url from 'url';

import AuthUtil from '@src/util/auth';
import platform from '@src/platform';

import { getProductTemplate, getProductTemplateStatisticsInit } from '@src/api/ProductApi.js';

import ProductTemplateInfoRecord from './component/ProductTemplateInfoRecord.vue';
import ProductTemplateRelatedProductTable from './component/ProductTemplateRelatedProductTable.vue';

export default {
  name: 'product-template-view',
  props: {
    initData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      currentTab: 'product-template-info-record', // 当前的tab
      loading: false, // 加载状态
      productTemplate: {
        id: ''
      }, // 产品模板数据
      showWholeName: -1, // -1 代表不显示展开icon 0 代表收起 1 代表展开
      statisticalData: {},
      tabs: [],
    }
  },
  computed: {
    // 是否显示返回按钮
    allowBack(){
      let allow = true;

      // 如果带入noHistory参数，则不显示
      let viewUrl = url.parse(window.location.href, true);
      if(viewUrl.query.noHistory) return false;

      // 验证路径
      let path = window.location.pathname;
      let disablePathReg = [/^\/product\/template\/detail\/\S+$/];
      if(disablePathReg.some(reg => reg.test(path))) return false;

      return allow;
    },
    // 是否允许删除产品模板
    allowDeleteProductTemplate() {
      return (this.allowEditCustomer && this.permission.CUSTOMER_DELETE);
    },
    /** 
     * 满足以下条件允许编辑产品模板
     * 1. 产品模板没有被删除
     * 2. 有客户编辑权限
     */
    allowEditCustomer() {
      return (!this.isDelete && this.hasEditCustomerAuth);
    },
    // 字段列表
    fields() {
      let fields = (this.initData.productFields || []).sort((a, b) => a.orderId - b.orderId).filter(field => {
        return field.fieldName !== 'customerId'
      });

      let allFields = [
        ...fields,
        {
          displayName: '',
          formType: 'separator'
        },
        {
          displayName: '创建人',
          fieldName: 'createLoginUser',
          formType: 'user',
          isSystem: 1,
        }, 
        {
          displayName: '创建时间',
          fieldName: 'createTime',
          formType: 'text',
          isSystem: 1,
        }
      ];

      return allFields.map(field => {
        if(field.formType == 'selectMulti') {
          field.formType = 'select';
          field.setting.isMulti = 1;
        }
        return field
      })
    },
    /** 
     * 是否有编辑客户权限，需要满足以下条件之一：
     * 
     * 1. 编辑客户全部权限： 全部客户
     * 2. 编辑客户团队权限： 没有团队的客户都可编辑，有团队的按团队匹配。 包含个人权限
     * 3. 编辑客户个人权限： 自己创建的 或 客户负责人
     */
    hasEditCustomerAuth(){
      let productTemplate = this.productTemplate;
      let loginUserId = (this.loginUser && this.loginUser.userId) || '';
      return AuthUtil.hasAuthWithDataLevel(this.permission, 'CUSTOMER_EDIT', 
        // 团队权限判断
        () => {
          let tags = Array.isArray(productTemplate.tags) ? productTemplate.tags : [];
          // 无团队则任何人都可编辑
          if(tags.length == 0) return true;

          let loginUserTagIds = this.initData.loginUser.tagIds || [];
          return tags.some(tag => loginUserTagIds.indexOf(tag.id) >= 0);
        }, 
        // 个人权限判断
        () => {
          return productTemplate.createUser == loginUserId
        }
      );
    },
    /** 
     * 产品模板是否被删除
     * 在产品模板删除时不允许做任何操作，只能查询 
     * 所有操作的权限应该以此为基础
     */
    isDelete(){
      return (this.productTemplate.isDelete == null || this.productTemplate.isDelete === 1);
    },
    // 当前用户的权限
    permission() {
      return (this.initData && this.initData.loginUser && this.initData.loginUser.authorities) || {};
    },
    /** 子组件所需的数据 */
    propsForSubComponents() {
      return {
        allowEditCustomer: this.allowEditCustomer,
        isDelete: this.isDelete,
        loginUser: this.initData.loginUser,
        productTemplate: this.productTemplate,
      };
    },
    productTemplateId() {
      let href = window.location.pathname;
      let path = '/product/template/detail/';
      let index = 0;

      if(href.indexOf(path) >= 0) {
        index = href.indexOf(path);
        return href.substr(index + path.length);
      }
      return '';
    },
  },
  mounted() {
    this.loading = true;

    this.fetchProductTemplate();
    // this.fetchStatisticalData();
  },
  methods: {
    // 构建tab
    buildTabs() {
      const {
        productQuantity,
        recordQuantity,
      } = this.statisticalData || {};

      return [
        {
          displayName: `信息动态(${recordQuantity || 0})`,
          component: ProductTemplateInfoRecord.name,
          slotName: 'record-tab',
          show: true,
        },
        {
          displayName: `相关产品(${productQuantity || 0})`,
          component: ProductTemplateRelatedProductTable.name,
          show: !this.isDelete
        }
      ].filter(tab => tab.show);
    },
    // 删除产品模板
    deleteProductTemplate() {
      // 
    },
    // 获取产品模板数据
    fetchProductTemplate() {
      const id = this.productTemplateId;
      getProductTemplate(id).then(result => {

        this.productTemplate = Object.freeze(result);
        this.loading = false;

        // TODO: 有数据之后删除
        this.tabs = this.buildTabs();

      })
    },
    // 获取统计数据
    fetchStatisticalData() {
      const params = {
        customerId: this.initData.id || this.productTemplateId
      };
      getProductTemplateStatisticsInit(params).then(result => {
        if (Object.keys(result).every(key => key !== 'taskQuantity')) return;

        this.statisticalData = result;
        this.tabs = this.buildTabs();
      })
    },
    goBack() {
      parent.frameHistoryBack(window);
    },
    // 跳转编辑
    goEdit() {
      window.location = `/product/template/edit/${this.productTemplateId}`;
    },
    selectTab(tab) {
      this.currentTab = tab;
    },
  },
  components: {
    [ProductTemplateInfoRecord.name]: ProductTemplateInfoRecord,
    [ProductTemplateRelatedProductTable.name]: ProductTemplateRelatedProductTable
  }
}
</script>

<style lang="scss">
  $color-primary-light-9: mix(#fff, $color-primary, 90%) !default;

  html, body, .product-template-view-container {
    height: 100%;
  }

  body {
    padding: 10px;
    min-width: 1100px;
    overflow-x: auto;
  }

  .product-template-view-container {
    background: #fff;
    border-radius: 3px;
    box-shadow: 0 1px 4px rgba(216,216,216, .65);

    display: flex;
    flex-flow: column nowrap;
  }

  .product-template-tool-bar {
    border-bottom: 1px solid #f2f2f2;
    color: $text-color-regular;

    display: flex;
    justify-content: space-between;
    
    font-size: 14px;

    .btn-text {
      padding: 5px 12px;
      .iconfont{
        font-size: 14px;
      }
    }
  }

  .product-template-toolbar-left{
    padding: 10px 5px 10px 10px;
  }

  .product-template-toolbar-right{
    padding: 10px 10px 10px 5px;
  }

  .main-content {
    display: flex;
    flex-flow: row nowrap;
    flex: 1;

    position: relative;
  }

  .product-template-detail {
    display: flex;
    flex: 3;
    flex-flow: column nowrap;

    height: 100%;
    min-width: 420px;

    .form-view{
      border-right: 1px solid #f2f2f2;
      flex: 1;
      padding-top: 5px;
      overflow-y: auto;
    }
  }

  .product-template-name{
    background: $color-primary-light-9;
    color: $text-color-primary;

    padding: 13px 20px;
    min-height: 50px;
    margin: 0;

    position: relative;

    font-size: 16px;
    font-weight: 500;

    @include text-ellipsis();

    span{
      white-space: nowrap;
      vertical-align: middle;
    }

    .iconfont {
      position: absolute;
      right: 5px;
      bottom: 15px;

      color: $color-primary;

      font-size: 12px;

      &:hover {
        cursor: pointer;
      }
    }

    &.product-template-name-expand{
      span{
        white-space: normal;
      }

      .iconfont{
        transform: rotateZ(-180deg);
      }
    }

    .product-template-name-delete,
    .product-template-name-disable{
      border-radius: 4px;
      color: #fff;

      display: inline-block;
      height: 18px;
      padding: 0 5px;

      font-size: 12px;
      line-height: 18px;
      font-weight: 400;

      vertical-align: middle;
      cursor: default;
    }

    .product-template-name-delete{
      background-color: $color-danger;
    }
    .product-template-name-disable{
      background-color: #ffc107;
    }
  }

  .product-template-relation {
    background: #fff;
    border-radius: 2px;

    height: 100%;
    min-width: 500px;

    flex: 7;
  }

  .product-template-relation-content {
    height: calc(100% - 50px);
    overflow: auto;
  }

  .action-btn {
    .el-dropdown-btn {
      background: $color-primary-light-9;
      border-radius: 2px;
      color: $text-color-primary;

      display: inline-block;
      padding: 0 15px;
      margin-left: 10px;

      line-height: 34px;
      .iconfont {
        font-size: 12px;
        line-height: 12px;

        margin-right: 3px;
      }

      &:hover {
        background: $color-primary;
        color: #fff;
        cursor: pointer;
      }
    }

    .base-button {
      margin-left: 10px;
    }
  }
</style>