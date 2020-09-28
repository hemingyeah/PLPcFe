<template>
  <div class="multiple-card-container">
    <!-- start 工时记录列表 -->
    <multiple-card-table
      :data="hoursRecordData.workTimeRecordMainList"
      :is-hours-record="isHoursRecord"
      :columns="columns"
      :allow-create="allowCreate"
      :allow-edit="allowEdit"
      :allow-delete="allowDelete"
      @action="handleEvent"
    />
    <!-- end 工时记录列表 -->

    <!-- start 合计 -->
    <div class="hours-record-total-panel" v-if="hoursRecordData.workTimeRecordMainList && hoursRecordData.workTimeRecordMainList.length">
      <div class="hours-record-total-item">
        合计用时{{hoursRecordData.allUsedTime}}h，其中{{ hoursRecordData.usedTimeDetail.join('，') }}；
      </div>
      <div class="hours-record-total-item">
        总行程{{hoursRecordData.allDestance}}km，其中{{ hoursRecordData.usedDistanceDetail.join('，') }}；
      </div>
    </div>
    <!-- end 合计 -->

    <!-- start 按钮组 -->
    <div class="btn-group" v-if="showCreateBtn">
      <el-button
        @click="handleEvent({action: 'create'})"
        type="primary"
        size="mini"
        plain
      >添加工时记录</el-button>
    </div>
    <!-- end 按钮组 -->

    <!-- start 附加组件详情弹窗 -->
    <task-card-view-dialog
      ref="taskCardView"
      :fields="viewFields"
      :value.sync="cardInstance"
      :is-hours-record="isHoursRecord"
      @action="handleEvent"
    />
    <!-- end 附加组件详情弹窗 -->

    <!-- start 新增/编辑附加组件弹窗 -->
    <task-card-edit-dialog
      ref="taskCardEdit"
      :fields="formFields"
      :value.sync="cardInstance"
      :is-hours-record="isHoursRecord"
      :action="action"
      @submit="submit"
    />
    <!-- end 新增/编辑附加组件弹窗 -->

    <!-- start 位置详情弹窗 -->
    <hours-record-location-dialog
      ref="hoursRecordLocation"
      :config="config"
    />
    <!-- end 位置详情弹窗 -->
  </div>
</template>

<script>
/* api */
import * as TaskApi from '@src/api/TaskApi.ts';

/* components */
import MultipleCardTable from './CardTable';
import HoursRecordLocation from './HoursRecordLocation';

/* mixin */
import cardMixin from './mixin';

/* util */
import fieldUtil from './CardField.js';

export default {
  name: 'hours-record-card',
  mixins: [cardMixin],
  data() {
    return {
      hoursRecordData: {}
    }
  },
  computed: {
    /** 
    * @description 工时记录配置项
    */
    config() {
      return JSON.parse(this.card.config || '{}');
    },
    /** 
    * @description 工时记录列表项
    */
    columns() {
      let fields = fieldUtil.toTableFields(this.card.fields, this.config);
      return fields.filter(field => field.enabled == 1);
    },
    /** 
    * @description 新增、编辑工时记录表单字段
    */
    formFields() {
      let fields = fieldUtil.toFormFields(this.card.fields, this.config);
      return fields.filter(field => field.enabled == 1);
    },
    /** 
    * @description 工时记录详情字段
    * pc端和移动端生产的数据详情字段展示不同
    */
    viewFields() {
      let { fromType } = this.cardInstance?.attribute || {};
      if (fromType == 1) return this.formFields;

      let fields = fieldUtil.toMobileFields(this.card.fields, this.config);
      return fields.filter(field => field.enabled == 1);
    },
    /** 
    * @description 显示添加工时记录按钮
    * 1.满足新增权限
    * 2.工时记录设置禁用只允许在移动端填写
    */
    showCreateBtn() {
      return this.allowCreate && !this.config.isOnlyMobile;
    }
  },
  mounted() {
    this.getHoursRecordList();
  },
  methods: {
    /** 
    * @description 获取工时记录列表数据
    */
    async getHoursRecordList() {
      try {
        let res = await TaskApi.getHoursRecordList({cardId: this.card.cardId, orderId: this.task.id});
        if (!res.success || !res.result) return;

        let data = res.result;
        let mainList = data ? data.workTimeRecordMainList : [];

        // 处理附件
        for (let i = 0; i < mainList.length; i++) {
          mainList[i].attachment = JSON.parse(mainList[i].attachment || '[]');
          mainList[i].startAttachment = JSON.parse(mainList[i].startAttachment || '[]');
          mainList[i].endAttachment = JSON.parse(mainList[i].endAttachment || '[]');
        }

        // 处理合计用时
        data.usedTimeDetail = data.usedTimeDetail.map(item => {
          item = JSON.parse(item);
          return item = `${item.username}${item.usedTime}h`;
        })

        // 处理总行程
        data.usedDistanceDetail = data.usedDistanceDetail.map(item => {
          item = JSON.parse(item);
          return item = `${item.username}${item.distance}km`;
        })

        this.hoursRecordData = data || {};
          
      } catch(err) {
        console.error('getHoursRecordList err', err)
      }
    }
  },
  components: {
    [MultipleCardTable.name]: MultipleCardTable,
    [HoursRecordLocation.name]: HoursRecordLocation
  }
}
</script>

<style lang="scss" scoped>
.hours-record-total-panel {
  font-size: 12px;
  color: $text-color-regular;
  padding: 6px 12px 0;

  .hours-record-total-item {
    margin-top: 6px;
  }
}
</style>