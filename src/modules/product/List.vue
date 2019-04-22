<template>
  <div class="product-list-container">

    <div class="product-list-search-group-container">
      <form class="base-search" onsubmit="return false;">
        <div class="product-list-base-search-group">
          <el-input v-model="params.keyword" placeholder="根据产品信息搜索">
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
          <base-button type="primary" @event="search" native-type="submit">搜索</base-button>
          <base-button type="ghost" @event="resetParams">重置</base-button>
        </div>
        <span class="advanced-search-visible-btn" @click.self="advancedSearchPanelShow = !advancedSearchPanelShow">高级搜索</span>
      </form>
    </div>

    <div class="product-list-section">
      <!--operation bar start-->
      <div class="operation-bar-container">
        <div class="top-btn-group">
          <base-button type="primary" icon="icon-add" @click="goToCreate">新建</base-button>
          <base-button type="ghost" icon="icon-yemianshanchu">删除</base-button>
        </div>

        <div class="action-button-group">
          <base-button type="plain" @event="openDialog('sendMessage')">发送短信</base-button>
          <base-button type="plain" @event="openDialog('edit')" >批量编辑</base-button>
          <base-button type="plain" @event="openDialog('remind')">批量提醒</base-button>
          <el-dropdown trigger="click">
            <span class="el-dropdown-link el-dropdown-btn">
              更多操作
              <i class="iconfont icon-nav-down"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>
                <div @click="openDialog('importCustomer')">导入产品</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div @click="exportCustomer(false)">导出</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div @click="exportCustomer(true)">导出全部</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div @click="openDialog('update')">批量更新</div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <!--<el-dropdown :hide-on-click="false" :show-timeout="150" trigger="click">-->
            <!--<span class="el-dropdown-link el-dropdown-btn">-->
              <!--选择列-->
              <!--<i class="iconfont icon-nav-down"></i>-->
            <!--</span>-->
            <!--<el-dropdown-menu slot="dropdown" class="customer-columns-dropdown-menu">-->
              <!--<el-dropdown-item v-for="item in columns" :key="item.field">-->
                <!--<el-checkbox :value="item.show" @input="modifyColumnStatus($event, item)" :label="item.label" :disabled="item.field == 'name'"/>-->
              <!--</el-dropdown-item>-->
            <!--</el-dropdown-menu>-->
          <!--</el-dropdown>-->
        </div>
      </div>


    </div>











  </div>
</template>

<script>

import { getProduct } from '@src/api/ProductApi'

export default {
  name: 'product-list',
  props: {
    initData: {
      type: Object,
      default: () => ({}),
    }
  },
  data() {
    return {
      advancedSearchPanelShow: false,
      params: {
        keyword: ''
      }
    }
  },
  mounted() {

  },
  methods: {
    search() {

    },
    resetParams() {

    },
    openDialog() {

    },
    goToCreate() {
      window.location = '/product/create';
    },
  },
}
</script>

<style lang="scss">
  $color-primary-light-9: mix(#fff, $color-primary, 90%) !default;
  .product-list-container {
    padding: 10px;

  }

  // search
  .product-list-container .product-list-search-group-container {

    .advanced-search-function, .base-search {
      background: #fff;
      border-radius: 3px;
    }

    .base-search {
      font-size: 14px;
      display: flex;
      justify-content: space-between;
      padding: 12px 10px;

      .product-list-base-search-group {
        display: flex;
        width: 440px;
        justify-content: space-between;

        .el-input {
          width: 300px;
          input {
            height: 34px;
            line-height: 34px;
            width: 300px;
          }
        }

        a {
          line-height: 33px;
        }

      }

      .advanced-search-visible-btn {
        font-size: 14px;
        font-weight: lighter;
        line-height: 32px;
        color: $color-primary;
        border-color: $color-primary;
        background: #fff;
        padding: 0 13px;
        &:hover {
          cursor: pointer;
        }
      }
    }

    .advanced-search-form {
      overflow: auto;
      padding: 10px 0 63px 0;
      height: calc(100% - 51px);

      .form-item-container {

      }

      .two-columns {
        display: flex;
        flex-wrap: wrap;
        .el-form-item {
          width: 50%;
        }
      }

      .el-form-item {
        .el-form-item__content,
        .el-select,
        .base-dist-picker,
        .el-cascader,
        .el-date-editor {
          width: 290px;
        }
      }

      .advanced-search-btn-group {
        display: flex;
        justify-content: flex-end;
        width: 100%;
        position: absolute;
        bottom: 0px;
        background: #fff;
        padding: 15px 20px;

        .base-button {
          margin: 0 10px;
        }
      }
    }


    .advanced-search-function {
      margin-top: 10px;
      padding-bottom: 10px;

      h4 {
        border-bottom: 1px solid #f4f4f4;
        padding: 10px;
      }

      .el-row {
        padding: 5px 0;
      }
      .input-label {
        text-align: right;
        line-height: 32px;
        padding-right: 0;
      }

    }

  }


  .product-list-container .product-list-section {
    padding-top: 10px;
  }

  // operation
  .product-list-container .product-list-section .operation-bar-container {
    background: #fff;
    border-radius: 3px 3px 0 0;
    display: flex;
    justify-content: space-between;
    padding: 10px;
    border-bottom: 1px solid #f2f2f2;

    .top-btn-group .base-button {
      margin-right: 5px;
    }

    .action-button-group {
      .base-button {
        margin-left: 5px;
      }
    }

    .el-dropdown-btn {
      padding: 0 15px;
      line-height: 32px;
      display: inline-block;
      background: $color-primary-light-9;
      color: $text-color-primary;
      outline: none;
      margin-left: 5px;
      .iconfont {
        margin-left: 5px;
        font-size: 12px;
      }

      &:hover {
        cursor: pointer;
        color: #fff;
        background: $color-primary;
      }
    }
  }


</style>