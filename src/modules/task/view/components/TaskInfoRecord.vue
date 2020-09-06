<template>
  <!-- start 工单进度 -->
  <div class="task-info-record">

    <!-- start 时间轴 -->
    <div class="task-timeline" ref="timeline">
      <base-timeline 
        :data="recordPage.list" 
        :record-render="renderRecord" 
        :loading="recordLoading"
        :loadmore="recordPage.hasNextPage"
        @load="loadmore"
      />
    </div>
    <!-- end 时间轴 -->
    
    <!-- start 添加备注 -->
    <div class="customer-quick-comment" v-if="editComment">
      <base-comment ref="comment" placeholder="请输入备注内容" :template-list="remarkTemplateList" :show-customer-action="true" @submit="createRemark" :disabled="commentPending" autofocus/>
    </div>
    <!-- end 添加备注 -->

  </div>
  <!-- end 工单进度 -->
</template>

<script>
/* api */
import * as TaskApi from '@src/api/TaskApi.ts';
/* utils */
import Page from '@model/Page';
import { trimAll } from '@src/util/lang';

export default {
  name: 'task-info-record',
  inject: ['initData'],
  props: {
    shareData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      commentPending: false,
      params: {
        primaryId: this.taskId,
        pageNum: 1,
        pageSize: 15,
      },
      recordLoading: false,
      recordPage: new Page(),
    }
  },
  computed: {
    auth() {
      return this.shareData?.auth || {};
    },
    /** 是否允许操作 */
    allowOperate(){
      return this.task?.isDelete === 0;
    },
    /** 查看单权限 */
    allowTaskView() {
      return this.initData?.canViewTask === true;
    },
    /** 添加备注权限 */
    editComment(){
      return this.allowTaskView && this.allowOperate;
    },
    loginUser(){
      return this.shareData?.loginUser || {};
    },
    task() {
      return this.shareData?.task || {};
    },
    taskId() {
      return this.task?.id;
    },
    taskNo() {
      return this.task?.taskNo;
    },
    remarkTemplateList() {
      return this.initData.remarkList || [];
    }
  },
  methods: {
    /** 
     * @description 创建备注
    */
    async createRemark(form) {
      try{
        this.commentPending = true;

        let params = {
          taskId: this.taskId,
          taskNo: this.taskNo,
          attachments: form.attachments,
          showInOwn: form.showInOwn,
          toCustomer: form.toCustomer,
          cusNotice: form.cusNotice,
          content: {
            updateContent: form.content,
            updateType: 'tRecord'
          }
        }

        let result = await TaskApi.taskRecordCreate(params);
        
        if (result.status == 0) {
          // 清除备注信息
          this.$refs.comment.reset();
          // 初始化备注
          await this.initializeRecord();
          // 滚动到顶部
          this.$nextTick(() => {
            this.$refs.timeline.scrollTop = 0;
          })
        } else {
          this.$platform.alert(result.message)
        }

      } catch(err){
        console.warn(err)
      } finally {
        this.commentPending = false;
      }
    },
    /** 
     * @description 删除备注
    */
    async deleteRemark(record) {
      try {
        if (!await this.$platform.confirm('确认删除该备注吗？')) return;
        const delRes = await this.$http.post('/customer/deleteCustomerRecord', {id: record.id}, false);
        if(delRes.status == 0) this.initializeRecord();
      } catch (e) {
        console.error('deleteMark catch err', e);
      }
    },
    /** 
     * @description 抓取信息动态
    */
    fetchRecord(params){
      return this.$http.get('/customer/cRecord', params);
    },
    /** 
     * @description 初始化信息动态
    */
    async initializeRecord() {
      this.params.pageNum = 1;
      this.searchRecord();
    },
    /** 
     * @description 加载下一页
    */
    async loadmore() {
      try {
        this.params.pageNum++;
        this.recordLoading = true;
        let result = await this.fetchRecord(this.params);
        this.recordLoading = false;
        this.recordPage.merge(result)
      } catch (error) {
        console.error(error)
      }
    },
    renderAddressRecordDom({action, userName, showInOwn, content}) {
      let address = trimAll(content.address);
      let icon = address ? <i class="iconfont icon-address" onClick={e => this.openMap(content)}></i> : '';
      let str = '';

      if (content.type === '设为默认') {
        str = <span>将{icon}{address}设为默认地址</span>;
      } else if (content.type === 'API设为默认') {
        str = <span>通过API应用${content.clientName}将{icon}{address}设为默认地址</span>;
      } else if (content.type === 'API添加') {
        str = <span>通过API应用${content.clientName}添加了地址{icon}{address}</span>;
      } else {
        str = <span>{content.type}了地址{icon}{address}</span>;
      }

      return (
        <h5><strong>{userName}</strong>{str}。</h5>
      )
    },
    renderLinkmanRecordDom({action, userName, showInOwn, content}) {
      let message = '';

      if (content.type === '设为默认') {
        message = `将 ${content.name} 设为默认联系人`;
      } else if (content.type === 'API设为默认') {
        message = `通过API应用${content.clientName}将 ${content.name} 设为默认联系人`;
      } else if (content.type === 'API添加') {
        message = `通过API应用${content.clientName}添加了联系人 ${content.name}`
      } else {
        message = `${content.type}了联系人${content.name}`;
      }

      return <h5><strong>{userName}</strong>{message}。</h5>
    },
    renderProductRecordDom({action, userName, showInOwn, content}) {
      return <h5><strong>{userName}</strong>{ `${content.type}了产品${content.name}`}。</h5>
    },
    renderRecord() {

    },
    async searchRecord() {
      try {
        this.recordLoading = true;
        let result = await this.fetchRecord(this.params);
        this.recordLoading = false;
        this.recordPage.list = [];
        this.recordPage.merge(result)
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>
