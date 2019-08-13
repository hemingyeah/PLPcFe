<template>
  <div class="document-create-view">
    <div class="view-left" :style="{paddingRight: padding}">
      <!-- 顶部文章属性 -->
      <text-title ref="textTitle" v-model="params" class="textTitle"></text-title>
      <!-- 富文本编辑器 -->
      <base-editor v-model="params.article" @input="getInput"></base-editor>
      <!-- 底部提交按钮 -->
      <div class="view-left-footer">
        <button class="base-button green-butn" @click="saveAndSumbit">保存并提交</button>
        <button class="base-button green-butn" @click="toDraftBox">草稿箱</button>
        <button class="base-button red-butn" @click="deleteFile">删除</button>
      </div>
    </div>
    <!-- 更新日志，编辑时显示 -->
    <update-log class="view-right" v-if="isEdit"></update-log>
  </div>
</template>

<script>
import TextTitle from './component/TextTitle.vue'
import UpdateLog from './component/UpdateLog.vue'

export default {
  name: 'document-create-view',
  components: {
    [TextTitle.name]: TextTitle,
    [UpdateLog.name]: UpdateLog
  },
  data () {
    return {
      params: {
        article: '', // 文章内容
        permission: '内部', // 文章权限
        tags: [], // 标签
        form: {}, // 附件
        type: '', // 文章分类
      },
      articleHtml: '',
      isSave: false,
      isEdit: false,
    }
  },
  created () {
    this.getArticle();
    this.saveArticle();
  },
  methods: {
    saveAndSumbit () {
      localStorage.removeItem('document_article');
      // TODO: 保存提交操作
    },
    toDraftBox () {
      localStorage.removeItem('document_article');
      // TODO: 存到草稿箱操作
    },
    deleteFile () {
      localStorage.removeItem('document_article');
      // TODO: 删除文章操作
    },
    getInput (html) {
      this.articleHtml = html
    },
    getArticle () {
      if(this.isEdit) {
        // TODO: 编辑时获取文章信息
      } else {
        let article = localStorage.getItem('document_article');
        if (article) this.params.article = article;
      }
    },
    saveArticle () {
      setInterval(() => {
        if(this.isSave) {
          localStorage.setItem('document_article', this.articleHtml);
        }
        this.isSave = false
      }, 1000 * 60 * 5)
    }
  },
  computed: {
    padding () {
      return this.isEdit ? '40px' : '200px';
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
.document-create-view {
  padding: 10px;
  height: 100vh;

  display: flex;

  .view-left {
    flex: 1;
    height: 100%;
    padding: 50px 40px 100px 150px;
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

      .red-butn {
        background: #F13E47;
      }
    }
  }

  .view-right {
    width: 350px;
    height: 100%;
    background: #fff;

    border-left: 1px solid #C5D9E8;
  }
}
</style>