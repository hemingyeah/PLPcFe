<template>
  <div class="bulletin-create-view">
    <div class="content">
      <!-- 顶部文章属性 -->
      <text-title ref="textTitle" v-model="params" class="textTitle"></text-title>
      <!-- 富文本编辑器 -->
      <base-editor v-model="params.article" @input="getInput"></base-editor>
      <!-- 底部提交按钮 -->
      <div class="view-left-footer">
        <button class="base-button green-butn" @click="sumbit">发布</button>
        <button class="base-button white-butn" @click="deleteFile">删除</button>
      </div>
    </div>

  </div>
</template>

<script>
import TextTitle from './component/TextTitle.vue'

import { Message } from 'element-ui';

export default {
  name: 'document-create-view',
  components: {
    [TextTitle.name]: TextTitle,
  },
  data () {
    return {
      params: {
        article: '', // 文章内容
        form: {}, // 附件
        type: '', // 文章分类
        tags: [],
        selected: []
      },
      articleHtml: '',
      isSave: false,
      isEdit: false,
      interval: '',
      showAlert: true,
    }
  },
  created () {
    this.getArticle();
    this.saveArticle();
  },
  beforeDestroy() {
    //清除定时器
    clearInterval(this.interval);
  },
  methods: {
    sumbit () {
      localStorage.removeItem('bulletin_article');
      // TODO: 保存提交操作
      this.$platform.alert('文章已发布成功。')
    },

    async deleteFile () {
      try {
        if (!await this.$platform.confirm('确定删除该文章吗？')) return;
        // const result = await this.$http.get(`/customer/delete/${this.customer.id}`);
        // if (!result.status) {
        //   let fromId = window.frameElement.getAttribute('fromid');
        //   this.$platform.refreshTab(fromId);

        //   window.location.reload();
        // }
      } catch (e) {
        console.error(e);
      }
      localStorage.removeItem('bulletin_article');
      // TODO: 删除文章操作
    },

    getInput (html) {
      this.articleHtml = html
    },

    getArticle () {
      if(this.isEdit) {
        // TODO: 编辑时获取文章信息
      } else {
        let article = localStorage.getItem('bulletin_article');
        if (article) this.params.article = article;
      }
    },

    saveArticle () {
      this.interval = setInterval(() => {
        if(this.isSave) {
          localStorage.setItem('bulletin_article', this.articleHtml);
          Message.success({
            message: '文章已暂存',
            type: 'success'
          })
        }
        this.isSave = false
      }, 1000 * 60 * 5)
    }
  },
  watch: {
    articleHtml(n) {
      this.isSave = true;
    }
  }
}
</script>

<style lang="scss">
.bulletin-create-view {
  padding: 10px;
  height: 100vh;


  .content {
    height: 100%;
    overflow: auto;
    padding: 50px 200px 100px 150px;
    background: #fff;

    .textTitle {
      padding-bottom: 10px;
    }

    .view-left-footer {
      display: flex;
      margin-top: 25px;

      .green-butn {
        margin-right: 15px;
      }

      .white-butn {
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
  
}
</style>