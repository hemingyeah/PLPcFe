<template>
  <div class="document-update-log">
    <div class="title">更新日志</div>

    <div class="document-timeline" ref="timeline">
      <base-timeline 
        :data="recordPage.list" 
        :record-render="renderRecord" 
        :loading="recordLoading"
        :loadmore="recordPage.hasNextPage"
        @load="loadmore"/>
    </div>
  </div>
</template>

<script>
import Page from '@model/Page';
import * as RepositoryApi from '@src/api/Repository'
import * as Lang from '@src/util/lang/index.js';

export default {
  name: 'update-log',
  props: {
    wikiId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      recordPage: new Page(),
      recordLoading: false,
      params: {
        wikiId: this.wikiId,
        pageNum: 1,
        pageSize: 15,
      },
    }
  },
  mounted () {
    this.getRecord();
  },
  methods: {
    // 编辑时获取文章日志
    async getRecord () {
      try{
        let res = await RepositoryApi.getRecord(this.params);

        if(res.success) {
          this.recordPage.list = [];
          this.recordPage.merge(res.result);
          this.recordPage.list.forEach(item => {
            let time = Lang.fmt_gmt_time(item.createTime);
            item.createTime = Lang.formatDate(time, 'YYYY-MM-DD HH:mm:ss');
          })
        } else {
          this.$platform.alert(res.message)
        }
      } catch(err) {
        console.error(err)
      }
    },

    // 加载下一页
    async loadmore() {
      try {
        this.params.pageNum++;
        this.recordLoading = true;
        let res = await RepositoryApi.getRecord(this.params);
        if(res.success) {
          this.recordLoading = false;
          this.recordPage.merge(res.result);
          this.recordPage.list.forEach(item => {
            let time = Lang.fmt_gmt_time(item.createTime);
            item.createTime = Lang.formatDate(time, 'YYYY-MM-DD HH:mm:ss');
          })
        } else {
          this.$platform.alert(res.message)
        }
      } catch (error) {
        console.error(error)
      }
    },
    
    /** 根据记录的action渲染对应的内容，支持jsx和render函数 */
    renderRecord (h, item) {
      let {action, userName, content} = item;

      if(action == '编辑') {
        return [
          <h5 class="main-info">
            <strong>{userName}</strong> 执行编辑操作
          </h5>
        ]
      }

      if(action == '新建') {
        return [
          <h5 class="main-info">
            <strong>{userName}</strong> 执行新建操作
          </h5>
        ]
      }

      if(action == '审批发起') {
        return [
          <h5 class="main-info">
            <strong>{userName}</strong> 发起了{content.action}的审批
          </h5>,
          // <p class="secondary-info">审批备注：
          //   {content.remark}
          // </p>
        ]
      }

      if(action == '审批成功') {
        return [
          <h5 class="main-info">
            <strong>{userName}</strong> 审核<span style="color: #00AC97">通过</span>
          </h5>
        ]
      }

      if(action == '审批拒绝') {
        return [
          <h5 class="main-info">
            <strong>{userName}</strong> 审核<span style="color: #F13E47">拒绝</span>
          </h5>,
          <p class="secondary-info" style="color: #F13E47">拒绝原因：
            {content.remark}
          </p>
        ]
      }

    }
  }
}
</script>

<style lang="scss">
.document-update-log {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  .title {
    height: 45px;
    line-height: 45px;

    font-size: 16px;

    padding-left: 15px;
    border-bottom: 1px solid #D8E5EE;
  }

  .document-timeline {
    flex: 1;
    overflow: auto;
    padding: 15px 15px 0 0;
  }
}
</style>