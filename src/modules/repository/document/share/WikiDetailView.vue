<template>
  <div class="document-list-detail" :style="{height: height}">
    <!-- 详情头部 -->
    <div class="detail-top">

      <div class="author">
        <img class="author-img" :src="initData.createUserHead" v-if="initData.createUserHead">
        <img class="author-img" src="../../../../assets/img/avatar.png" v-else>
        <div class="author-info">
          <p class="name">{{initData.createUserName}}</p>
          <p class="time">发布于：{{initData.createTime}}</p>
        </div>
      </div>

      <div class="operating">
        
        <div class="published">
          <span class="readNum">
            <i class="iconfont icon-yanjing"></i>
            <span>{{initData.readTimes}}</span>
          </span>
        </div>
      
      </div>

    </div>

    <!-- 文章详情 -->
    <div class="detail-content" :style="{padding: padding}">

      <div class="info">
        <p class="title">{{initData.title}}</p>
        <div class="ql-container ql-snow content" style="border:none">
          <div class="ql-editor">
            <div v-html="initData.content"></div>
          </div>
        </div>
      </div>
      <!-- 详情页脚部分 -->
      <div class="footer" v-if="(initData.label && initData.label.length > 0) || (initData.attachment && initData.attachment.length > 0)">

        <div class="tags" v-if="initData.label && initData.label.length > 0">
          <i class="iconfont icon-tag icon-tags"></i>
          <el-tag class="detail-tag" v-for="(tag,index) in initData.label" :key="index">{{tag}}</el-tag>
        </div>

        <div class="annex" v-if="initData.attachment && initData.attachment.length > 0">
          <span class="annex-left">附件：</span>
          <div class="annex-right">
            <div class="base-comment-attachment base-file__preview">
              <base-file-item v-for="file in initData.attachment" :key="file.id" :file="file" size="small"></base-file-item>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script>
import * as Lang from '@src/util/lang/index.js'

export default {
  name: 'document-detail',
  props: {
    initData: {
      type: Object,
      default: () => ({})
    }
  },
  created () {
    this.initData.createTime = Lang.formatDate(this.initData.createTime, 'YYYY-MM-DD HH:mm');
  },
  computed: {
    height () {
      return this.showOpenFrame ? '100%' : '100vh';
    },

    padding () {
      return document.body.clientWidth < 550 ? '0 20px 20px' : '0 100px 50px';
      // return this.showOpenFrame ? '0 50px 50px' : '0 100px 50px';
    }
  },
}
</script>

<style lang="scss">
.document-list-detail {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  background: #fff;
  font-size: 14px;
  color: #333;

  .detail-top {
    display: flex;
    justify-content: space-between;
    height: 75px;
    padding: 16px;
    border-bottom: 1px solid #E8EFF0;
    box-sizing: border-box;

    .author {
      font-size: 0;

      .author-img {
        vertical-align: middle;
        display: inline-block;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 15px;
      }
      
      .author-info {
        vertical-align: middle;
        display: inline-block;

        .name {
          font-size: 16px;
          margin: 0 0 4px 0;
        }

        .time {
          font-size: 12px;
          color: #909399;
          margin: 0;
        }
      }
    }

    .operating {
      line-height: 42px;

      .published {
        display: inline-block;
        // margin-right: 10px;
      }

      .draftBox {
        display: inline-block;
        margin-right: 10px;
      }

      .icon-permission {
        font-size: 14px;
        color: #B0BCC3;
        margin-right: 3px;
      }

      .readNum {
        margin: 0 10px;

        .icon-yanjing {
          font-size: 12px;
          color: #B0BCC3;
          margin-left: 8px;
        }

        span {
          display: inline-block;
          padding-left: 5px;
        }
      }

      .management {

        .icon-edit {
          display: inline-block;
          width: 25px;
          height: 25px;
          font-size: 14px;
          color: #38A6A6;
        }

        .icon-delete {
          display: inline-block;
          width: 25px;
          height: 25px;
          font-size: 14px;
          color: #38A6A6;
        }
      }

      
      .icon-operating {
        display: inline-block;
        width: 30px;
        height: 30px;
        line-height: 30px;
        text-align: center;
        font-size: 16px;
        color: #38A6A6;

        cursor: pointer;
      }

      .share {
        display: inline-block;

        width: 20px;
        height: 20px;
        line-height: 20px;

        cursor: pointer;

        .icon-article-share {
          font-size: 16px;
          color: #38A6A6;
        }
      }

      .open {
        display: inline-block;
        height: 30px;
        line-height: 30px;
        margin-left: 10px;
        color: #55B7B4;
        
        cursor: pointer;
      }

      .white-btn {
        background: #fff;
        color: #333;
        border: 1px solid #E2E2E2;

        &:hover {
          border-color: #55B7B4;
          background: #66bebc;
          color: #fff;
        }
      }
    }
  }

  .detail-content {
    flex: 1;
    overflow: auto;

    .info {

      .title {
        margin: 0;
        padding: 35px 0;
        text-align: center;
        font-size: 32px;
      }

      .content {
        font-size: 16px;
        line-height: 30px;
        padding-bottom: 30px;

        word-break: break-all;

        p > img {
          max-width: 100%;
        }
      }
    }

    .footer {
      padding: 12px;
      box-shadow:0px 2px 8px 0px rgba(144,171,184,0.5);
      border-radius: 4px;
      font-size: 0;

      .tags {
        // display: inline-block;
        vertical-align: top;
        font-size: 0;

        .icon-tags {
          vertical-align: middle;
          font-size: 16px;
          color: #B0BCC3;
        }

        .detail-tag {
          vertical-align: middle;
          max-width: 76px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;

          margin-left: 4px;
          border: none;
          background: #E8EFF0;
          color: #606266;
        }
      }

      .dividing-line {
        // display: inline-block;
        height: 22px;
        width: 1px;
        background: #848E92;
        margin: 0 20px;
        vertical-align: top;
      }

      .annex {
        vertical-align: top;
        display: inline-block;
        font-size: 0;

        .annex-left {
          vertical-align: top;
          display: inline-block;
          font-size: 14px;
          line-height: 35px;
          padding: 8px 0;
        }

        .annex-right {
          vertical-align: top;
          display: inline-block;
          padding: 8px;

          .base-file__preview {
            max-width: calc(100vw - 130px);
          }

          a {
            color: #333;
            line-height: 20px !important;
            font-size: 14px;
            display: inline-block;
            text-decoration: none;
            background-color: transparent;

            &:hover {
              color: #55B7B4;
              text-decoration: underline;
            }
          }

          .annex-item {
            font-size: 14px;
          }
        }
      }
    }
  }
}

.base-file-del {
  display: none;
}
</style>