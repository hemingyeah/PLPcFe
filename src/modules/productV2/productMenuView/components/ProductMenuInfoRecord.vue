<template>
  <div class="product-template-info-record">
    <div class="product-template-timeline" ref="timeline">
      <base-timeline
        :data="recordPage.list"
        :record-render="renderRecord"
        :loading="recordLoading"
        :loadmore="recordPage.hasNextPage"
        @load="loadmore"
      />
    </div>

    <div class="product-template-quick-comment" v-if="editComment && 1 == 2">
      <base-comment
        ref="comment"
        placeholder="请输入备注内容"
        @submit="createRemark"
        :disabled="commentPending"
        autofocus
      />
    </div>
  </div>
</template>

<script>
import { trimAll } from '@src/util/lang';
import Page from '@model/Page';
import platform from '@src/platform';

import {
  getProductTemplateRecord,
  productTemplateCreateRecord,
  productTemplateDeleteRecord,
} from '@src/api/ProductApi.js';

import { getMenuRecord } from '@src/api/ProductV2Api.js';
function createAttachmentDom(h, attachments) {
  return attachments && attachments.length > 0 ? (
    <div class="base-timeline-attachment base-file__preview">
      {attachments.map((item) => (
        <base-file-item file={item} key={item.id} readonly size="small" />
      ))}
    </div>
  ) : (
    ''
  );
}

export default {
  name: 'product-menu-info-record',
  props: {
    shareData: {
      type: Object,
      default: () => ({}),
    },
    propData: {
      type: Object,
      defa: () => ({}),
    },
  },
  watch: {
    'propData.id'(newV, oldV) {
      // if (newV) this.initRecord();
    },
  },
  data() {
    return {
      commentPending: false,
      params: {
        pageNum: 1,
        pageSize: 15,
      },
      recordLoading: false, // loading 状态
      recordPage: new Page(), // 页面数据
    };
  },
  computed: {
    // 权限
    authorities() {
      let user = this.loginUser || {};
      return user.authorities || {};
    },
    /** 是否允许操作 */
    allowOperate() {
      return this.productTemplate.isDelete === 0;
    },
    /** 编辑权限 */
    allowEditProduct() {
      return this.shareData.allowEditProduct;
    },
    /** 添加备注权限 */
    editComment() {
      return this.allowEditProduct && this.allowOperate;
    },
    // 当前用户id
    loginUser() {
      return this.shareData.loginUser;
    },
    // 产品模板数据
    productTemplate() {
      return this.shareData.productTemplate || {};
    },
  },
  mounted() {
    // this.initRecord();
    this.$eventBus.$on(
      'customer_info_record.update_record_list',
      this.searchRecord
    );
  },
  methods: {
    /**
     * 同时满足以下条件允许删除该记录
     * 1. 该记录没有被删除
     * 2. 产品编辑权限（PRODUCT_EDIT）值为3 或者 是创建人
     * 3. 该客户没有被删除
     */
    allowDeleteRecord(item) {
      let isDelete = item.content && item.content.isDelete == 'true';
      let authorities = this.authorities;
      let user = this.loginUser;
      let isCreator = item.userId == user.userId;

      return (
        !isDelete
        && ((authorities['PRODUCT_EDIT'] && authorities['PRODUCT_EDIT'] == 3)
          || isCreator)
        && this.allowOperate
      );
    },
    /** 添加备注 */
    async createRemark(form) {
      try {
        this.commentPending = true;
        let params = {
          primaryId: this.productTemplate.id,
          primaryName: this.productTemplate.name,
          attachments: form.attachments,
          showInOwn: form.showInOwn,
          content: {
            updateContent: form.content,
            updateType: 'ptRecord',
          },
        };

        let result = await productTemplateCreateRecord(params);
        const isSucc = result.status == 0;

        this.$platform.notification({
          title: `添加备注${isSucc ? '成功' : '失败'}`,
          message: !isSucc && result.message,
          type: isSucc ? 'success' : 'error',
        });

        if (isSucc) {
          this.$refs.comment.reset();
          this.initRecord();

          this.$nextTick(() => {
            this.$refs.timeline.scrollTop = 0;
          });
        }

        this.commentPending = false;
      } catch (e) {
        console.error(e);
      }
    },
    /** 删除备注 */
    async deleteRemark(record) {
      try {
        if (!(await platform.confirm('您确认删除该备注吗？'))) return;

        const result = await productTemplateDeleteRecord({ id: record.id });
        const isSucc = result.status == 0;

        this.$platform.notification({
          title: `删除备注${isSucc ? '成功' : '失败'}`,
          message: !isSucc && result.message,
          type: isSucc ? 'success' : 'error',
        });

        if (isSucc) this.initRecord();
      } catch (e) {
        console.error('product template deleteRemark  err', e);
      }
    },
    /** 抓取信息动态 */
    fetchRecord(params) {
      return getMenuRecord(params);
    },
    // 初始化信息动态
    initRecord(id) {
      this.params.pageNum = 1;
      if (id) this.params.id = id;
      this.searchRecord();
    },
    // 加载更多
    async loadmore() {
      try {
        this.params.pageNum++;
        this.recordLoading = true;

        let res = await this.fetchRecord(this.params);
        let result = res.result;
        this.recordLoading = false;
        this.recordPage.merge(result);
      } catch (error) {
        console.error(`product template record loadmore err ${error}`);
      }
    },
    /** 根据记录的action渲染对应的内容，支持jsx和render函数 */
    renderRecord(h, item) {
      let {
        action,
        userName,
        showInOwn,
        content,
        attachments,
        primaryName,
      } = item;

      if (action == '备注') {
        return [
          <h5 class="main-info">
            <strong>{userName}</strong> 添加了备注
            {!!showInOwn && (
              <span class="private">
                <i class="iconfont icon-account1" />
                仅自己可见
              </span>
            )}
            。
            {this.allowDeleteRecord(item) && (
              <button
                type="button"
                class="btn-text base-timeline-delete"
                onClick={(e) => this.deleteRemark(item)}
              >
                <i class="iconfont icon-shanchu" />
                删除
              </button>
            )}
          </h5>,
          content.isDelete == 'true' ? (
            <p class="text-danger">
              {content.deleteUserName}于{content.deleteTime} 删除了该备注。
            </p>
          ) : (
            [
              <p class="pre-line secondary-info">{content.updateContent}</p>,
              createAttachmentDom(h, attachments),
            ]
          ),
        ];
      }

      return [
        <h5>
          <strong>{userName}</strong> {action}了 产品目录。
        </h5>,
        content ? (
          content.updateFields ? (
            <p class="secondary-info">修改字段：{content.updateFields}</p>
          ) : (
            ''
          )
        ) : (
          ''
        ),
        createAttachmentDom(h, attachments),
      ];
    },
    // 查询信息动态
    async searchRecord() {
      try {
        this.recordLoading = true;
        let res = await this.fetchRecord(this.params);
        let result = res.result;
        this.recordLoading = false;
        this.recordPage.list = [];
        this.recordPage.merge(result);

        this.$emit('changeRecordCount', result.total);
      } catch (error) {
        console.error(`searchRecord ${error}`);
      }
    },
  },
};
</script>

<style lang="scss">
.product-template-info-record {
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

.product-template-timeline {
  padding-top: 15px;
  padding-right: 15px;

  flex: 1;
  overflow: auto;
}

.product-template-quick-comment {
  position: sticky;
  bottom: 0;
  z-index: 1;

  padding: 0px;

  background-color: #fff;
  box-shadow: 0 -1px 2px rgba(0, 0, 0, 0.095);

  .base-comment {
    border-color: transparent;
  }
}
</style>
