<template>
  <div class="rule-setting-container">
    <h2 class="rule-section-title">
      绩效规则
      <base-button type="primary" native-type="submit" @event="openSettingDialog">添加</base-button>
    </h2>

    <el-table
      stripe
      :data="rules"
      v-loading="loading"
      :highlight-current-row="false">
      <el-table-column
        v-for="column in columns"
        :key="column.field"
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
import {getAllPerformanceRules, deleteAllPerformanceRules, togglePerformanceRuleEffect} from '@src/api/PerformanceApi';

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
          if (!res.status) {
            this.rules = res.data
              .map(rule => ({
                ...rule,
                pending: false,
              }))

          }
          this.loading = false;
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
            return this.notice({
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

      deleteAllPerformanceRules(row.id)
        .then(res => {
          if (res.status) {
            return this.notice({
              title: '失败',
              type: 'error',
              message: res.message || '发生未知错误',
            })
          }

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
          // width: '150px'
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
          width: '80px'
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

    .rule-section-title {
      display: flex;
      justify-content: space-between;
      line-height: 32px;
      font-size: 16px;
      margin: 0;
    }

    // table
    .el-table__body {
      width: 100% !important;
    }


  }

</style>