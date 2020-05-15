<template>
  <base-modal title="审批" :show.sync="visible" width="600px" class="approve-performance-modal" @closed="reset">

    <ul class="approve-info">
      <li>
        <label>编号：</label> {{approveData.objNo}}
      </li>
      <li>
        <label>来源：</label> 知识库
      </li>
      <li>
        <label>分类：</label> {{approveData.typeName}}
      </li>
      <li>
        <label>操作：</label> {{approveData.action}}
      </li>
      <li>
        <label>内容：</label> {{approveData.action}} {{approveData.objNo}}
      </li>
      <li>
        <label>发起人：</label> {{approveData.proposerName}}
      </li>
      <li>
        <label>发起时间：</label> {{approveData.createTime}}
      </li>
      <li>
        <label>发起备注：</label> {{approveData.applyRemark}}
      </li>
      <li>
        <label>审批结果：</label>
        <el-radio v-model="form.state" label="success">同意</el-radio>
        <el-radio v-model="form.state" label="fail">不同意</el-radio>
      </li>
      <li>
        <label>审批备注：</label>
        <el-input type="textarea" v-model="form.approveRemark" resize="none" rows="3" :maxlength="500"></el-input>
      </li>
    </ul>


    <p class="tip">备注：审批后不能修改审批结果</p>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="onSubmit" :disabled="pending" >确 定</el-button>
    </div>
  </base-modal>
</template>

<script>
import * as RepositoryApi from '@src/api/Repository'

export default {
  name: 'approve-dialog',
  props: {
    approveData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      visible: false,
      pending: false,
      init: false,
      form: {
        state: 'success',
        approveRemark: '',
      },
      rules: {
        approveRemark: [
          { required: true, message: '请在审批备注中填写拒绝原因', trigger: 'blur' },
          { max: 500, message: '最多 500 个字符', trigger: 'blur' }
        ],
      }
    }
  },
  methods: {
    open() {
      this.init = true;
      this.visible = true;
    },
    onSubmit() {
      if(this.form.state == 'fail' && !this.form.approveRemark) {
        this.$platform.notification({
          title: '请在审批备注中填写拒绝原因',
          type: 'error',
        });
        return;
      }

      this.visible = false;
      this.pending = true;

      RepositoryApi.operateApprove({
        ...this.form,
        id: this.approveData.id,
        source: 'wiki'
      })
        .then(res => {
          if(res.success) {
            this.pending = false;

            if (res.status) return this.$platform.notification({
              title: '审批失败',
              message: res.message || '',
              type: 'error',
            });

            this.$platform.notification({
              title: '审批成功',
              type: 'success',
            });

            if(this.approveData.isList) {
              this.$parent.search();
              return;
            }

            if((this.approveData.wikiId && this.form.state == 'fail') || (!this.approveData.wikiId)) {
              this.approveData.wikiId = this.approveData.objId;
            }

            let id = window.frameElement.dataset.id;
            this.$platform.closeTab(id);

            let detailFromId = window.frameElement.getAttribute('id');
            let fromId = window.frameElement.getAttribute('fromid');
            this.$platform.refreshTab(fromId);
      
            return this.$platform.openTab({
              id: `document_detail_${ this.approveData.wikiId }`,
              title: '知识库详情',
              url: `/wiki/detail/page?wikiId=${ this.approveData.wikiId }`,
              reload: true,
              close: true,
              detailFromId
            });
          }
          this.$platform.notification({
            title: res.message,
            type: 'error',
          });
        })
        .catch(e => console.error('e', e));
    },

    reset() {
      this.init = false;
    },
  },
}
</script>

<style lang="scss">

  .approve-performance-modal {

    .approve-info {
      margin: 0;
      padding: 15px 0 0;

      li {
        list-style: none;
        display: flex;
        word-break: break-all;

        label {
          width: 100px;
          margin: 0;
          line-height: 26px;
          flex-shrink: 0;
        }
      }
    }

    .tip {
      margin: 10px 0 0;
      line-height: 26px;
      font-size: 12px;
      color: #999;
    }

    .base-modal-body {
      padding: 0 30px;
    }

    .dialog-footer {
      text-align: right;
      /*padding: 15px 0 ;*/
    }
  }

  .el-form {
    padding-top: 15px;

    .el-form-item {
      margin: 0 !important;

      .el-form-item__label {
        margin: 0;
        width: 100px;
        text-align: left;

        line-height: 26px;
      }

      .el-form-item__content {
        line-height: 26px;

        .el-textarea {
          width: calc(100% - 100px);
        }

        .el-form-item__error {
          margin-left: 100px;
        }
      }
    }
  }
</style>