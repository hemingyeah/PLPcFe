<template>
  <div class="document-list-detail" :style="{height: height}">
    <!-- 详情头部 -->
    <div class="detail-top">

      <div class="author">
        <img class="author-img" :src="info.author.img">
        <div class="author-info">
          <p class="name">{{info.author.name}}</p>
          <p class="time">发布于：{{info.author.time}}</p>
        </div>
      </div>

      <div class="operating">

        <div class="published" v-if="info.property == '我发布的'">
          <span class="permission">
            <i class="iconfont icon-suo icon-permission" v-if="info.permission"></i>
            <i class="iconfont icon-unie65b icon-permission" v-else></i>
            {{info.permission ? '内部' : '外部'}}
          </span>
          <span class="readNum">阅读（{{info.readNum}}）</span>
        </div>

        <div class="draftBox" v-if="info.property == '草稿箱'">
          <el-tag :type="info.review == '待审核' ? '' : 'danger'">{{info.review}}</el-tag>
        </div>

        <span class="management">
          <i class="iconfont icon-bianji icon-operating"></i>
          <i class="iconfont icon-qingkongshanchu icon-operating"></i>
        </span>

        <span class="share" v-if="info.property == '我发布的'" @click="shareArticle">
          <i class="iconfont icon-share icon-article-share"></i>
        </span>

        <span class="open" @click="openFrame" v-if="showOpenFrame">新页面打开</span>

      </div>
    </div>

    <!-- 文章详情 -->
    <div class="detail-content">

      <div class="info">
        <p class="title">{{info.title}}</p>
        <div class="content">{{info.content}}</div>
      </div>
      <!-- 详情页脚部分 -->
      <div class="footer">

        <div class="tags">
          <i class="iconfont icon-tag icon-tags"></i>
          <el-tag class="detail-tag" @click="handleTags(tag)" v-for="(tag,index) in info.tags" :key="index">{{tag}}</el-tag>
        </div>

        <div class="dividing-line"></div>

        <div class="annex">
          <span class="annex-left">附件：</span>
          <div class="annex-right">
            <div class="annex-item">menu.pdf</div>
            <div class="annex-item">menu.pdf</div>
            <!-- <div class="base-comment-attachment base-file__preview" v-if="form.attachments.length > 0">
              <base-file-item v-for="file in form.attachments" :key="file.id" :file="file" size="small"></base-file-item>
            </div> -->
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'document-detail',
  data () {
    return {
      form: this.buildForm(), // 附件存储格式
      articleId: 'UGDIVUHYI98', // 通知公告id
      showOpenFrame: true, // 是否显示 新页面打开
      info: {
        author: {
          img: 'https://static-legacy.dingtalk.com/media/lADPDgQ9qrulS2fNA7zNA9I_978_956.jpg',
          name: '张某某',
          time: '2019年7月7日 19:03',
        },
        permission: true,
        readNum: 10086,
        tags: ['诚信', '友善', '进取'],
        title: '最前线|微信内测新功能，提升阅读效率没那么容易',
        content: '作为一枚初入鹅厂的鲜鹅，对这里的一切都充满着求知欲。看到我们的KM平台如此生机勃勃，各种技术分享交流如火如荼，在努力的汲取着养分的同时也期待自己能为这个生态圈做出贡献。正好新人导师让我看看能否把产品目前使用的FileUploader从老的组件库分离出来的，自己也查阅了相关的各种资料，对文件上传的这些事有了更进一步的了解。把这些知识点总结一下，供自己日后回顾，也供有需要的同学参考，同时也欢迎各位大牛拍砖指点共同学习。',
        property: '我发布的',
        review: '待审核',
      } // 文章详情
    }
  },
  mounted () {
    // 根据formId来判断是否是在新页面打开
    if(!window.frameElement) {
      this.showOpenFrame = false;
      return;
    }
    let formId = window.frameElement.getAttribute('id');
    if(formId.indexOf('document_detail') != -1) this.showOpenFrame = false;
  },
  methods: {
    buildForm(){
      return {
        content: '',
        attachments: [],
        showInOwn: 0
      }
    },
    // 新页面打开通知公告详情
    openFrame () {
      let fromId = window.frameElement.getAttribute('id');
      
      this.$platform.openTab({
        id: `document_detail_${ this.articleId }`,
        title: '文档库详情',
        url: `/document/detail?id=${ this.articleId }`,
        reload: true,
        close: true,
        fromId
      });
    },
    // 文章分享
    shareArticle () {
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
        this.$platform.alert('分享失败，请重新操作')
      }
    }
  },
  computed: {
    height () {
      return this.showOpenFrame ? 'auto' : '100vh';
    }
  }
}
</script>

<style lang="scss">
.document-list-detail {
  background: #fff;

  .detail-top {
    display: flex;
    justify-content: space-between;
    height: 74px;
    padding: 16px 24px 16px 16px;
    border-bottom: 1px solid #E8EFF0;

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
          margin-bottom: 4px;
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
        margin-right: 10px;
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
        margin: 0 20px;
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
    }
  }

  .detail-content {
    padding: 0 100px;

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
      }
    }

    .footer {
      padding: 12px;
      box-shadow:0px 2px 8px 0px rgba(144,171,184,0.5);
      border-radius: 4px;
      font-size: 0;

      .tags {
        display: inline-block;
        vertical-align: top;

        .icon-tags {
          font-size: 16px;
          color: #B0BCC3;
        }

        .detail-tag {
          margin-left: 4px;
          border: none;
          background: #E8EFF0;
          color: #606266;
        }
      }

      .dividing-line {
        display: inline-block;
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
        }

        .annex-right {
          vertical-align: top;
          display: inline-block;

          .annex-item {
            font-size: 14px;
          }
        }
      }
    }
  }
}
</style>