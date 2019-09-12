<template>
  <div class="document-create-view" v-loading.fullscreen.lock="loading">
    <div class="view-left" :style="{paddingRight: padding}">
      <!-- 顶部文章属性 -->
      <text-title ref="textTitle" v-model="params" class="textTitle"></text-title>
      <!-- 富文本编辑器 -->
      <base-editor v-model="params.article" @input="getInput" ref="editor" :isEdit="isEdit || isSaveData"></base-editor>
      <p class="article-error" v-if="articleEmpty">请填写知识库内容！</p>
      <!-- 底部提交按钮 -->
      <div class="view-left-footer">
        <button class="base-button green-butn btn-primary" @click="saveAndSumbit();trackEventHandler('save')" :disabled="!saveCanClick || pending">保存并提交</button>
        <button class="base-button green-butn btn-primary" @click="toDraftBox();trackEventHandler('draft')" :disabled="!draftCanClick || pending">草稿箱</button>
        <button class="base-button white-butn" @click="deleteFile();trackEventHandler('delete')" v-if="isEdit" :disabled="!deleteCanClick || pending">删除</button>
      </div>
    </div>
    <!-- 更新日志，编辑时显示 -->
    <update-log class="view-right" v-if="isEdit" :wikiId="wikiId"></update-log>

    <request-approve @createApprove="createApprove" @reset="reset" ref="requestApproveDialog" />
  </div>
</template>

<script>
import TextTitle from './component/TextTitle.vue'
import UpdateLog from './component/UpdateLog.vue'
import RequestApprove from './component/RequestApprove.vue'
import * as RepositoryApi from '@src/api/Repository'
import _ from 'lodash';

import { Message } from 'element-ui';

export default {
  name: 'document-create-view',
  components: {
    [TextTitle.name]: TextTitle,
    [UpdateLog.name]: UpdateLog,
    [RequestApprove.name]: RequestApprove
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
        title: '',
        article: '', // 文章内容
        permission: '内部', // 文章权限
        permitShare: this.initData.wikiConfig.permitShare,
        label: [], // 标签
        form: {}, // 附件
        typeId: [], // 文章分类
        options: [],
      },
      interval: '',
      articleHtml: null,
      isSave: false,
      isEdit: false,
      isToDraft: false,
      wikiId: null,
      allowShare: false,
      info: {},
      reportApproveStatus: null,
      loading: false,
      articleEmpty: false,
      deleteCanClick: true,
      saveCanClick: true,
      draftCanClick: true,
      pending: false,
      isSaveData: false,
      isUpdate: false
    }
  },
  async created () {
    this.getId();
    let detail = JSON.parse(localStorage.getItem('document_article'));
    if (detail && !this.isEdit) {
      this.isSaveData = true;
      let res = await this.$platform.confirm('上次有尚未保存的内容，是否从上次保存内容开始填写?');
      if(res) {
        this.getArticle();
      } else {
        this.params.article = ' ';
        localStorage.removeItem('document_article');
      }
    }
    if(!this.isEdit) this.saveArticle();
    await this.getTypes();
    if(this.isEdit) this.getArticle();
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
    reset () {
      this.deleteCanClick = true;
      this.saveCanClick = true;
      this.draftCanClick = true;
      this.pending = false;
    },
    setStatus(n) {
      this.reportApproveStatus = n;
    },

    getId () {
      let array = window.location.href.split('?');
      if(array.length <= 1) return;
      let query = array[1].split('&');
      let params = [];
      query.forEach(item => {
        params.push({name: item.split('=')[0],
          value: item.split('=')[1]})
      })

      params.forEach(item => {
        if(item.name == 'wikiId') {
          this.wikiId = item.value;
          this.isEdit = true;
        }
      })
    },
    // 获取分类二级树状结构，每次更新一次
    async getTypes () {
      try {
        this.loading = true;
        let res = await RepositoryApi.getDocumentTypes();
        if(!this.isEdit) {
          this.loading = false;
        }

        if(res.success) {
          res.result.forEach(item => {
            item.value = item.id;
            item.label = item.name;
            item.children = item.subTypes;

            item.children.forEach(childItem => {
              childItem.value = childItem.id;
              childItem.label = childItem.name;
              childItem.count = 0;
            })
          })
          this.params.options = res.result;
          if(this.params.options.length <= 0) {
            this.$platform.notification({
              title: '暂时没有知识库类别，请先到知识库列表添加分类！',
              type: 'error',
            });
            this.saveCanClick = false;
            this.draftCanClick = false;
            this.deleteCanClick = false;
          }
          if(!this.isEdit && this.params.options.length > 0) {
            if(this.params.typeId.length <= 0) this.params.typeId = [this.params.options[0].value]
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

    // 保存并提交，新建、编辑
    async saveAndSumbit () {
      if(!this.paramsCheck()) return;
      this.isToDraft = false;
      this.saveCanClick = false;

      if(this.initData.wikiConfig.needApprove && this.initData.wikiConfig.approvers && this.initData.wikiConfig.approvers.length > 0) {
        this.$refs.requestApproveDialog.open();
        return;
      }

      try {
        let params = this.buildParams();
        this.pending = true;        
        let res = await RepositoryApi.saveAndSumbit(params);
        this.pending = false;

        if(res.success) {
          localStorage.removeItem('document_article');
          this.$platform.notification({
            title: res.message,
            type: 'success',
          });
          this.saveCanClick = true;
          this.openFrame();
        } else {
          this.saveCanClick = true;
          this.$platform.notification({
            title: res.message,
            type: 'error',
          });
        }
      } catch (err) {
        console.error(err)
      }
    },

    // 需要审批时，提交
    async createApprove (remark) {
      if(!this.paramsCheck()) return;
      this.isToDraft = false;
      this.$refs.requestApproveDialog.close();
      this.saveCanClick = false;

      try {
        let otherInfo = this.buildParams();
        let params = {
          objId: this.info.id || null,
          applyRemark: remark,
          source: 'wiki',
          otherInfo
        }
        this.pending = true;          
        let res = await RepositoryApi.createApprove(params);
        this.pending = false;  

        if(res.success) {
          localStorage.removeItem('document_article');
          this.$platform.notification({
            title: res.message,
            type: 'success',
          });
          this.saveCanClick = true;
          this.openFrame();
        } else {
          this.saveCanClick = true;
          this.$platform.notification({
            title: res.message,
            type: 'error',
          });
        }
      } catch (err) {
        console.error(err)
      }
    },

    // 存到草稿箱操作
    async toDraftBox () {
      if(!this.paramsCheck()) return;
      this.isToDraft = true;
      this.draftCanClick = false;

      try {
        let params = this.buildParams();
        this.pending = true;        
        let res = await RepositoryApi.saveDraft(params);
        this.pending = false;

        if(res.success) {
          this.$platform.notification({
            title: '文章已保存至草稿箱。',
            type: 'success',
          });
          localStorage.removeItem('document_article');
          this.draftCanClick = true;
          this.openFrame();
        } else {
          this.draftCanClick = true;
          this.$platform.notification({
            title: res.message,
            type: 'error',
          });
        }
      } catch (err) {
        console.error(err)
      }
    },

    // 文档库或草稿删除操作，所调接口不同
    async deleteFile () {
      try {
        if (!await this.$platform.confirm('确定删除该文章吗？')) return;
        this.deleteCanClick = false;

        let params = {
          wikiId: this.wikiId
        };

        this.pending = true; 
        let res = await RepositoryApi.deleteDocument(params);
        this.pending = false; 

        if(res.success) {
          localStorage.removeItem('document_article');
          this.$platform.notification({
            title: '文章已删除成功。',
            type: 'success',
          });
          this.deleteCanClick = true;
          this.openFrame();
        } else {
          this.deleteCanClick = true;
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
        id: 'M_INFO_DOC',
        title: '知识库列表',
        url: '/wiki',
        reload: true,
        close: true,
        fromId
      });
    },

    getInput (html) {
      this.articleHtml = html;
      let img = this.articleHtml.indexOf('<img') != -1;
      this.articleEmpty = !this.$refs.editor.hasValidText() && !img;
    },

    // 编辑时获取文章信息
    async getArticle () {
      if(this.isEdit) {
        try{
          let params = {
            wikiId: this.wikiId,
            updateReadTimes: false
          }
          let res = await RepositoryApi.getInlineDetail(params);
          this.loading = false;

          if(res.success) {
            let detail = res.result;
            this.params.title = detail.title;
            this.params.permission = detail.allowShare ? '外部' : '内部';
            this.params.label = detail.label;
            this.params.form.attachments = detail.attachment;
            this.params.article = detail.content;
            this.info = detail;
            this.setType(detail.typeId);
          } else {
            this.$platform.notification({
              title: res.message,
              type: 'error',
            });
          }
        } catch(err) {
          console.error(err)
          this.loading = false;
        }
      } else {
        let detail = localStorage.getItem('document_article');
        this.params = Object.assign(this.params, JSON.parse(detail));
        if(!this.params.article) this.params.article = ' ';
      }
    },

    setType (id) {
      this.params.options.forEach(parent => {
        if(parent.value == id) {
          this.params.typeId = [parent.value]
        }

        parent.children.forEach(child => {
          if(child.value == id) {
            this.params.typeId = [parent.value, child.value]
          }
        })
      })
    },

    // 文章暂存操作，每五分钟一次，仅在新建时暂存
    saveArticle () {
      this.interval = setInterval(() => {
        if(this.isSave) {
          let detail = {
            'article': this.params.article,
            'form': this.params.form,
            'permission': this.params.permission,
            'title': this.params.title,
            'typeId': this.params.typeId,
            'label': this.params.label
          }
          localStorage.setItem('document_article', JSON.stringify(detail));
          Message.success({
            message: '文章已暂存',
            type: 'success'
          })
        }
        this.isSave = false
      }, 1000 * 60 * 2)
    },

    // 构建参数
    buildParams () {
      let params = {
        title: this.params.title,
        content: this.params.article,
        typeId: this.params.typeId[1] || this.params.typeId[0],
        label: this.params.label,
        attachment: [],
      }

      // 文档、草稿编辑后存为草稿
      if(this.isEdit && this.isToDraft) {
        params.id = this.info.id;
      }

      // 文档、草稿编辑后提交
      if(this.isEdit && !this.isToDraft) {
        params.id = this.info.id;
      }

      if(this.params.permission == '内部') {
        params.allowShare = 0;
      }

      if(this.params.permission == '外部') {
        params.allowShare = 1;
      }

      if(this.params.form.attachments && this.params.form.attachments.length > 0) {
        params.attachment = this.params.form.attachments;
      }

      return params;
    },

    // 参数校验，标题、内容不允许为空
    paramsCheck () {
      this.$refs.textTitle.titleCheck();
      if(!this.$refs.editor.hasValidText() && this.params.article.indexOf('<img') == -1) {
        this.articleEmpty = true;
      }

      if(!this.$refs.textTitle.titleCheck()) return false;
      if(this.articleEmpty) {
        return false;
      }
      return true;
    },

    // TalkingData事件埋点
    trackEventHandler (type) {
      if (type === 'delete') {
        window.TDAPP.onEvent('pc：知识库编辑-删除事件');
        return;
      }
      if (type === 'save') {
        window.TDAPP.onEvent('pc：知识库-保存并提交事件');
        return;
      }
      if (type === 'draft') {
        window.TDAPP.onEvent('pc：知识库-保存草稿');
        return;
      }
    }
  },
  computed: {
    padding () {
      return this.isEdit ? '40px' : '200px';
    }
  },
  watch: {
    params: {
      handler(n) {
        if(this.isUpdate) {
          this.isSave = true;
        }
      },
      deep: true,
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
    overflow: auto;
    padding: 50px 40px 0 150px;
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

        &:disabled {
          opacity: 0.65 !important;
          cursor: not-allowed;
        }
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
.el-scrollbar {
  min-height: 45px;
}
.popper-class {

  .el-radio__inner {
    margin-top: 10px;
  }
}
</style>