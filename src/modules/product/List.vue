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











  </div>
</template>

<script>
export default {
  name: 'product-list',
  data() {
    return {
      advancedSearchPanelShow: false,
      params: {
        keyword: ''
      }
    }
  },
  mounted() {
    console.log('product-list mounted')
  },
  methods: {
    search() {

    },
    resetParams() {

    },
  },
}
</script>

<style lang="scss">
  .product-list-container {
    padding: 10px;

  }

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


</style>