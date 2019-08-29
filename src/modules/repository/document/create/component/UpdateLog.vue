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
        let info = [];
        for(let i = 0; i < content.updateFields.length; i++) {
          if(i != content.updateFields.length - 1) {
            info.push(<span>{content.updateFields[i]}、</span>)
          } else {
            info.push(<span>{content.updateFields[i]}</span>)
          }
        }

        return [
          <h5 class="main-info">
            <strong>{userName}</strong>编辑了文章
          </h5>,
          <p class="secondary-info">编辑字段：
            {info}
          </p>
        ]
      }

      if(action == '新建') {
        return [
          <h5 class="main-info">
            <strong>{userName}</strong>创建了文章
          </h5>
        ]
      }

      if(action == '审核发起') {
        return [
          <h5 class="main-info">
            <strong>{userName}</strong>发起了审核
          </h5>
        ]
      }

      if(action == '审批成功') {
        return [
          <h5 class="main-info">
            <strong>{userName}</strong>执行审批成功操作
          </h5>
        ]
      }

      if(action == '审批拒绝') {
        return [
          <h5 class="main-info">
            <strong>{userName}</strong>执行审批拒绝操作
          </h5>,
          <p class="secondary-info">拒绝原因：
            {content.reason}
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