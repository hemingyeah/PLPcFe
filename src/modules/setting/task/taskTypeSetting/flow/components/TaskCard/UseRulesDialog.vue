<template>
  <base-modal
    :show.sync="show"
    width="420px"
    class="userules-dialog"
    @closed="onClose"
  >
    <div slot="title">
      <span class="el-dialog__title">设置使用规则</span>
    </div>
    <div class="base-modal-content">
      <div class="base-form-list">
        <label>当工单处于以下状态时，可以编辑该组件
          <el-tooltip
            class="item"
            effect="dark"
            content="设置了可编辑的流程节点时，该组件只可以在符合条件的状态下添加、修改和删除数据"
            placement="top"
          >
            <span><i class="el-icon-question"></i></span>
          </el-tooltip>
        </label>
        <el-select v-model="form.stateCanEdit" @change="onChangeState" multiple placeholder="请选择">
          <el-option
            v-for="item in flowState"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </div>
      <div class="base-form-list">
        <label>当工单进行到以下流程节点前，必须填写该组件
          <el-tooltip
            class="item"
            effect="dark"
            placement="top"
          >
            <div slot="content">
              <template>
                <div class="form-displaymode-setting-item"><span>●</span> 设置了某个节点后，要求附加组件的内容要在该节点内完成填写</div>
                <div class="form-displaymode-setting-item"><span>●</span> 未设置时，不做限制</div>
              </template>
            </div>
            <span><i class="el-icon-question"></i></span>
          </el-tooltip>
        </label>
        <el-select v-model="form.flow" placeholder="在以下节点前必填">
          <el-option
            v-for="item in flowRules"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onClose">取 消</el-button>
      <el-button type="primary" @click="onSubmit('form')">确 定</el-button>
    </div>
  </base-modal>
</template>
<script>
// api
import * as SettingTaskApi from '@src/api/SettingTaskApi';
import {flowState, flowRules, getFlowRuleOptions } from './useRules';
export default {
  name: 'use-rules-dialog',
  props: {
    taskCard: {
      type: Object,
      default: () => ({})
    },
    taskTypeId:{
      type: String,
    },
    visiable: {
      type: Boolean,
    },
  },
  data() {
    return {
      show: false,
      flowRules,
      form: {
        id: '',
        flow:'',
        stateCanEdit: [],
        description: '',
        inputType: 'single',
      }
    };
  },
  computed: {
    flowState() {
      return flowState
    }
  },
  watch: {
    visiable(newValue) {
      this.show = newValue;
      if(newValue){
        this.form.flow = this.taskCard.notNullFlow ? this.taskCard.notNullFlow : '';
        this.form.stateCanEdit = this.taskCard.stateCanEdit ? this.taskCard.stateCanEdit : [];
        let option = getFlowRuleOptions(this.form.stateCanEdit);
        this.flowRules = option;
      }    
    }
  },
  methods: {
    onChangeState(value) {
      let option = getFlowRuleOptions(value);
      this.flowRules = option;
      this.form.flow = '';
    },
    onClose() {
      this.$emit('onClose')   
    },
    onSubmit(form) {
      // 新增组件
      this.saveRulesFlow();
    },

    // 创建附加组件
    saveRulesFlow() {
      this.$emit('update', this.form.flow, this.form.stateCanEdit)
    },

    // 修改附加组件
    onUpdateCardReq() {
      const params = {
        description: this.form.description,
        id: this.form.id,
        name: this.form.name,
      };
      SettingTaskApi.onUpdateCard(params)
        .then((res) => {
          const { status, message, data } = res;
          if (status == 0) {
            this.$message.success('修改成功');
            location.reload();
          } else {
            this.$message.error(message);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },

    // 获取附加组件的信息
    getCardInfoReq() {
      SettingTaskApi.getCardInfo({ id: this.form.id })
        .then((res) => {
          const { status, message, data } = res;
          if (status == 0) {
            this.form = data;
          }
        })
        .catch((error) => ({}));
    },
  },
};
</script>
<style lang="scss">
.userules-dialog {
  .base-modal-header {
    display: flex;
    justify-content: space-between;
    .el-dialog__title {
      font-size: 18px;
    }
    .el-tooltip {
      color: #999;
    }
  }
  .base-modal-body {
    padding: 20px;
    .el-form {
      .el-form-item {
        .el-form-item__content {
          width: 280px;
          .el-radio {
            margin-right: 24px;
          }
        }
        .el-tooltip {
          color: #999;
        }
      }
    }
  }
  .base-modal-content{
    .base-form-list{
      margin-bottom: 20px;
      label{
        font-size: 14px;
        color: #666666;
        .el-tooltip{
          color: #999;
        }
      }
      .el-select{
        width: 100%;
      }
    }
  }
}
</style>