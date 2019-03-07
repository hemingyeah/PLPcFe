<template>
  <base-modal :title="title" :show.sync="visible" width="600px" class="base-import-modal" @closed="reset">
    <el-form ref="form" :model="form" label-width="100px">
      <el-form-item label="报告名称" :error="!formValidation.reportName ? '必填': ''">
        <el-input v-model="form.reportName" @change="validate"> </el-input>
      </el-form-item>
      <el-form-item label="选择规则" :error="!formValidation.ruleId ? '必选': ''">
        <el-select v-model="form.ruleId" @change="validate" placeholder="请选择" style="width: 100%;">
          <el-option
            v-for="item in openRules"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>

      </el-form-item>
      <el-form-item label="规则说明">
        <el-input :value="ruleDesc" type="textarea" readonly></el-input>
      </el-form-item>
      <h3>报告统计对象</h3>
      <el-form-item label="统计以下对象">
        <el-select v-model="form.range" placeholder="请选择" @change="form.target = []" style="width: 130px;">
          <el-option
            v-for="item in rangeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <el-select v-model="form.target" multiple collapse-tags @change="validate" :class="{'input-is-error': !formValidation.target}" style="width: 250px;" placeholder="请选择">
          <el-option
            v-for="item in targetOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <el-button plain @click="selectAll">选择全部</el-button>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="form.state" placeholder="请选择" style="width: 130px;">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>

      </el-form-item>
      <el-form-item label="完成时间" :error="!formValidation.time ? '必选': ''">
        <el-date-picker
          v-model="form.time"
          type="daterange"
          align="right"
          unlink-panels
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="validate"
          style="width: 290px;"
          :picker-options="createTimePickerOptions">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remarks" type="textarea"></el-input>
      </el-form-item>
    </el-form>


    <div class="dialog-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="onSubmit" :disabled="pending">确 定</el-button>
    </div>
  </base-modal>
</template>

<script>
import { formatDate, } from '@src/util/lang';
import {createPerformanceReport} from '@src/api/PerformanceApi';

export default {
  name: "edit-performance-report-dialog",
  props: {
    initData: {
      type: Object,
      default: () => ({}),
    }
  },
  data() {
    return {
      visible: false,
      pending: false,
      title: '新增绩效报告',
      createTimePickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
      rangeOptions: [
        {
          label: '按人员',
          value: 0,
        },
        {
          label: '按团队',
          value: 1,
        },
      ],
      statusOptions: [
        {
          label: '已完成',
          value: 0,
        },
        {
          label: '已完成并结算',
          value: 1,
        },
      ],

      form: {
        reportName: '',
        ruleId: '',
        time: [],
        range: 0,
        target: [],
        state: 0,
        remarks: '',
      },
      formValidation: {
        reportName: true,
        ruleId: true,
        target: true,
        time: true,
      },
      submitted: false,
    }
  },
  computed: {
    openRules() {
      return this.initData.AllOpenRules
        .map(({id, ruleName, ruleDesc}) => ({
          label: ruleName,
          value: id,
          ruleDesc,
        }));
    },
    users() {
      return this.initData.AllUsers
        .map(({displayName, userId}) => ({
          label: displayName,
          value: userId,
        }));
    },
    tags() {
      return this.initData.AllTags
        .map(({tagName, id}) => ({
          label: tagName,
          value: id,
        }));
    },
    targetOptions() {
      if (this.form.range) return this.tags;
      return this.users;
    },
    ruleDesc() {
      let formRuleId = this.form.ruleId;
      if (formRuleId) return this.openRules.filter(({value}) => value === formRuleId)[0].ruleDesc;
      return '';
    }
  },
  mounted() {
  },
  methods: {
    selectAll() {
      this.form.target = this.targetOptions.map(t => t.value);
    },
    onSubmit() {
      let res = this.validateForm();
      this.submitted = true;
      if (!res) return;
      this.pending = true;
      const params = this.buildParams();

      createPerformanceReport(params)
        .then(res => {
          console.log('res', res);
          if (!res.status) {
            this.visible = false;
            // todo 成功失败的弹窗提示 刷新列表
            this.$emit('refresh-list');
            this.reset();
          }
          this.pending = false;
        })
        .catch(e => {
          this.pending = false;
          console.error('e', e);
        });
    },
    buildParams() {
      const {ruleId, reportName, time, target, range, state, remarks} = this.form;
      let params = {
        ruleId,
        reportName,
        timeType: state,
        remarks,
        startTime: formatDate(time[0], 'YYYY-MM-DD'),
        endTime: formatDate(time[1], 'YYYY-MM-DD'),
        [range ? 'teams' : 'users']: target.join(','),
      };

      console.log('this.form', this.form);
      console.log('params', params);

      return params;
    },
    validate() {
      if (!this.submitted) return;
      this.validateForm();
    },
    validateForm() {
      const keys = Object.keys(this.formValidation);
      const valIsArr = ['target', 'time'];
      let val = null;

      return keys.map(key => {
        val = this.form[key];
        if (valIsArr.some(k => k === key)) {
          return this.formValidation[key] = Array.isArray(val) && !!val.length;
        }
        return this.formValidation[key] = !!val
      })
        .every(bool => bool);
    },
    toggleDialog() {
      this.visible = !this.visible;
    },

    reset() {
      this.form = {
        reportName: '',
        ruleId: '',
        time: [],
        range: 0,
        target: [],
        state: 0,
        remarks: '',
      };
      this.formValidation = {
        reportName: true,
        ruleId: true,
        target: true,
        time: true,
      }
    }
  },
}
</script>

<style lang="scss">

  .input-is-error input {
    border-color: #f56c6c;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
  }
</style>