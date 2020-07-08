<template>
  <div class="call-center-apply">
    <div class="container">
      <div class="left-menu">
        <div class="menu-title">呼叫中心设置</div>
        <nav class="menu-list">
          <div class="icon-box">
            <i class="iconfont icon-setting"></i>
          </div>
          <span>呼叫中心设置</span>
        </nav>
      </div>
      <div class="main">
        <div class="apply-box">
          <p>您的申请我们已经收到，客户经理将在1个工作日内联系你</p>
          <div class="tip">
            <img src="../../../assets/img/screen-data-time.png">
            <div class="content">
              <p>呼叫中心</p>
              <span>使用呼叫中心，让您与客户更方便快捷地联系，并且清晰管理您的通话记录与数据</span>
            </div>
            <div class="divider"></div>
            <div class="help">
              <p>帮助你更好地创建应用服务</p>
              <ul>
                <li><a href=''>帮助文档</a></li>
              </ul>
            </div>
          </div>
          <el-button type="default" disabled>申请开通</el-button>
        </div>

      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'call-center-auditing'
}
</script>
<style lang="scss">
.call-center-apply {
  padding: 10px;
  position: relative;
  box-sizing: border-box;
  min-height: 100vh;
  max-width: 100vw;
  .container {
    display: flex;
    align-items: flex-start;
    .left-menu {
      width: 25%;
      min-width: 200px;
      background: #fff;
      box-sizing: border-box;
      border-radius: 3px;
      overflow: hidden;
      position: sticky;
      position: -webkit-sticky;
      top: 10px;
      height: 100vh;
      .menu-title {
        font-size: 18px;
        color: #454648;
        padding: 10px;
        font-weight: 600;
      }
      .menu-list {
        border-left: 3px solid transparent;
        border-top: 1px solid #f4f4f4;
        padding: 10px 15px;
        position: relative;
        display: flex;
        align-items: center;
        cursor: pointer;
        &:hover {
          background: rgb(246, 246, 246);
        }
        span {
          font-size: 12px;
        }
        .left-border {
          height: 100%;
          width: 3px;
          position: absolute;
          left: 0;
          background: #55b7b4;
          top: 0;
        }
        .icon-box {
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          margin-right: 13px;
          i {
            font-size: 16px;
            font-weight: 600;
          }
        }
      }
    }
    .main {
      margin-left: 10px;
      flex: 1;
      min-width: 920px;
      box-sizing: border-box;
      min-height: 100vh;

      .apply-box {
        background: #fff;
        display: flex;
        flex-direction: column;
        padding: 40px 84px 60px 84px;
        margin: 0 auto;
        p {
          height: 32px;
          font-size: 24px;
          font-weight: 500;
          color: #051a13;
          text-align: center;
          margin-bottom: 24px;
        }
        .tip {
          height: 180px;
          background: #f7f8f9;
          border-radius: 4px;
          margin-bottom: 50px;
          display: flex;
          padding: 30px;
          img {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            margin-right: 10px;
          }
          .content {
            flex: 1;
            width: 330px;
            p {
              font-size: 16px;
              text-align: left;
              margin-bottom: 8px;
            }
          }
          .divider {
            margin: 0 20px;
            width: 2px;
            height: 100%;
            background-color: #eee;
          }
          .help {
            flex: 1;
            p {
              font-size: 16px;
              text-align: left;
              margin-left: 1em;
              margin-bottom: 8px;
            }
            a {
              color: #409eff;
            }
          }
        }
        button {
          width: 96px;
          margin: 0 auto;
        }
      }

      .operation-bar-container {
        display: flex;
        justify-content: flex-end;
        background: #fff;
        padding: 10px;
      }
    }
  }
}

.el-table .warning-row {
  background: oldlace;
}

.el-table .success-row {
  background: #f0f9eb;
}

.el-table th > .cell {
  font-size: 14px !important;
  color: #333 !important;
  font-weight: 500 !important;
}

::-webkit-scrollbar-track {
  background: transparent;
}
</style>