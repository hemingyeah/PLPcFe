<template>
  <div class="document-list-container">
    
    <div class="list-content">
      <div class="list-noData" v-if="value.list && value.list.length <= 0">暂无数据</div>

      <div class="list-item" :class="id == item.id ? 'choosed-item' : ''" v-else v-for="item in value.list" :key="item.id">

        <div class="item-top">
          <i class="iconfont icon-fd-attachment" v-if="item.hasAttachment"></i>
          <p class="item-title" ref="title" @click="toDetail(item)" v-html="item.handleTitle">{{item.title}}</p>
          <!-- 我发布的显示分享 -->
          <span class="share" @click="shareDocument(item);trackEventHandler('share')" v-if="!item.isDraft">
            <i class="iconfont icon-share icon-article-share"></i>
          </span>
          <!-- 草稿箱显示审核状态 -->
          <el-tag class="review-tag" v-if="item.examineState && item.examineState != 0" :type="item.examineState == 1 ? '' : 'danger'">{{item.examineState == 1 ? '待审核' : '已拒绝'}}</el-tag>
        </div>

        <div class="item-cursor" @click="toDetail(item)">
          <div class="item-info">
            <span class="name">{{item.createUserName}}</span>
            <span class="time">创建于：{{item.createtime | fmt_datehour}}</span>
            <span class="type">{{item.type}}</span>
          </div>

          <p class="item-content" ref="content" v-html="item.handleContent">{{item.content}}</p>
        </div>
        

        <div class="item-footer">

          <div class="type" v-if="item.label && item.label.length > 0">
            <i class="iconfont icon-tag icon-tags"></i>
            <el-tag class="search-tag" @click="handleTags(tag);trackEventHandler('tag')" v-for="(tag,index) in item.label" :key="index">{{tag}}</el-tag>
          </div>

          <!-- 我发布的显示权限、阅读量、分享 -->
          <div class="footer-right" v-if="!item.isDraft">
            <span class="permission">
              <i class="iconfont icon-suo icon-permission" v-if="!item.allowShare"></i>
              {{!item.allowShare ? '内部' : '外部'}}
            </span>
            <span class="readNum">
              <i class="iconfont icon-yanjing"></i>
              <span>{{item.readTimes}}</span>
            </span>
          </div>

        </div>

      </div>

    </div>

    <base-modal
      class="type-modal"
      width="400px"
      :show.sync="shareBoxShow"
      title=" ">

      <div>
        <p>请选择分享方式</p>
      </div>

      <div slot="footer" class="edit-footer">
        <el-button @click="inlineShare">对内分享</el-button>
        <el-button type="primary" class="green-btn" @click="outlineShare">对外分享</el-button>
      </div>
    </base-modal>
  </div>
</template>

<script>
import * as RepositoryApi from '@src/api/Repository';
import Clipboard from 'clipboard';

export default {
  name: 'list',
  props: {
    keyword: {
      type: String,
      default: ''
    },
    value: {
      type: Object,
      default: () => ({})
    },
    id: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      total: 18,
      shareBoxShow: false,
      shareInfo: {},
      chosenItem: {},
    }
  },
  methods: {
    // 点击标签成为搜索条件
    handleTags (tag) {
      this.$emit('tag', tag);
    },

    // 点击加号显示标签输入框
    choosePerson (item) {
      let max = -1;
      
      let options = {
        title: '请选择分享人员',
        seeAllOrg: true,
        selectedUsers: this.shareInfo.selectedUsers,
        max,
        action: '/wiki/approver/list',
      };
      return this.$fast.contact.choose('dept', options).then(result => {
        if(result.status == 0){
          let data = result.data || {};
          let users = data.users || [];

          this.shareInfo.selectedUsers = users;
          this.$el.dispatchEvent(new CustomEvent('form.validate', {bubbles: true}));
          this.submitShare(item);
        }
      })
        .catch(err => console.error(err))
    },

    // 内部分享选择人员确定后
    async submitShare (item) {
      if(!this.shareInfo.selectedUsers) return;

      try {
        let userIds = this.shareInfo.selectedUsers.map(item => item.userId);
        let res = await RepositoryApi.shareDocument(item.id, userIds);

        if(res.success) {
          this.$platform.notification({
            title: '分享成功，该分享人员将会收到消息通知',
            type: 'success',
          });
        } else {
          this.$platform.notification({
            title: res.message,
            type: 'error',
          });
        }
      } catch(err) {
        console.error(err)
      }
    },

    shareDocument (item) {
      this.chosenItem = item;
      if(item.allowShare) {
        this.shareBoxShow = true
      } else {
        this.inlineShare();
      }
    },

    // 内部分享，选择人员或者组织
    inlineShare () {
      this.shareBoxShow = false;
      this.choosePerson(this.chosenItem);
    },

    // 外部分享，将连接添加至剪切板
    outlineShare () {
      // 外部文章选择外部分享时
      let _this = this;
      this.shareBoxShow = false;
      let protocol = window.location.protocol;
      let host = window.location.host;
      let url = `${protocol}//${host}/v_open/wiki/view?wikiId=${this.chosenItem.id}`;

      // 获取body
      let body = document.getElementsByTagName('body')[0];

      let copyFrom = document.createElement('a');
      copyFrom.setAttribute('id', 'target');
      copyFrom.setAttribute('target', '_blank');
      copyFrom.setAttribute('href', url);
      copyFrom.innerHTML = url;

      body.appendChild(copyFrom);

      // 创建按钮
      let agent = document.createElement('button');
      // body增加超链接
      body.appendChild(copyFrom);
      // body增加按钮
      body.appendChild(agent); // 采用Clipboard.js方案 // trouble：没有可以传入的HTML元素，但我们可以动态创建一个DOM对象作为代理，复制超链接
      let clipboard = new Clipboard(agent, {
        target() {
          return document.getElementById('target');
        }
      });

      clipboard.on('success', function(e) {
        _this.$platform.notification({
          title: '已将链接复制到剪贴板，快去粘贴吧！',
          type: 'success',
        });
      });

      clipboard.on('error', function(e) {
        _this.$platform.notification({
          title: '分享失败，请重新操作',
          type: 'success',
        });
      });
      // 点击按钮
      agent.click();
      // 移除创建的元素 
      body.removeChild(copyFrom);
      body.removeChild(agent);
    },

    // 跳转到详情页面
    toDetail (item) {
      // this.id = item.id;
      this.$emit('update:id', item.id);
      this.$emit('toDetail', item)
    },

    // TalkingData事件埋点
    trackEventHandler (type) {
      if (type === 'share') {
        window.TDAPP.onEvent('pc：知识库列表-分享事件');
        return;
      }
      if (type === 'reset') {
        window.TDAPP.onEvent('pc：知识库列表-点击标签搜索');
        return;
      }
    }
  }
}
</script>

<style lang="scss">
.document-list-container {
  display: flex;
  flex-direction: column;

  background: #fff;
  height: 100%;
  overflow: hidden;

  .list-content {
    overflow: auto;
    flex: 1;

    .list-noData {
      line-height: 40px;
      text-align: center;
      color: #909399;
    }
  }

  .list-item {
    padding: 10px 11px;
    border-bottom: 1px solid #E8EFF0;
    

    .item-top {
      font-size: 0;
      display: flex;
      height: 24px;
      line-height: 24px;

      .icon-fd-attachment {
        vertical-align: middle;
        font-size: 12px;
        margin-right: 5px;
      }

      .item-title {
        flex: 1;
        margin: 0;
        font-size: 14px;
        font-weight: 500;
        vertical-align: middle;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        cursor: pointer;
      }

      .share {
        width: 20px;
        height: 20px;
        line-height: 20px;

        cursor: pointer;

        .icon-article-share {
          font-size: 16px;
          color: #38A6A6;
        }
      }

      .review-tag {
        width: 54px;
        vertical-align: middle;
        margin-left: 24px;
      }
    }
    
    .item-cursor {
      cursor: pointer;

      .item-info {
        // padding: 4px 0;
        font-size: 12px;
        color: #909399;
        width: 100%;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;

        .type {
          margin-left: 20px;          
        }
      }

      .item-content {
        margin: 4px 0;
        color: #909399;
        line-height: 17px;
        font-size: 12px;

        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        word-break: break-all;
      }
    }
    

    .item-footer {
      display: flex;
      justify-content: space-between;
      font-size: 12px;

      .footer-right {
        flex: 1;
        text-align: right;
        height: 24px;
        line-height: 24px;

        .icon-permission {
          font-size: 14px;
          color: #B0BCC3;
          margin-right: 3px;
        }

        .readNum {

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
      }

      .type {
        font-size: 0;

        .icon-tags {
          vertical-align: middle;
          font-size: 16px;
          color: #B0BCC3;
        }

        .search-tag {
          max-width: 62px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;

          margin-right: 4px;
          border: none;
          background: #E8EFF0;
          color: #606266;
          vertical-align: middle;

          cursor: pointer;
        }
      }
    }
  }

  .choosed-item {
    background: #F5F7FA;
  }

  .type-modal {

    .base-modal-body {
      padding: 10px 30px 0;
    }

    .el-button:hover, .el-button:focus {
      color: #55B7B4;
      border-color: #cce9e9;
      background-color: #eef8f8;
    }

    .el-button--primary:hover, .el-button--primary:focus {
      background: #77c5c3;
      border-color: #77c5c3;
      color: #FFFFFF;
    }

    .green-btn {
      background: #55B7B4;
      border: transparent;
    }
  }
}
</style>