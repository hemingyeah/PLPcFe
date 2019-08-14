<template>
  <div class="document-list-container">

    <div class="list-top">符合搜索结果的共<span style="color: #FF7B00">{{total}}</span>条</div>

    <div class="list-item" :class="{'choosed-item': id}">

      <div class="item-top">
        <p class="item-title" ref="title" @click="toDetail(item)">{{item.title}}</p>
        <!-- 草稿箱显示审核状态 -->
        <el-tag class="review-tag" v-if="item.property == '草稿箱'" :type="item.review == '待审核' ? '' : 'danger'">{{item.review}}</el-tag>
      </div>

      <div class="item-info">
        <span class="name">{{item.name}}</span>
        <span class="time">发布于：{{item.time}}</span>
        <span class="type">{{item.type}}</span>
      </div>

      <p class="item-content" ref="content">{{item.content}}</p>

      <div class="item-footer">

        <div class="type">
          <i class="iconfont icon-tag icon-tags"></i>
          <el-tag class="search-tag" @click="handleTags(tag)" v-for="(tag,index) in item.tags" :key="index">{{tag}}</el-tag>
        </div>

        <!-- 我发布的显示权限、阅读量、分享 -->
        <div class="footer-right" v-if="item.property == '我发布的'">
          <span class="permission">
            <i class="iconfont icon-suo icon-permission" v-if="item.permission"></i>
            <i class="iconfont icon-unie65b icon-permission" v-else></i>
            {{item.permission ? '内部' : '外部'}}
          </span>
          <span class="readNum">阅读（{{item.readNum}}）</span>
          <span class="share" @click="shareArticle">
            <i class="iconfont icon-share icon-article-share"></i>
          </span>
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
export default {
  name: 'list',
  props: {
    keyword: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      total: 18,
      id: true,
      shareBoxShow: false,
      item: {
        property: '我发布的',
        title: '最前线|微信内测新功能，提升阅读效率没那么容易',
        name: '张某某',
        time: '2019年7月7日 19:03',
        review: '已拒绝',
        type: '分类1/分类1.1',
        content: '作为一枚初入鹅厂的鲜鹅，对这里的一切都充满着求知欲。看到我们的KM平台如此生机勃勃，各种技术分享交流如火如荼，在努力的汲取着养分的同时也期待自己能为这个生态圈做出贡献。',
        tags: ['诚信诚信哈诚信诚信哈', '友善诚信哈', '进取诚信哈', '奋发诚信哈'],
        permission: true,
        readNum: 10086
      }
    }
  },
  created () {
    this.highlight()
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

    // 文章分享
    shareArticle () {
      // 外部文章分享
      this.shareBoxShow = true;

      // 内部文章分享
      // this.inlineShare();
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

      this.share = '';
    },

    // 内部分享，选择人员或者组织
    inlineShare () {
      this.shareBoxShow = false;
      console.log('选人')
      this.share = '';
    },

    // 跳转到详情页面
    toDetail (item) {
      this.$emit('toDetail', item)
    },
  },
  watch: {
    keyword (n, o) {
      this.highlight();
    }
  }
}
</script>

<style lang="scss">
.document-list-container {
  background: #fff;

  .list-top {
    height: 40px;
    line-height: 40px;
    padding: 0 11px;
    color: #909399;
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
        padding-top: 10px;

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

          .share-box {

            .share-box-item {

            }

            .bottom {

            }
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