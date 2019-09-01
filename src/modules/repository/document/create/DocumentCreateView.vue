<template>
  <div class="document-create-view">
    <div class="view-left" :style="{paddingRight: padding}">
      <!-- 顶部文章属性 -->
      <text-title ref="textTitle" v-model="params" class="textTitle"></text-title>
      <!-- 富文本编辑器 -->
      <base-editor v-model="params.article" @input="getInput" ref="editor" :isEdit="isEdit"></base-editor>
      <!-- 底部提交按钮 -->
      <div class="view-left-footer">
        <button class="base-button green-butn" @click="saveAndSumbit">保存并提交</button>
        <button class="base-button green-butn" @click="toDraftBox">草稿箱</button>
        <button class="base-button white-butn" @click="deleteFile" v-if="isEdit">删除</button>
      </div>
    </div>
    <!-- 更新日志，编辑时显示 -->
    <update-log class="view-right" v-if="isEdit" :wikiId="wikiId"></update-log>

    <request-approve @createApprove="createApprove" ref="requestApproveDialog" />
  </div>
</template>

<script>
import TextTitle from './component/TextTitle.vue'
import UpdateLog from './component/UpdateLog.vue'
import RequestApprove from './component/RequestApprove.vue'
import * as RepositoryApi from '@src/api/Repository'

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
        article: '', // 文章内容
        permission: '内部', // 文章权限
        permitShare: this.initData.wikiConfig.permitShare,
        label: [], // 标签
        form: {}, // 附件
        typeId: [], // 文章分类
        options: []
      },
      articleHtml: '',
      isSave: false,
      isEdit: false,
      isToDraft: false,
      wikiId: null,
      allowShare: false,
      info: {},
      reportApproveStatus: null,
    }
  },
  async created () {
    if(!this.isEdit) {
      this.saveArticle();
      this.getArticle();
    }
    this.getId();
    await this.getTypes();
    if(this.isEdit) this.getArticle();
  },
  methods: {
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
        let res = await RepositoryApi.getDocumentTypes();
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
            item.children.unshift({
              label: '全部',
              value: item.id
            })
          })
          this.params.options = res.result;
          if(!this.isEdit) this.setType(this.params.options[0].children[0].value)
        } else {
          this.$platform.alert(res.message);
        }
      } catch (err) {
        console.error(err);
      }
    },

    // 保存并提交，新建、编辑调不同的接口
    async saveAndSumbit () {
      if(!this.paramsCheck()) return;
      this.isToDraft = false;

      if(this.initData.wikiConfig.needApprove) {
        this.$refs.requestApproveDialog.open();
        return;
      }

      try {
        let params = this.buildParams();        
        let res = await RepositoryApi.saveAndSumbit(params);

        if(res.success) {
          localStorage.removeItem('document_article');
          this.$platform.alert(res.message);
          this.openFrame();
          // // 开启审核功能时
          // this.$platform.alert('文章已提交成功，请等待审核。')
          // // 关闭审核功能时
          // this.$platform.alert('文章已发布成功。')
        } else {
          this.$platform.alert(res.message);
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

      try {
        let otherInfo = this.buildParams();
        let params = {
          objId: this.info.id || null,
          applyRemark: remark,
          source: 'wiki',
          otherInfo
        }        
        let res = await RepositoryApi.createApprove(params);

        if(res.success) {
          localStorage.removeItem('document_article');
          this.$platform.alert(res.message);
          this.openFrame();
          // // 开启审核功能时
          // this.$platform.alert('文章已提交成功，请等待审核。')
          // // 关闭审核功能时
          // this.$platform.alert('文章已发布成功。')
        } else {
          this.$platform.alert(res.message);
        }
      } catch (err) {
        console.error(err)
      }
    },

    // 存到草稿箱操作
    async toDraftBox () {
      if(!this.paramsCheck()) return;
      this.isToDraft = true;

      try {
        let params = this.buildParams();        
        let res = await RepositoryApi.saveDraft(params);

        if(res.success) {
          this.$platform.alert('文章已保存至草稿箱。')
          localStorage.removeItem('document_article');
          this.openFrame();
        } else {
          this.$platform.alert(res.message);
        }
      } catch (err) {
        console.error(err)
      }
    },

    // 文档库或草稿删除操作，所调接口不同
    async deleteFile () {
      try {
        if (!await this.$platform.confirm('确定删除该文章吗？')) return;
        
        let params = {
          wikiId: this.wikiId
        };

        let res = await RepositoryApi.deleteDocument(params);

        if(res.success) {
          localStorage.removeItem('document_article');
          this.$platform.alert('文章已删除成功。')
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
        id: 'M_INFO_DOC',
        title: '文档库',
        url: '/wiki/list/page',
        reload: true,
        close: true,
        fromId
      });
    },

    getInput (html) {
      this.articleHtml = html
    },

    // 编辑时获取文章信息
    async getArticle () {
      if(this.isEdit) {
        try{
          let params = {
            wikiId: this.wikiId
          }
          let fn = this.allowShare ? RepositoryApi.getPublicDetail : RepositoryApi.getInlineDetail;
          let res = await fn(params);

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
            this.$platform.alert(res.message)
          }
        } catch(err) {
          console.error(err)
        }
      } else {
        let article = localStorage.getItem('document_article');
        if (article) this.params.article = article;
      }
    },

    setType (id) {
      this.params.options.forEach(parent => {
        parent.children.forEach(child => {
          if(child.value == id) {
            this.params.typeId = [parent.value, child.value]
          }
        })
      })
    },

    // 文章暂存操作，每五分钟一次，仅在新建时暂存
    saveArticle () {
      setInterval(() => {
        if(this.isSave) {
          localStorage.setItem('document_article', this.articleHtml);
          Message.success({
            message: '文章已暂存',
            type: 'success'
          })
        }
        this.isSave = false
      }, 1000 * 6)
    },

    // 构建参数
    buildParams () {
      let params = {
        title: this.params.title,
        content: this.params.article,
        typeId: this.params.typeId[1],
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
      if(!this.params.title) {
        this.$platform.alert('请填写通知公告标题！');
        return false;
      }
      if(!this.params.article) {
        this.$platform.alert('请填写通知公告内容！');
        return false;
      }
      return true;
    },
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
    overflow: auto;
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

  .view-right {
    width: 350px;
    height: 100%;
    background: #fff;

    border-left: 1px solid #C5D9E8;
  }
}
</style>