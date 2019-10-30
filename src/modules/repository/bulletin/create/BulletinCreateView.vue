<template>
  <div class="bulletin-create-view" v-loading.fullscreen.lock="loading">
    <div class="content">
      <!-- 顶部文章属性 -->
      <text-title ref="textTitle" v-model="params" class="textTitle"></text-title>
      <!-- 富文本编辑器 -->
      <base-editor v-model="params.article" @input="getInput" ref="editor" :isEdit="isSaveData"></base-editor>
      <p class="article-error" v-if="articleEmpty">请填写信息公告内容！</p>
      <!-- 底部提交按钮 -->
      <div class="view-left-footer">
        <button class="base-button green-butn btn-primary" @click="sumbit();trackEventHandler('sumbit')" :disabled="sumbtting || pending">发布</button>
      </div>
    </div>

  </div>
</template>

<script>
import TextTitle from './component/TextTitle.vue'

import { Message } from 'shb-element-ui';

import * as RepositoryApi from '@src/api/Repository'
import http from '@src/util/http';
import _ from 'lodash';

export default {
  name: 'document-create-view',
  components: {
    [TextTitle.name]: TextTitle,
  },
  props: {
    initData: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      params: {
        title: '', // 文章标题
        rule: true,
        article: '', // 文章内容
        form: {
          content: '',
          attachments: [],
          showInOwn: 0
        }, // 附件
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
      loading: false,
      articleEmpty: false,
      sumbtting: false,
      pending: false,
      isSaveData: false
    }
  },
  async created () {
    let detail = JSON.parse(localStorage.getItem(`bulletin_article_${ this.initData.userInfo.userId }`));
    if (detail) {
      this.isSaveData = true;
      let res = await this.$platform.confirm('上次有尚未保存的内容，是否从上次保存内容开始填写?');
      if(res) {
        this.getArticle();
      } else {
        this.params.article = ' ';
        localStorage.removeItem(`bulletin_article_${ this.initData.userInfo.userId }`);
      }
    }
    this.saveArticle();
    this.getTypes();
  },

  beforeDestroy() {
    // 清除定时器
    clearInterval(this.interval);
  },

  updated: _.debounce(function () {
    this.$nextTick(() => {
      this.isUpdate = true;
    }) 
  }, 1000),

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
          if(this.params.options.length <= 0) {
            this.$platform.notification({
              title: '暂时没有信息公告类别，请先到信息公告列表添加分类！',
              type: 'error',
            });
            this.sumbtting = true;
          }
          if(this.params.options.length > 0) {
            this.params.typeId = this.params.typeId || this.params.options[0].id;
          }
        } else {
          this.$platform.notification({
            title: res.message,
            type: 'error',
          });
        }
      } catch (err) {
        console.error(err);
        this.loading = false;
      }
    },

    // 新建文章提交操作
    async sumbit () {
      let result = await this.paramsCheck()
      if(!result) return;
      if(this.params.deptPerson <= 0 && this.params.selectedUsers.length <= 0) {
        let result = await this.$platform.confirm('您选择的通知范围不包含任何人，将不会发出通知，是否继续！');
        if(!result) return;
      }
      this.sumbtting = true;

      try {
        let params = this.buildParams();
        this.pending = true; 
        let res = await RepositoryApi.createBulletin(params);
        this.pending = false; 

        if(res.success) {
          localStorage.removeItem(`bulletin_article_${ this.initData.userInfo.userId }`);
          this.$platform.notification({
            title: '文章已发布成功。',
            type: 'success',
          });
          this.sumbtting = false;
          this.openFrame();
        } else {
          this.sumbtting = false;
          this.$platform.notification({
            title: res.message,
            type: 'error',
          });
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
          this.$platform.notification({
            title: '文章删除成功.',
            type: 'success',
          });
          localStorage.removeItem(`bulletin_article_${ this.initData.userInfo.userId }`);
          this.openFrame();
        } else {
          this.$platform.notification({
            title: res.message,
            type: 'error',
          });
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
        title: '信息公告列表',
        url: '/info/notice',
        reload: true,
        close: true,
        fromId
      });
    },

    // 获取带格式的文章内容
    getInput (html) {
      this.articleHtml = html;
      let imgCount = this.imgCount(html);
      this.articleEmpty = !this.$refs.editor.hasValidText() && !imgCount;
      if(imgCount > 20) {
        this.$platform.notification({
          title: '单个信息公告文章最大支持15000字和20张图片',
          type: 'error',
        });
        return false;
      }
      return true;
    },

    imgCount (html) {
      if(!html) return null;
      let imgReg = /<img.*?(?:>|\/>)/gi // 匹配图片中的img标签
      let arr = html.match(imgReg)  //筛选出所有的img
      return (arr && arr.length) || null;
    },

    // 获取缓存的文章信息
    getArticle () {
      let detail = localStorage.getItem(`bulletin_article_${ this.initData.userInfo.userId }`);
      this.params = Object.assign(this.params, JSON.parse(detail));
      if(!this.params.article) this.params.article = ' ';
    },

    // 本地缓存文章内容，2分钟一次
    saveArticle () {
      this.interval && clearInterval(this.interval);
      this.interval = setTimeout(() => {
        if(this.isSave) {
          let detail = {
            'article': this.params.article,
            'form': this.params.form,
            'selectedDepts': this.params.selectedDepts,
            'selectedUsers': this.params.selectedUsers,
            'title': this.params.title,
            'typeId': this.params.typeId
          }
          localStorage.setItem(`bulletin_article_${ this.initData.userInfo.userId }`, JSON.stringify(detail));
          Message.success({
            message: '文章已暂存',
            type: 'success'
          })
        }
        this.isSave = false;
      }, 1000 * 60 * 2)
    },

    // 参数校验，标题、内容不允许为空
    async paramsCheck () {
      this.$refs.textTitle.titleCheck();
      this.$refs.textTitle.rangeCheck();
      if(!this.$refs.editor.hasValidText() && this.params.article.indexOf('<img') == -1) {
        this.articleEmpty = true;
      }
      if(!this.$refs.textTitle.titleCheck()) {
        return false;
      }
      if(!this.$refs.textTitle.rangeCheck()) {
        return false;
      }
      if(this.articleEmpty) {
        return false;
      }
      if(!this.getInput(this.params.article)) return false;
      
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
    },

    // TalkingData事件埋点
    trackEventHandler (type) {
      if (type === 'sumbit') {
        window.TDAPP.onEvent('pc：信息公告-发布事件');
        return;
      }
    }
  },
  watch: {
    params: {
      handler(n) {
        if(this.isUpdate) {
          this.isSave = true;
          this.saveArticle();
        }
      },
      deep: true,
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
    padding: 50px 200px 0 150px;
    background: #fff;

    .textTitle {
      padding-bottom: 10px;
    }

    .article-error {
      color: #f56c6c;
      font-size: 12px;
      line-height: 12px;
      margin: 0;
      padding-top: 5px;
    }

    .view-left-footer {
      display: flex;
      margin-top: 25px;
      margin-bottom: 100px;

      .green-butn {
        margin-right: 15px;

        &:disabled {
          cursor: not-allowed;
        }
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