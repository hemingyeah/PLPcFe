<template>
  <div class="rule-setting-container">
    <h2 class="rule-section-title">
      <el-popover
        placement="bottom-start"
        width="500"
        trigger="hover"
        content="绩效管理模块可以帮助企业管理针对服务部门和服务人员的定期绩效数据统一，根据您在这里配置的规则到绩效管理创建绩效统计报告。">
        <span style="vertical-align: middle" slot="reference">
          绩效规则<i class="icon-help iconfont" style="margin-left: 3px;"></i>
        </span>
      </el-popover>

      <base-button type="primary" native-type="submit" @event="openSettingDialog">添加</base-button>
    </h2>

    <el-table
      stripe
      :data="rules"
      v-loading="loading"
      class="rule-table"
      :highlight-current-row="false">
      <el-table-column
        v-for="(column, index) in columns"
        :key="`${column.field}_${index}`"
        :label="column.label"
        :prop="column.field"
        :width="column.width"
        show-overflow-tooltip
      >

        <template slot-scope="scope">
          <template v-if="column.field === 'ruleType'">
            {{scope.row[column.field] | ruleType}}
          </template>
          <template v-else-if="column.field === 'effect'">
            <el-switch
              :disabled="scope.row.pending"
              @change="toggleStatus(scope.row)"
              :value="Boolean(scope.row.effect)">
            </el-switch>
          </template>
          <template v-else-if="column.field === 'action'">
            <el-button plain @click="editRule(scope.row)" size="small">编辑</el-button>
            <el-button type="danger" @click="deleteRule(scope.row)" size="small">删除</el-button>
          </template>

          <template v-else>
            {{scope.row[column.field]}}
          </template>
        </template>

      </el-table-column>
    </el-table>

    <setting-rule-dialog @refresh-rules="fetchRules" :all-types="allTypes" :performance-rule="editedPerformanceRule" ref="settingRuleDialog" />
  </div>
</template>

<script>
import SettingRuleDialog from './components/SettingRuleDialog.vue';
import {getAllPerformanceRules, deletePerformanceRule, togglePerformanceRuleEffect} from '@src/api/PerformanceApi';

export default {
  name: 'rule-setting',
  props: {
    initData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      rules: [],
      columns: this.buildColumns(),
      loading: false,
      editedPerformanceRule: {},
    }
  },
  computed: {
    allTypes() {
      const { serviceType, serviceContent, templateId} = this.initData;
      return {
        taskTypes: (templateId || []).map(({templateName, templateId}) => ({
          label: templateName,
          value: templateId,
        })),
        serviceTypes: (serviceType || []).map(st => ({
          label: st,
          value: st,
        })),
        serviceContents: (serviceContent || []).map(sc => ({
          label: sc,
          value: sc,
        })),
      };
    }
  },
  filters: {
    ruleType(val) {
      return val ? '奖金制' : '计分制';
    }
  },
  mounted() {
    this.fetchRules();

  },
  methods: {
    editRule(row) {
      this.$refs.settingRuleDialog.toggleDialog({
        ...row,
        ruleContent: JSON.parse(row.ruleContent)
      })
    },
    openSettingDialog() {
      this.$refs.settingRuleDialog.toggleDialog();
    },
    fetchRules() {
      this.loading = true;
      getAllPerformanceRules()
        .then(res => {
          this.loading = false;

          if (res.status) return this.$platform.notification({
            title: '失败',
            type: 'error',
            message: res.message || '发生未知错误',
          });

          this.rules = (res.data || [])
            .map(rule => ({
              ...rule,
              pending: false,
            }))

        })
        .catch(e => console.error('e', e));
    },
    toggleStatus(row) {
      const ns = row.effect ? 0 : 1;
      row.pending = true;
      const params = {
        id: row.id,
        effect: ns,
      };

      togglePerformanceRuleEffect(params)
        .then(res => {
          row.pending = false;
          if (res.status) {
            return this.$platform.notification({
              title: '失败',
              type: 'error',
              message: res.message || '发生未知错误',
            })
          }

          this.rules.forEach(rule => {
            if (rule.id === row.id) {
              rule.effect = ns;
            }
          })
        })
        .catch(e => console.error('e', e));
    },
    async deleteRule(row) {
      const result = await this.$platform.confirm('您确定要删除该条规则吗?');
      if (!result) return;

      deletePerformanceRule(row.id)
        .then(res => {
          if (res.status) return this.$platform.notification({
            title: '失败',
            type: 'error',
            message: res.message || '发生未知错误',
          });

          this.$platform.notification({
            title: '删除成功',
            type: 'success',
          });

          // 删除成功
          this.fetchRules();
        })
        .catch(e => console.error('e', e));
    },
    notice({type, message, title}) {
      return this.$platform.notification({
        title,
        message: (h => (<div>{message}</div>))(this.$createElement),
        type,
      });
    },
    buildColumns() {
      return [
        {
          label: '规则名称',
          field: 'ruleName',
          show: true,
          width: '200px'
        },
        {
          label: '规则说明',
          field: 'ruleDesc',
          show: true,
          // width: '300px'
        },
        {
          label: '类别',
          field: 'ruleType',
          show: true,
          width: '80px'
        },
        {
          label: '启用/禁用',
          field: 'effect',
          show: true,
          width: '90px'
        },
        {
          label: '操作',
          field: 'action',
          show: true,
          width: '160px'
        },
      ]
    }
  },
  components: {
    [SettingRuleDialog.name]: SettingRuleDialog,
  }
}
</script>

<style lang="scss">

  .rule-setting-container {
    background: #ffffff;
    padding: 10px;

    .rule-section-title {
      display: flex;
      justify-content: space-between;
      line-height: 32px;
      font-size: 16px;
      margin: 0;
    }

    // table
    .rule-table {
      margin-top: 10px;
      th {
        background: #F5F5F5;
        color: $text-color-primary;
        font-weight: normal;
        font-size: 14px;
        line-height: 34px;
        color: #333;
      }
      td {
        font-size: 13px;
      }

      .el-table__body {
        width: 100% !important;
      }
    }
  }

</style>
