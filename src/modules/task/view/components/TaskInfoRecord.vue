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

function createAttachmentDom(h, attachments){
  return attachments && attachments.length > 0 
    ? <div class="base-timeline-attachment base-file__preview">
      {attachments.map(item => <base-file-item file={item} key={item.id} readonly size="small"/>)}
    </div> 
    : ''
}

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
        taskId: this.taskId,
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
    // 权限
    authorities(){
      let user = this.loginUser || {};
      return user.authorities || {};
    },
    allTaskEdit() {
      return this.authorities['TASK_EDIT'] === 3;
    },
    /** 是否允许操作 */
    allowOperate(){
      return this.task?.isDelete === 0;
    },
    /** 
     * 同时满足以下条件允许删除该记录
     * 1. 该记录没有被删除
     * 2. 工单编辑权限（CUSTOMER_EDIT）值为3 或者 是创建人
     * 3. 该工单没有被删除
     */
    allowDeleteRecord(item){
      let isDelete = item.content.isDelete == 'true'
      let user = this.loginUser
      let isCreator = item.userId == user.userId

      return !isDelete && (this.allTaskEdit || isCreator) && this.allowOperate;
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
      return this.initData?.loginUser || {};
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
  mounted() {
    this.initializeRecord();
    this.$eventBus.$on('customer_info_record.update_record_list', this.searchRecord);
  },
  beforeDestroy() {
    this.$eventBus.$off('customer_info_record.update_record_list', this.searchRecord);
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
          attachments: form.attachments,
          showInOwn: form.showInOwn,
          toCustomer: form.toCustomer,
          cusNotice: form.cusNotice,
          content: form.content
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
        const delRes = await TaskApi.taskRecordDelete({ id: record.id });

        if(delRes.status == 0) this.initializeRecord();

      } catch (e) {
        console.warn('task deleteRemark -> error', e);
      }
    },
    /** 
     * @description 抓取信息动态
    */
    fetchRecord(params){
      params.taskId = this.taskId;
      params.userId = this.loginUser.userId;
      return TaskApi.taskRecordList(params).then(data => {
        let { list = [] } = data?.result;
        list.forEach(record => {
          try {
            record.attachments = JSON.parse(record.attachments);
          } catch (error) {
            console.warn('searchRecord recordPage.list.forEach -> error', error)
          }
        })

        return data;
      })
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

        let data = await this.fetchRecord(this.params);

        this.recordLoading = false
        this.recordPage.merge(data.result)

      } catch (error) {
        console.warn('loadmore -> error', error)
      }
    },
    recordPageListConvertHandler(list = []) {
      list.forEach(record => {
        try {
          record.attachments = JSON.parse(record.attachments);
        } catch (error) {
          console.warn('searchRecord  recordPage.list.forEach -> error', error)
        }
      })
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
    /* 渲染指派转派 */
    renderAllot(record = {}) {
      let { action, userName, content, attachments, taskNo, executorName } = record;
      return (
        <h5><strong>{userName}</strong>{ `把工单 &nbsp;&nbsp #${taskNo} &nbsp;&nbsp ${action} 给&nbsp;&nbsp; ${executorName} "&nbsp;&nbsp;`}。</h5>
      )
    },
    /* 渲染添加备注 */
    renderActionRemark(record = {}) {
      let { userName, showInOwn, toCustomer, cusNotice, content, attachments } = record;
      return [
        <h5 class="main-info">
          <strong>{ userName }</strong>添加了备注
          {!!showInOwn && (
            <span class="private">
              <i class="iconfont icon-account1"></i>仅自己可见
            </span>
          )}。
          {!!toCustomer && (
            <span class="">
                "(客户可见)"
            </span>
          )}
          {!!cusNotice && (
            <span class="">
                "(短信通知客户)"
            </span>
          )}
          {
            this.allowDeleteRecord(record) 
              && <button type='button' class="btn-text base-timeline-delete" onClick={e => this.deleteRemark(record)}>
                <i class="iconfont icon-shanchu"></i>删除
              </button>
          }
        </h5>,
        content.isDelete == 'true'
          ? <p class="text-danger">{content.deleteUserName}于{content.deleteTime}删除了该备注。</p> 
          : [<p class="pre-line secondary-info">{content.updateContent}</p>, createAttachmentDom(h, attachments)]
      ]
    },
    /* 渲染api新建 */
    renderApiCreate(record = {}) {
      let { userName, content, taskNo } = record;
      return [
        <h5><strong>{ userName }</strong>{` 通过API应用${content.clientName} 新建了工单  ${ taskNo }`}</h5>,
      ]
    },
    /* 渲染电话日志 */
    renderPhoneLog(record = {}) {
      let { userName, content } = record;
      return <h5><strong>{ userName }</strong>拨打了<strong>{ content.targetName }</strong>的电话。</h5>
    },
    /** 根据记录的action渲染对应的内容，支持jsx和render函数 */
    renderRecord(h, record) {
      let {action, userName, content, attachments, primaryName} = record;

      try {
        content = JSON.parse(content);
      } catch (error) {
        content = {
          updateContent: content
        }
      }
      
      if (action == '指派' || action == '转派') return this.renderPhoneLog(record)
      if (action == '备注') return this.renderActionRemark(record)
      if (action === 'API新建') return this.renderApiCreate(record)
      if (action == '电话日志') return this.renderPhoneLog(record)

      if (/工单/.test(action)) {
        const str = ` ${record.action.indexOf('新建工单') > -1 ? record.action.indexOf('API') > -1 ? 'API新建' : '新建' : '完成' } 了一个该客户的工单 #${content.taskNo}，工单类型为【${content.taskType}】。`;
        return <h5><strong>{userName}</strong>{str}</h5>
      }

      if (/事件/.test(action)) {
        const str = ` ${record.action.indexOf('新建事件') > -1 ? record.action.indexOf('API') > -1 ? 'API新建' : '新建' : '完成' } 了一个该客户的事件 #${content.eventNo}， 事件类型为【${content.taskType}】。`;
        return <h5><strong>{userName}</strong>{str}</h5>
      }

      return [
        <h5><strong>{userName}</strong>{action}了客户。</h5>,
        content.updateFields ? <p class="secondary-info">修改字段：{content.updateFields}</p> : '',
        createAttachmentDom(h, attachments)
      ];
    },
    async searchRecord() {
      try {
        this.recordLoading = true;

        let data = await this.fetchRecord(this.params);

        this.recordLoading = false;
        this.recordPage.list = [];
        this.recordPage.merge(data.result)

      } catch (error) {
        console.warn('searchRecord -> error', error)
      }
    }
  }
}
</script>
