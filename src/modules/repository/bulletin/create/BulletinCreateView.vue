<template>
  <div class="bulletin-create-view">
    <div class="content">
      <!-- 顶部文章属性 -->
      <text-title ref="textTitle" v-model="params" class="textTitle"></text-title>
      <!-- 富文本编辑器 -->
      <base-editor v-model="params.article"></base-editor>
      <!-- 底部提交按钮 -->
      <div class="view-left-footer">
        <button class="base-button green-butn" @click="saveAndSumbit">保存并提交</button>
        <button class="base-button green-butn" @click="toDraftBox">草稿箱</button>
        <button class="base-button red-butn" @click="deleteFile">删除</button>
      </div>
    </div>
  </div>
</template>

<script>
import TextTitle from './component/TextTitle.vue'

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
      },
    }
  },
  methods: {
    saveAndSumbit () {
      // TODO: 保存提交操作
    },
    toDraftBox () {
      // TODO: 存到草稿箱操作
    },
    deleteFile () {
      // TODO: 删除文章操作
    }
  },
  // watch: {
  //   params: {
  //     handler (n, o) {
  //       console.log(n);
  //     },
  //     deep: true
  //   }
  // }
}
</script>

<style lang="scss">
.bulletin-create-view {
  padding: 10px;
  height: 100vh;


  .content {
    height: 100%;
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

      .red-butn {
        background: #F13E47;
      }
    }
  }
  
}
</style>