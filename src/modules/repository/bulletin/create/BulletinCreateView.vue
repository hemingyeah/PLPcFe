<template>
  <div class="bulletin-create-view" v-loading.fullscreen.lock="loading">
    <div class="content">
      <!-- 顶部文章属性 -->
      <text-title ref="textTitle" v-model="params" class="textTitle"></text-title>
      <!-- 富文本编辑器 -->
      <base-editor v-model="params.article" @input="getInput"></base-editor>
      <!-- 底部提交按钮 -->
      <div class="view-left-footer">
        <button class="base-button green-butn" @click="sumbit">发布</button>
        <button class="base-button white-butn" @click="deleteFile" v-if="isEdit">删除</button>
      </div>
    </div>

  </div>
</template>

<script>
import TextTitle from './component/TextTitle.vue'

import { Message } from 'element-ui';

import * as RepositoryApi from '@src/api/Repository'
import http from '@src/util/http';

export default {
  name: 'document-create-view',
  components: {
    [TextTitle.name]: TextTitle,
  },
  data () {
    return {
      params: {
        title: '', // 文章标题
        article: '', // 文章内容
        form: {}, // 附件
        typeId: null, // 文章分类
        options: [],
        selectedUsers: [], // 选择的人员
        selectedDepts: [], // 选择的部门
        deptPerson: 0
      },
      articleHtml: '',
      isSave: false,
      isEdit: false,
      interval: '',
      showAlert: true,
      noticeId: null,
      info: {},
      loading: false
    }
  },
  mounted () {
    this.getArticle();
    this.saveArticle();
    this.getTypes();
  },
  beforeDestroy() {
    // 清除定时器
    clearInterval(this.interval);
  },
  methods: {
    // 获取分类一级树状结构，每次更新一次
    async getTypes () {
      try {
        this.loading = true;
        let res = await RepositoryApi.getBulletinTypes();
        this.loading = false;

        if(res.success) {
          res.result.forEach(item => {
            item.count = 0;
          })

          this.params.options = res.result;
          if(this.params.options.length > 0) {
            this.params.typeId = this.params.options[0].id;
          }
        } else {
          this.$platform.alert(res.message);
        }
      } catch (err) {
        console.error(err);
        this.loading = false;
      }
    },

    // 新建、编辑文章提交操作
    async sumbit () {
      let result = await this.paramsCheck()
      if(!result) return;
      if(this.params.deptPerson <= 0 && this.params.selectedUsers.length <= 0) {
        let result = await this.$platform.confirm('您选择的通知范围不包含任何人，将不会发出通知，是否继续！');
        if(!result) return;
      }

      try {
        let params = this.buildParams();
        let res = await RepositoryApi.createBulletin(params);

        if(res.success) {
          localStorage.removeItem('bulletin_article');
          this.$platform.alert('文章已发布成功。');
          this.openFrame();
        } else {
          this.$platform.alert(res.message);
        }
      } catch (err) {
        console.error(err)
      }
    },

    // 删除文章
    async deleteFile () {
      try {
        if (!await this.$platform.confirm('确定删除该文章吗？')) return;
        let params = {
          noticeId: this.noticeId
        }
        let res = await RepositoryApi.deleteBulletin(params);
        if(res.success) {
          this.$platform.alert('文章删除成功');
          localStorage.removeItem('bulletin_article');
          this.openFrame();
        } else {
          this.$platform.alert(res.message);
        }
      } catch (e) {
        console.error(e);
      }
    },

    openFrame () {
      let id = window.frameElement.dataset.id;
      this.$platform.closeTab(id);

      let fromId = window.frameElement.getAttribute('id');
      
      this.$platform.openTab({
        id: 'M_INFO_NOTICE',
        title: '通知公告',
        url: '/info/notice/list/page',
        reload: true,
        close: true,
        fromId
      });
    },

    // 获取带格式的文章内容
    getInput (html) {
      this.articleHtml = html
    },

    // 获取缓存的文章信息
    getArticle () {
      let article = localStorage.getItem('bulletin_article');
      if (article) this.params.article = article;
    },

    // 本地缓存文章内容，5分钟一次
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
    },

    // 参数校验，标题、内容不允许为空
    async paramsCheck () {
      if(!this.params.title) {
        this.$platform.alert('请填写通知公告标题！');
        return false;
      }
      if(this.params.title.length > 100) {
        this.$platform.alert('标题不能超过100字！');
        return false;
      }
      if(!this.params.article) {
        this.$platform.alert('请填写通知公告内容！');
        return false;
      }
      if(this.params.selectedUsers.length <= 0 && this.params.selectedDepts.length <= 0) {
        this.$platform.alert('请选择通知范围！');
        return false;
      }
      
      return true;
    },

    async deftCheck () {
      if(this.params.selectedDepts.length > 0) {
        let num = 0;
        this.params.selectedDepts.forEach(async item => {
          let params = {
            deptId: item.id,
            pageNum: 1,
            pageSize: 50,
            sellAllOrg: false,
            keyword: '',
          }
          let res = await http.get('/security/department/user', params);
          num = res.list.length + num;
        })
      }
    },

    // 构建参数
    buildParams () {
      let params = {
        title: this.params.title,
        content: this.params.article,
        typeId: this.params.typeId,
        attachment: [],
      }

      if(this.isEdit) {
        params.id = this.noticeId;
      }

      if(this.params.selectedUsers.length > 0) {
        let arr = [];
        this.params.selectedUsers.forEach(item => {
          arr.push(item.userId)
        })
        params.openIds = arr.join();
      }

      if(this.params.selectedDepts.length > 0) {
        let arr = [];
        this.params.selectedDepts.forEach(item => {
          let array = item.id.split('_');
          let id = array[array.length - 1]
          arr.push(id);
        })
        params.dingIds = arr.join();
      }

      if(this.params.form.attachments && this.params.form.attachments.length > 0) {
        params.attachment = this.params.form.attachments;
      }

      if(this.params.typeId) {
        this.params.options.forEach(item => {
          if(item.id == this.params.typeId) {
            params.type = item.name;
          }
        })
      }

      return params;
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
    padding: 50px 40px 0 150px;
    background: #fff;

    .textTitle {
      padding-bottom: 10px;
    }

    .view-left-footer {
      display: flex;
      margin-top: 25px;
      margin-bottom: 100px;

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