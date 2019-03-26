<template>
  <base-modal :title="title" :show.sync="visible" width="600px" class="base-import-modal" @closed="reset">
    <div class="build-stage" v-if="stage === 'build'">
      <el-form ref="form" :model="form" label-width="110px" >
        <el-form-item label="报告名称" :error="!formValidation.reportName ? '必填': ''" required>
          <el-input v-model="form.reportName" @change="validate" :maxlength="50"> </el-input>
        </el-form-item>
        <el-form-item label="选择规则" :error="!formValidation.ruleId ? '必选': ''" required>
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
        <el-form-item label="统计以下对象" style="position: relative">
          <el-select v-model="form.range" placeholder="请选择" @change="form.target = []" style="width: 130px;">
            <el-option
              v-for="item in rangeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          <el-select v-model="form.target" multiple collapse-tags clearable filterable @change="validate" :class="{'input-is-error': !formValidation.target}" style="width: 240px;" placeholder="请选择">
            <el-option
              v-for="item in targetOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          <el-button plain @click="selectAll">选择全部</el-button>

          <div v-if="!formValidation.target" class="target-is-error">
            请选择统计对象
          </div>

        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.state" placeholder="请选择" style="width: 130px;" @change="form.timeType = 0">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>

        </el-form-item>
        <div class="customized-label">

          <span v-if="!form.state" class="el-form-item__label">完成时间</span>
          <span v-else class="el-form-item__label">
            <el-select v-model="form.timeType" placeholder="请选择">
              <el-option
                v-for="item in timeTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </span>

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
            :class="{'input-is-error': !formValidation.time}"
            :picker-options="createTimePickerOptions">
          </el-date-picker>

          <div v-if="!formValidation.time" class="time-is-error">
            {{form.time && form.time.length ? '时间跨度不能大于3个月' : '请选择起始时间'}}
          </div>
        </div>
        <el-form-item label="备注">
          <el-input v-model="form.remarks" type="textarea" :maxlength="500"></el-input>
        </el-form-item>
      </el-form>
      <div class="dialog-footer">
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="primary" @click="onSubmit" :disabled="pending">确 定</el-button>
      </div>
    </div>
    <div class="confirm-stage" v-if="stage === 'confirm'">
      <p class="tip">有{{reports.length}}条已经重复统计过，是否继续统计？</p>
      <div class="table-wrap">
        <el-table :data="reports" stripe >
          <el-table-column
            v-for="column in columns"
            :key="column.field"
            :label="column.label"
            :prop="column.field"
            :width="column.width"
            show-overflow-tooltip>
            <template slot-scope="scope">
              <template v-if="column.field === 'tagName'">
                {{scope.row[column.field]}}
              </template>
              <template v-else-if="column.field === 'taskNo'">
                <a href="" class="view-detail-btn" @click.stop.prevent="viewTask(scope.row)">{{scope.row[column.field]}}</a>
              </template>
              <template v-else-if="column.field === 'executor'">
                {{scope.row[column.field].displayName}}
              </template>
              <template v-else>
                {{scope.row[column.field]}}
              </template>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="dialog-footer" style="margin-top: 15px;">
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="primary" @click="confirmCreateReport('screen')" :disabled="pending">去除重复数据并继续</el-button>
        <el-button type="primary" @click="confirmCreateReport" :disabled="pending">包含重复数据并继续</el-button>
      </div>
    </div>

    <div class="stage-success" v-if="stage === 'success'">
      <p>报告名称：{{createReportResult.name || createReportResult.reportName}}</p>
      <p>统计范围：{{createReportResult.totalNumber}}</p>
      <p>规则命中：{{createReportResult.hitNumber}}</p>
      <p>起止时间：{{createReportResult.time}}</p>
      <div class="dialog-footer" style="margin-top: 15px;">
        <el-button type="primary" @click="viewDetail">查看详情</el-button>
      </div>
    </div>
  </base-modal>
</template>

<script>
import { formatDate } from '@src/util/lang';
import {createPerformanceReport} from '@src/api/PerformanceApi';
export default {
  name: 'edit-performance-report-dialog',
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
      createTimePickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        },
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
      timeTypeOptions: [
        {
          label: '完成时间',
          value: 0,
        },
        {
          label: '结算时间',
          value: 1,
        },
      ],
      reports: [],
      stage: 'build',
      createReportResult: {},
      form: {
        reportName: '',
        ruleId: '',
        time: [],
        range: 0,
        target: [],
        state: 0,
        timeType: 0,
        remarks: '',
        sign: 'first',
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
    title() {
      if (this.stage === 'build') return '新增绩效报告';
      if (this.stage === 'confirm') return '重复统计';
      return '统计成功';
    },
    openRules() {
      return (this.initData.AllOpenRules || [])
        .map(({id, ruleName, ruleDesc}) => ({
          label: ruleName,
          value: id,
          ruleDesc,
        }));
    },
    users() {
      return (this.initData.AllUsers || [])
        .map(({userName, userId}) => ({
          label: userName,
          value: userId,
        }));
    },
    tags() {
      return (this.initData.AllTags || [])
        .map(({tagName, tagId}) => ({
          label: tagName,
          value: tagId,
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
    },
    columns() {
      const range = this.form.range;
      return [
        {
          label: '所属团队',
          field: 'tagName',
          show: !!range
        },
        {
          label: '工单编号',
          field: 'taskNo',
          show: true
        },
        {
          label: '客户',
          field: 'cusName',
          show: true
        },
        {
          label: '负责人',
          field: 'executor',
          width: '100px',
          show: true
        },
      ].filter(c => c.show)
    }
  },
  methods: {
    confirmCreateReport(sign) {
      let params = {
        ...this.buildParams(),
        sign,
      };

      if (!sign) {
        delete params.sign;
      }

      this.pending = true;
      createPerformanceReport(params)
        .then(res => {
          this.pending = false;
          if ([1, 7, 8, 11].some(v => v === res.status)) {
            // 1 失败 8 无可统计的工单 7 无可结算员工信息
            return this.$platform.notification({
              title: '失败',
              message: (h => (<div>{res.message || '发生未知错误'}</div>))(this.$createElement),
              type: 'error',
            });
          }

          this.stage = 'success';
          this.createReportResult = res.data;
        })
        .catch(e => console.error('e', e));
    },
    onSubmit() {
      let res = this.validateForm();
      this.submitted = true;
      if (!res) return;
      this.pending = true;
      const params = this.buildParams();

      createPerformanceReport(params)
        .then(res => {
          // 0 成功
          // 1 失败
          // 7 没有可结算的员工信息，只出现在团队
          // 8 无可统计工单 || 无可结算的订单
          // 9 结算重复的工单 || 结算重复
          // 11 去重后无可结算的工单

          this.pending = false;
          if ([1, 7, 8, 11].some(v => v === res.status)) {
            // todo failed message
            // 1 失败 8 无可统计的工单 7 无可结算员工信息
            return this.$platform.notification({
              title: '失败',
              message: (h => (<div>{res.message || '发生未知错误'}</div>))(this.$createElement),
              type: 'error',
            });
          }

          // 结算重复
          if (res.status === 9) {
            this.reports = res.data;
            this.stage = 'confirm';
            return;
          }
          // todo  结果为空的情况
          // 最后才是有不重复的数据生成报告

          if (!res.status) {
            this.stage = 'success';
            this.visible = false;
          }
        })
        .catch(e => {
          this.pending = false;
          console.error('e', e);
        });
    },
    buildParams() {
      const {ruleId, reportName, time, target, range, state, remarks, sign, timeType} = this.form;
      return {
        ruleId,
        reportName,
        state,
        timeType: !state ? 0 : timeType,
        remarks,
        startTime: formatDate(time[0], 'YYYY-MM-DD HH:mm:ss'),
        endTime: `${formatDate(time[1], 'YYYY-MM-DD') } 23:59:59`,
        [range ? 'teams' : 'users']: target.join(','),
        sign,
      }
    },
    viewTask(row){
      let fromId = window.frameElement.getAttribute('id');

      this.$platform.openTab({
        id: `taskView_${row.taskId}`,
        title: `工单${row.taskNo}`,
        close: true,
        url: `/task/view/${row.taskId}?noHistory=1`,
        fromId
      })
    },
    viewDetail() {
      const id = this.createReportResult.reportId || this.createReportResult.id;
      let fromId = window.frameElement.getAttribute('id');
      this.visible = false;
      this.reset();

      this.$platform.openTab({
        id: `performanceReport${id}`,
        title: '绩效报告详情',
        close: true,
        url: `/performance/v2/report/desc/${id}`,
        fromId
      })
    },
    selectAll() {
      this.form.target = this.targetOptions.map(t => t.value);
      this.validate();
    },
    validate() {
      if (!this.submitted) return;
      this.validateForm();
    },
    validateForm() {
      const keys = Object.keys(this.formValidation);
      // const valIsArr = ['target', 'time'];
      let val = null;

      return keys.map(key => {
        val = this.form[key];
        // if (valIsArr.some(k => k === key)) {
        //   return this.formValidation[key] = Array.isArray(val) && !!val.length;
        // }
        // 8035200000 ms = 93 days
        if (key === 'target') return this.formValidation[key] = Array.isArray(val) && !!val.length;
        if (key === 'time') return this.formValidation[key] = Array.isArray(val) && !!val.length && new Date(this.form.time[1]) - new Date(this.form.time[0]) <= 8035200000;

        return this.formValidation[key] = !!val
      })
        .every(bool => bool);
    },
    toggleDialog() {
      this.visible = !this.visible;
    },

    reset() {
      if (this.stage === 'success') {
        this.$emit('refresh-list');
      }

      this.form = {
        reportName: '',
        ruleId: '',
        time: [],
        range: 0,
        target: [],
        state: 0,
        timeType: 0,
        remarks: '',
        sign: 'first',
      };
      this.stage = 'build';
      this.submitted = false;
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
.input-is-error, .input-is-error input {
  border-color: #f56c6c;
}

.confirm-stage {
  .tip {
    font-size: 12px;
    color: $text-color-secondary;
    margin-bottom: 0;
    position: relative;
    top: -5px;
    padding-left: 9px;
  }

  .table-wrap {
    max-height: 300px;
    overflow-y: auto;
  }
}

.target-is-error {
  position: absolute;
  color: #f56c6c;
  font-size: 12px;
  padding: 3px 0 0 0px;
  line-height: 16px;
}

.customized-label {
  height: 40px;
  margin-bottom: 18px;
  .el-form-item__label {
    width: 110px;
    height: 32px;
    line-height: 32px;
  }
  .el-select {
    width: 100%;
  }

  .time-is-error {
    color: #f56c6c;
    font-size: 12px;
    padding: 3px 0 0 110px;
  }
}


.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
