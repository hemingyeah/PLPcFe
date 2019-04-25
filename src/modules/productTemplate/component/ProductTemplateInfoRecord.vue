<template>
  <div>
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
  </div>
</template>

<script>
import { trimAll } from '@src/util/lang';
import Page from '@model/Page';
import platform from '@src/platform';

import { getProductTemplateRecord, productTemplateCreateRecord, productTemplateDeleteRecord } from '@src/api/ProductApi.js'

export default {
  name: 'product-template-info-record',
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
        primaryId: this.shareData.productTemplate.id,
        pageNum: 1,
        pageSize: 15,
      },
      recordLoading: false, // loading 状态
      recordPage: new Page(), // 页面数据
    }
  },
  computed: {
    // 权限
    authorities(){
      let user = this.loginUser || {};
      return user.authorities || {};
    },
    /** 是否允许操作 */
    allowOperate(){
      return this.productTemplate.isDelete === 0;
    },
    /** 编辑权限 */
    allowEditCustomer() {
      return this.shareData.allowEditCustomer;
    },
    /** 添加备注权限 */
    editComment(){
      return this.allowEditCustomer && this.allowOperate;
    },
    // 当前用户id
    loginUser(){
      return this.shareData.loginUser;
    },
    // 产品模板数据
    productTemplate() {
      return this.shareData.productTemplate || {}
    }
  },
  mounted() {
    this.initRecord();
    this.$eventBus.$on('customer_info_record.update_record_list', this.searchRecord);
  },
  methods: {
    /** 添加备注 */
    async createRemark(form){
      try{
        this.commentPending = true;
        let params = {
          primaryId: this.productTemplate.id,
          attachments: form.attachments,
          showInOwn: form.showInOwn,
          content: {
            updateContent: form.content,
            updateType: 'ptRecord'
          }
        }

        let result = await productTemplateCreateRecord(params);

        this.$platform.notification({
          title: '添加备注',
          message: result.status == 0 ? '添加备注成功' : result.message,
          type: result.status == 0 ? 'success' : 'error',
        });
        
        if(result.status == 0){
          this.$refs.comment.reset();
          await this.initRecord();

          this.$nextTick(() => {
            this.$refs.timeline.scrollTop = 0;
          })

        }

        this.commentPending = false;
      }catch(e){
        console.error(e)
      }
    },
    /** 删除备注 */
    async deleteRemark(record) {
      try {
        if (!await platform.confirm('您确认删除该备注吗？')) return;

        const result = await productTemplateDeleteRecord({id: record.id});

        this.$platform.notification({
          title: '删除备注备注',
          message: result.status == 0 ? '删除备注成功' : result.message,
          type: result.status == 0 ? 'success' : 'error',
        });

        if(result.status == 0) this.initRecord();

      } catch (e) {
        console.error('product template deleteRemark  err', e);
      }
    },
    /** 抓取信息动态 */
    fetchRecord(params){
      return getProductTemplateRecord(params);
    },
    // 初始化信息动态
    initRecord() {
      this.params.pageNum = 1;
      this.searchRecord();
    },
    // 加载更多
    loadmore() {
      //
    },
    // 查询信息动态
    async searchRecord() {
      try {
        this.recordLoading = true;

        let result = await this.fetchRecord(this.params);

        this.recordLoading = false;
        this.recordPage.list = [];
        this.recordPage.merge(result);
        
      } catch (error) {
        console.error(`searchRecord ${error}`)
      }
    }
  }
}
</script>

<style>

</style>