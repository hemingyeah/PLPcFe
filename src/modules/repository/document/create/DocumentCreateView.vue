<template>
  <div class="document-create-view">
    <div class="view-left">
      <!-- 顶部文章属性 -->
      <text-title ref="textTitle" @buildParams="buildParams"></text-title>

      <div class="view-left-footer">
        <button class="base-button green-butn" @click="saveAndSumbit">保存并提交</button>
        <button class="base-button green-butn" @click="toDraftBox">草稿箱</button>
        <button class="base-button red-butn" @click="deleteFile">删除</button>
      </div>
    </div>
    <update-log class="view-right"></update-log>
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

      }
    }
  },
  methods: {
    saveAndSumbit () {
      this.$refs.textTitle.buildParams();
    },
    toDraftBox () {
      this.$refs.textTitle.buildParams();
    },
    deleteFile () {

    },
    buildParams (params) {
      Object.assign(this.params, params);
      console.log(this.params);
    }
  }
}
</script>

<style lang="scss">
.document-create-view {
  padding: 10px;
  // background: #fff;
  height: 100vh;

  display: flex;

  .view-left {
    flex: 1;
    height: 100%;
    padding: 50px 40px 100px 150px;
    background: #fff;

    border-right: 1px solid #C5D9E8;

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
  }
}
</style>