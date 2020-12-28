<template>
  <div class="form-setting-panel">
    <!-- start 标题 -->
    <form-title-setting
      :field="field"
      :setting="setting"
      @input="updateForDom"
    ></form-title-setting>
    <!-- end 标题 -->

    <!-- start 描述信息 -->
    <form-describe-setting
      :field="field"
      @input="updateForDom"
    ></form-describe-setting>
    <!-- end 描述信息 -->

    <!-- start 校验 -->
    <div class="form-setting-group form-setting-item">
      <h4 class="form-item-title">校验</h4>
      <div class="form-item-box">
        <!-- 必填 -->
        <el-checkbox :value="field.isNull" @input="update($event, 'isNull')" @change="isNullUserField" :true-label="0" :false-label="1">必填</el-checkbox>
      </div>
    </div>
    <!-- end 校验 -->

    <!-- start 校验 -->
    <div class="form-setting-group form-setting-item">
      <h4 class="form-item-title">选项</h4>
      <div class="form-item-box">
        <!-- 可多选 -->
        <div class="form-setting-item">
          <el-checkbox v-model="field.setting.isMultiple" @input="update($event, 'isMultiple', true)" :true-label="1" :false-label="0" :disabled="!!field.id">可多选</el-checkbox>
        </div>
        
        <!-- 可显示离职人员 -->
        <div class="form-setting-item">
          <el-checkbox v-model="field.setting.showDeleteUser" @input="update($event, 'showDeleteUser', true)" :true-label="1" :false-label="0">可显示离职人员</el-checkbox>
        </div>
      </div>
    </div>
    <!-- end 校验 -->

    <!-- start 默认值 -->
    <div class="form-setting-group form-setting-item">
      <h4 class="form-item-title">默认值</h4>
      <div class="form-item-box">
        <el-checkbox v-model="defaultValueConfig.isCurrentUser" @input="update(defaultValueConfig, 'defaultValueConfig', true)" :true-label="1" :false-label="0">
          默认当前登录账号
        </el-checkbox>
      </div>
    </div>
    <!-- end 默认值 -->

    <!-- start 字段权限 -->
    <div class="form-setting-group form-setting-item">
      <h4 class="form-item-title">字段权限</h4>
      <div class="form-item-box">
        <!-- 移动端列表展示 -->
        <mobile-show-setting v-if="isTaskMode" :field="field" :fields="fields" @input="update"></mobile-show-setting>
        <!-- 可见性 -->
        <form-visible-setting :field="field" @input="update"></form-visible-setting>
        <!-- 支持高级搜索 -->
        <form-search-setting :field="field" @input="update"></form-search-setting>
      </div>
    </div>
    <!-- end 字段权限 -->
  </div>
</template>

<script>
import SettingMixin from '@src/component/form/mixin/setting';
import { settingProps } from '@src/component/form/components/props';
/* api */
import * as TaskApi from '@src/api/TaskApi.ts';
/* enum */
import TableNameEnum from '@model/enum/TableNameEnum.ts';

// 取消必填时需要校验人员字段是否是审批人的模块
const NEED_CHECK_USER_TABLE_NAME = [TableNameEnum.Task, TableNameEnum.TaskReceipt, TableNameEnum.Event, TableNameEnum.EventReceipt];

export default {
  name: 'form-user-setting',
  mixins: [SettingMixin],
  props: settingProps,
  computed: {
    defaultValueConfig() {
      return this.field.setting.defaultValueConfig || {}
    }
  },
  methods: {
    updateForDom(event){
      let el = event.target;
      let prop = el.dataset.prop;
      let value = el.value;
      
      this.update(value, prop)
    },
    update(value, prop, isSetting = false) {
      this.$emit('input', {value, prop, isSetting});
    },
    /* 必填校验 */
    isNullUserField() {
      let { id, isNull } = this.field;

      // 后端已经存储过的人员字段，如果从必填变成非必填，需校验该字段是否是审批人
      if (NEED_CHECK_USER_TABLE_NAME.indexOf(this.mode) > -1 && id && isNull) {
        TaskApi.checkUser({ id }).then(async res => {
          if (res.succ) {
            let { show } = res.data || {};

            // 是审批人
            if (show == 1) {
              let confirm = await this.$platform.confirm('该人员字段已在审批流程中选择，如果取消必填，对应的审批流程将设置为“无需审批”，确定要继续吗？');
              if (!confirm) return this.field.isNull = 0;

              this.cancelFormUserAprover(id);
            }
          } else {
            console.log('校验审批人失败！');
          }
        }).catch(err => console.warn(err));
      }
    },
    /* 取消对应的人员字段必填后，指向该人员的审批流程变为“无需审批” */
    cancelFormUserAprover(id) {
      TaskApi.cancelUserApproval({ id }).then(res => {
        if (!res.succ) {
          this.$platform.alert(res.message);
        }
      }).catch(err => console.warn(err));
    }
  }
}
</script>
