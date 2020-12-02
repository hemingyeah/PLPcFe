<template>
  <div id="doMyself-components-box" v-loading.fullscreen.lock="fullscreenLoading">
    <div class="top-menu">
      <nav :class="nowPage==='customer'?'nav-checked':''" @click="nowPage='customer'">短信记录</nav>
      <nav :class="nowPage==='visitor'?'nav-checked':''" @click="nowPage='visitor'">公众号消息记录</nav>
    </div>
    <customer-conctact-message v-if="nowPage==='customer'" @pageLoading="pageLoading"></customer-conctact-message>
    <customer-conctact-wxMessage v-if="nowPage==='visitor'" @pageLoading="pageLoading"></customer-conctact-wxMessage>
  </div>
</template>
<script>
import message from './components/message';
import wxMessage from './components/wxMessage';
export default {
  name: 'toast-list',
  data() {
    return {
      nowPage: 'customer',

      fullscreenLoading: false // 整屏loading
    };
  },
  methods: {
    pageLoading(data = false) {
      if (this.fullscreenLoading === data) return;
      this.fullscreenLoading = data;
    }
  },
  components: {
    [message.name]: message,
    [wxMessage.name]: wxMessage
  }
};
</script>
<style lang="scss">
$color-primary-light-9: mix(#fff, $color-primary, 90%) !default;

html,
body {
  height: 100%;
}

.mar-l-10 {
  margin-left: 10px;
}

.product-template-list-view {
  height: 100%;
  overflow: auto;

  .panel-title {
    border-bottom: 1px solid rgb(242, 248, 247);
    color: rgb(132, 138, 147);

    font-size: 16px;
    font-weight: normal;
    line-height: 60px;

    display: flex;
    justify-content: space-between;

    padding: 0 25px;

    .iconfont:hover {
      cursor: pointer;
    }
  }
}

// search
.product-template-list-search-group {
  .advanced-search-function,
  .base-search {
    background: #fff;
    border-radius: 3px;
  }

  .base-search {
    font-size: 14px;

    display: flex;
    justify-content: space-between;

    padding: 12px 10px;

    .product-template-list-base-search-group {
      display: flex;
      justify-content: space-between;

      width: 440px;

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
      background: #fff;
      border-color: $color-primary;
      color: $color-primary;
      font-size: 14px;
      line-height: 32px;
      padding: 0 13px;

      &:hover {
        cursor: pointer;
      }

      .iconfont {
        font-size: 12px;
        font-weight: bolder;
      }
    }
  }
}

.advanced-search-form {
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
      width: 290px !important;
    }
  }

  .advanced-search-btn-group {
    background: #fff;

    display: flex;
    justify-content: flex-end;

    width: 100%;
    padding: 15px 20px;

    position: absolute;
    bottom: 0px;

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

// list
.product-template-list-content {
  padding-top: 10px;

  .product-template-table {
    padding: 10px;

    &:before {
      height: 0;
    }

    .product-template-table-header th {
      background: #f5f5f5;
      color: $text-color-primary;
      font-weight: normal;
    }

    th {
      color: #606266;
      font-size: 14px;
    }
    td {
      color: #909399;
      font-size: 13px;
    }

    .view-detail-btn {
      color: $color-primary;
    }

    .select-column .el-checkbox {
      position: relative;
      top: 3px;
    }
    .el-tooltip {
      p {
        font-size: 13px;
      }
    }
  }

  .table-footer {
    background: #fff;
    border-radius: 0 0 3px 3px;

    display: flex;
    justify-content: space-between;

    padding: 0px 10px 10px 10px;

    .list-info {
      color: #767e89;

      font-size: 13px;
      line-height: 32px;

      margin: 0;

      .iconfont {
        position: relative;
        top: 1px;
      }
    }

    .el-pagination__jump {
      margin-left: 0;
    }
  }
}

.product-template-panel-btn {
  float: right;
  cursor: pointer;
  font-size: 14px;
  margin-right: 5px;

  &:hover {
    color: $color-primary;
  }
}

// product-template selected panel
.product-template-selected-count {
  cursor: pointer;
  color: $color-primary;

  font-size: 13px;

  padding: 0 3px;
  width: 15px;

  text-align: center;
}

.product-template-selected-panel {
  font-size: 14px;
  height: calc(100% - 51px);
}

.product-template-selected-tip {
  padding-top: 80px;

  img {
    display: block;
    width: 240px;
    margin: 0 auto;
  }

  p {
    color: #9a9a9a;

    line-height: 20px;
    text-align: center;

    margin: 30px 0 0 0;
  }
}

.product-template-selected-list {
  height: 100%;
  padding: 10px;
  overflow-y: auto;
}

.product-template-selected-row {
  border-bottom: 1px solid #ebeef5;

  display: flex;
  flex-flow: row nowrap;

  font-size: 13px;
  line-height: 36px;

  &:hover {
    background-color: #f5f7fa;

    .product-template-selected-delete {
      visibility: visible;
    }
  }
}

.product-template-selected-head {
  background-color: #f0f5f5;
  color: #333;
  font-size: 14px;
}

.product-template-selected-sn {
  padding-left: 10px;
  flex: 1;
  @include text-ellipsis;
}

.product-template-selected-name {
  padding-left: 10px;
  width: 150px;
  @include text-ellipsis;
}

.product-template-selected-delete {
  width: 36px;
}

.product-template-selected-row button.product-template-selected-delete {
  background-color: transparent;
  color: #646b78;

  border: none;

  padding: 0;
  width: 36px;
  height: 36px;

  outline: none;
  visibility: hidden;

  i {
    font-size: 14px;
  }

  &:hover {
    color: #e84040;
  }
}

// operation
.product-template-columns-dropdown-menu {
  max-height: 300px;
  overflow: auto;
  .el-dropdown-menu__item {
    padding: 0;
  }
  .el-checkbox {
    width: 100%;
    padding: 5px 15px;
    margin: 0;
  }
}

.operation-bar-container {
  background: #fff;
  border-radius: 3px 3px 0 0;

  display: flex;
  justify-content: space-between;

  padding: 10px;

  .top-btn-group .base-button {
    margin-right: 5px;
  }

  .action-button-group {
    .base-button {
      margin-left: 5px;
    }
  }

  .el-dropdown-btn {
    background: $color-primary-light-9;
    color: $text-color-primary;

    display: inline-block;
    margin-left: 5px;
    padding: 0 15px;

    line-height: 32px;
    outline: none;
    .iconfont {
      margin-left: 5px;
      font-size: 12px;
    }

    &:hover {
      background: $color-primary;
      cursor: pointer;
      color: #fff;
    }
  }
}
.modal-box {
  padding: 10px;
  box-sizing: border-box;
  p {
    font-size: 14px;
  }
  .flex-x {
    display: flex;
    justify-content: flex-end;
  }
  .flex-1{
    flex: 1;
  }
}
</style>