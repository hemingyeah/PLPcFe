<template>
  <div class="customer-info-record">
    <div class="customer-timeline" ref="timeline">
      <base-timeline 
        :data="recordPage.list" 
        :record-render="renderRecord" 
        :loading="recordLoading"
        :loadmore="recordPage.hasNextPage"
        @load="loadmore"/>
    </div>
    
    <div class="customer-quick-comment" v-if="editComment">
      <base-comment ref="comment" placeholder="请输入备注内容" @submit="createRemark" :disabled="commentPending" autofocus/>
    </div>
  </div>
</template>

<script>
import {trimAll} from '@src/util/lang';
import Page from '@model/Page';
import platform from '@src/platform';

function createAttachmentDom(h, attachments){
  return attachments && attachments.length > 0 
    ? <div class="base-timeline-attachment base-file__preview">
      {attachments.map(item => <base-file-item file={item} key={item.id} readonly size="small"/>)}
    </div> 
    : ''
}

export default {
  name: "customer-info-record",
  props: {
    shareData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      params: {
        primaryId: this.shareData.customer.id,
        pageNum: 1,
        pageSize: 15,
      },
      recordPage: new Page(),
      recordLoading: false,
      commentPending: false
    }
  },
  computed: {
    customer(){
      return this.shareData.customer || {};
    },
    //客户ID
    customerId() {
      return this.shareData.customer ? this.shareData.customer.id : '';
    },
    //客户姓名
    customerName(){
      return this.shareData.customer ? this.shareData.customer.name : '';
    },
    //当前用户id
    loginUser(){
      return this.shareData.loginUser;
    },
    //权限
    authorities(){
      let user = this.loginUser || {};
      return user.authorities || {};
    },
    /** 是否允许操作 */
    allowOperate(){
      return this.customer.isDelete === 0;
    },
    /** 编辑权限 */
    allowEditCustomer() {
      return this.shareData.allowEditCustomer;
    },
    /** 添加备注权限 */
    editComment(){
      return this.allowEditCustomer && this.allowOperate;
    },
  },
  methods: {
    /** 添加备注 */
    async createRemark(form){
      try{
        this.commentPending = true;
        let params = {
          primaryId: this.customerId,
          primaryName: this.customerName,
          attachments: form.attachments,
          showInOwn: form.showInOwn,
          content: {
            updateContent: form.content,
            updateType: 'ptRecord'
          }
        }

        let result = await this.$http.post('/customer/createRemark', params);
        
        if(result.status == 0){
          this.$refs.comment.reset();
          await this.initializeRecord();
          this.$nextTick(() => {
            this.$refs.timeline.scrollTop = 0;
          })
        }else{
          platform.alert(result.message)
        }

        this.commentPending = false;
      }catch(e){
        console.error(e)
      }
    },
    /** 根据记录的action渲染对应的内容，支持jsx和render函数 */
    renderRecord(h, item){
      let {action, userName, showInOwn, content, attachments} = item;
      
      if(action == '备注'){
        return [
          <h5 class="main-info">
            <strong>{userName}</strong>添加了备注
            {!!showInOwn && (
              <span class="private">
                <i class="iconfont icon-account1"></i>仅自己可见
              </span>
            )}。
            {
              this.allowDeleteRecord(item) &&
              <button type='button' class="btn-text base-timeline-delete" onClick={e => this.deleteRemark(item)}>
                <i class="iconfont icon-shanchu"></i>删除
              </button>
            }
          </h5>,
          content.isDelete == 'true' 
            ? <p class="text-danger">{content.deleteUserName}于{content.deleteTime}删除了该备注。</p> 
            : [<p class="pre-line secondary-info">{content.updateContent}</p>, createAttachmentDom(h,attachments)]
        ]
      }

      if(action == '地址'){
        let address = trimAll(content.address);
        let icon = address ? <i class="iconfont icon-address" onClick={e => this.openMap(content.longitude, content.latitude)}></i> : '';

        return (
          <h5>
            <strong>{userName}</strong>
            {
              content.type == '设为默认' ?
                <span>将{icon}{address}设为默认地址</span> :
                <span>{content.type}了地址{icon}{address}</span>
            }。
          </h5>
        )
      }

      if(action == '联系人'){
        let message = content.type == '设为默认' ? `将${content.name}设为默认联系人` : `${content.type}了联系人${content.name}`;
        return <h5><strong>{userName}</strong>{message}。</h5>
      }

      if(action == '消息提醒'){
        if(content.type == '已发送') return <h5>已发送了消息提醒{content.remindName}给{content.remindTo}。</h5>
        return [
          <h5><strong>{userName}</strong>{content.type}了消息提醒。</h5>,
          content.rule ? <p class="secondary-info">{content.rule}</p> : '',
          <p class="secondary-info">提醒人：{content.remindName}</p>    // /customer/cRecord
        ]
      }

      if(action == '发送短信'){
        if(content.type == '添加'){
          return [
            <h5><strong>{userName}</strong>使用短信模板{content.templateName}向客户发送了短信。</h5>,
            <p class="secondary-info">预计发送时间：{content.sendTime}</p>
          ]
        }

        if(content.type == '已发送'){
          return [
            <h5>已使用短信模板{content.templateName}向客户发送了短信。</h5>,
            <p className="secondary-info">接收人：{content.remindToName}</p>
          ]
        }
      }

      if(action == '批量更新') return <h5><strong>{userName}</strong>通过导入更新了客户。</h5>
  
      return [
        <h5><strong>{userName}</strong>{action}了客户。</h5>,
        content.updateFields ? <p class="secondary-info">修改字段：{content.updateFields}</p> : '',
        createAttachmentDom(h,attachments)
      ];
    },
    openMap(longitude, latitude){
      if(!longitude || !latitude) return;
      
      this.$fast.map.display({longitude, latitude})
        .catch(err => console.error('openMap catch an err: ', err));
    },
    /** 
     * 同时满足以下条件允许删除该记录
     * 1. 该记录没有被删除
     * 2. 客户编辑权限（CUSTOMER_EDIT）值为3 或者 是创建人
     * 3. 该客户没有被删除
     */
    allowDeleteRecord(item){
      let isDelete = item.content.isDelete == 'true';
      let authorities = this.authorities
      let user = this.loginUser;
      let isCreator = item.userId == user.userId;

      return !isDelete && (authorities['CUSTOMER_EDIT'] && authorities['CUSTOMER_EDIT'] == 3 || isCreator) && this.allowOperate;
    },
    /** 初始化信息动态 */
    async initializeRecord() {
      this.params.pageNum = 1;
      this.searchRecord();
    },
    /** 加载下一页 */
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
    /** 抓取信息动态 */
    fetchRecord(params){
      return this.$http.get('/customer/cRecord', params);
    },
    /** 删除备注 */
    async deleteRemark(record) {
      try {
        if (!await this.$platform.confirm('确认删除该备注吗？')) return;
        const delRes = await this.$http.post('/customer/deleteCustomerRecord', {id: record.id}, false);
        if(delRes.status == 0) this.initializeRecord();
      } catch (e) {
        console.error('deleteMark catch err', e);
      }
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
  },
  mounted() {
    this.initializeRecord();
    this.$eventBus.$on('customer_info_record.update_record_list', this.searchRecord);
  },
  beforeDestroy() {
    this.$eventBus.$off('customer_info_record.update_record_list', this.searchRecord);
  }
}
</script>

<style lang="scss">
.customer-info-record {
  
  height: 100%;
  display: flex;
  flex-flow: column nowrap;

  h5 {
    margin-bottom: 5px;
    .icon-address {
      margin-left: 5px;
    }
  }

  .private {
    color: $color-primary;
    .iconfont {
      font-size: 14px;
      margin: 0 6px;
    }
  }

  .secondary-info {
    margin-top: 8px;
  }
}

.customer-timeline{
  padding-top: 15px;
  flex: 1;
  overflow: auto;
  padding-right: 15px;
}

.customer-quick-comment{
  position: sticky;
  padding: 0px;
  z-index: 1;
  background-color: #fff;
  bottom: 0;
  box-shadow: 0 -1px 2px rgba(0,0,0, .095);

  .base-comment{
    border-color: transparent;
  }
}
</style>
