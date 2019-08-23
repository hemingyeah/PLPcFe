<template>
  <div class="document-list-container">

    <div class="list-top" v-if="value.list && value.list.length > 0">符合搜索结果的共<span style="color: #FF7B00">{{value.total}}</span>条</div>
    
    <div class="list-content">
      <div class="list-noData" v-if="value.list && value.list.length <= 0">暂无数据</div>

      <div class="list-item" :class="id == item.id ? 'choosed-item' : ''" v-else v-for="item in value.list" :key="item.id">

        <div class="item-top">
          <p class="item-title" ref="title" @click="toDetail(item)">{{item.title}}</p>
          <!-- 草稿箱显示审核状态 -->
          <el-tag class="review-tag" v-if="item.examineState && item.examineState != 0" :type="item.examineState == 1 ? '' : 'danger'">{{item.examineState == 1 ? '待审核' : '已拒绝'}}</el-tag>
        </div>

        <div class="item-info">
          <span class="name">{{item.createUserName}}</span>
          <span class="time">发布于：{{item.createTime | fmt_datetime}}</span>
          <span class="type">{{item.type}}</span>
        </div>

        <p class="item-content" ref="content">{{item.transferredContent}}</p>

        <div class="item-footer">

          <div class="type" v-if="item.label && item.label.length > 0">
            <i class="iconfont icon-tag icon-tags"></i>
            <el-tag class="search-tag" @click="handleTags(tag)" v-for="(tag,index) in item.label" :key="index">{{tag}}</el-tag>
          </div>

          <!-- 我发布的显示权限、阅读量、分享 -->
          <div class="footer-right" v-if="!item.isDraft">
            <span class="permission">
              <i class="iconfont icon-suo icon-permission" v-if="!item.allowShare"></i>
              <i class="iconfont icon-unie65b icon-permission" v-else></i>
              {{!item.allowShare ? '内部' : '外部'}}
            </span>
            <span class="readNum">阅读（{{item.readTimes}}）</span>
            <span class="share" @click="shareDocument(item)">
              <i class="iconfont icon-share icon-article-share"></i>
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
        <i class="iconfont icon-jinggao share-icon"></i>
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
import * as RepositoryApi from '@src/api/Repository'

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
      // id: null,
      shareBoxShow: false,
      shareInfo: {}
    }
  },
  mounted () {
    this.highlight();
  },
  methods: {
    // 点击标签成为搜索条件
    handleTags (tag) {
      this.$emit('tag', tag);
    },

    // 根据关键词设置高亮字段
    highlight () {
      if(!this.keyword) return;
      let replaceReg = new RegExp(this.keyword, 'g');
      let replaceString = `<span style="color: #FF7B00">${ this.keyword }</span>`;
      this.$refs.content.innerHTML = this.item.content.replace(replaceReg, replaceString);
      this.$refs.title.innerHTML = this.item.title.replace(replaceReg, replaceString);
    },

    // 点击加号显示标签输入框
    choosePerson (item) {
      // this.$refs.notificationRange.$el.click();
      let max = -1;
      
      let options = {
        title: '请选择分享人员',
        seeAllOrg: true,
        selectedUsers: this.shareInfo.selectedUsers,
        max,
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
          this.$platform.alert('分享成功，该分享人员将会收到消息通知');
        } else {
          this.$platform.alert(res.message);
        }
      } catch(err) {
        console.error(err)
      }
    },

    shareDocument (item) {
      if(item.allowShare) {
        this.shareBoxShow = true
      } else {
        this.inlineShare(item);
      }
    },

    // 内部分享，选择人员或者组织
    inlineShare (item) {
      this.shareBoxShow = false;
      this.choosePerson(item);
    },

    // 外部分享，将连接添加至剪切板
    outlineShare () {
      // 外部文章选择外部分享时
      this.shareBoxShow = false;
      let body = document.getElementsByTagName('body')[0];
      let hideTextarea = document.createElement('textarea');
      body.appendChild(hideTextarea);

      hideTextarea.style.position = 'absolute';
      hideTextarea.style.left = '-9999px';
      hideTextarea.style.top = '-9999px';
      hideTextarea.innerHTML = 'http://127.0.0.1:9000/document/detail';

      let selectObject = window.getSelection();
      let range = document.createRange();
      range.setStart(selectObject.anchorNode, selectObject.anchorOffset);
      range.setEnd(selectObject.focusNode, selectObject.focusOffset);

      hideTextarea.focus();
      hideTextarea.setSelectionRange(0, hideTextarea.value.length);
      let successful = document.execCommand('copy');

      // 将此前选中的文本再进行选中
      selectObject.removeAllRanges();
      selectObject.addRange(range);

      if(!successful) {
        this.$platform.alert('分享失败，请重新操作！')
      } else {
        this.$platform.alert('已将链接复制到剪贴板，快去粘贴吧！')
      }
    },

    // 跳转到详情页面
    toDetail (item) {
      // this.id = item.id;
      this.$emit('update:id', item.id);
      this.$emit('toDetail', item)
    },
  },
  
  // watch: {
  //   keyword (n, o) {
  //     console.log(n)
  //     // this.highlight();
  //   }
  // }
}
</script>

<style lang="scss">
.document-list-container {
  display: flex;
  flex-direction: column;

  background: #fff;
  height: 100%;
  overflow: hidden;

  .list-top {
    height: 40px;
    line-height: 40px;
    padding: 0 11px;
    color: #909399;
  }

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
    padding: 11px;
    border-bottom: 1px solid #E8EFF0;
    

    .item-top {
      font-size: 0;
      display: flex;

      .item-title {
        flex: 1;
        margin: 0;
        font-size: 16px;
        font-weight: 500;
        vertical-align: middle;

        cursor: pointer;
      }

      .review-tag {
        width: 54px;
        vertical-align: middle;
        margin-left: 24px;
      }
    }
    

    .item-info {
      padding: 4px 0;
      font-size: 12px;
      color: #909399;

      .type {
        margin-left: 20px;
      }
    }

    .item-content {
      margin: 0;
      padding: 4px 0;
      color: #909399;
      line-height: 22px;

      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }

    .item-footer {
      padding-top: 10px;

      .footer-right {
        // padding-top: 10px;

        .icon-permission {
          font-size: 14px;
          color: #B0BCC3;
          margin-right: 3px;
        }

        .readNum {
          margin: 0 15px;
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
      }

      .type {
        font-size: 0;
        padding-bottom: 10px;

        .icon-tags {
          vertical-align: middle;
          font-size: 16px;
          color: #B0BCC3;
        }

        .search-tag {
          max-width: 76px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;

          margin-left: 4px;
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