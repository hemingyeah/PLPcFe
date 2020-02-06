<template>
<section>
  <base-modal :title="title" :show.sync="visible" width="600px" class="create-performance-report-modal" @closed="reset">
    <div class="build-stage" v-if="stage === 'build'">
      <el-form ref="form" :model="form" label-width="110px" >
        <el-form-item label="报告名称" :error="!formValidation.reportName ? '必填': ''" required>
          <el-input v-model="form.reportName" @change="validate" :maxlength="50"> </el-input>
        </el-form-item>
        <el-form-item label="选择规则" :error="!formValidation.ruleId ? '必选': ''" required>
          <el-select v-model="form.ruleId" @change="validate" placeholder="请选择运行规则，创建规则请到系统管理-绩效报告设置中设置" style="width: 100%;">
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
        <el-form-item label="统计以下对象" class="target-group" required>
          <el-select v-model="form.range" placeholder="请选择人员" @change="form.target = []" style="width: 130px;">
            <el-option
              v-for="item in rangeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>

          <!-- start 按人员选择 -->
          <el-input 
            v-if="!form.range"
            readonly
            :value="form.target.map(({displayName}) => displayName).join(',')"
            :class="{'input-is-error': !formValidation.target}"
            @click.native="selectUser" 
            style="width: 315px; margin-left: 15px;"
            placeholder="请选择人员"
          >
          </el-input>
          <!-- end 按人员选择 -->

          <!-- start 按团队选择 -->
          <el-input 
            v-else 
            readonly
            :value="form.target.join(',')"
            :class="{'input-is-error': !formValidation.target}" 
            @click.native="selectTeam" 
            style="width: 315px; margin-left: 15px;"
            placeholder="请选择团队/人员"
          >
          </el-input>
          <!-- end 按团队选择 -->
          <!-- <biz-team-select v-else multiple v-model="form.target" placeholder="请选择团队(默认选择全部团队)" :fetch-func="fetchTeam"></biz-team-select> -->

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

          <span v-if="!form.state" class="el-form-item__label is-required">完成时间</span>
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
            :class="{'input-is-error': !formValidation.time}"
            :picker-options="createTimePickerOptions">
          </el-date-picker>

          <div v-if="!formValidation.time" class="time-is-error">
            {{form.time && form.time.length ? '时间跨度不能大于3个月' : '请选择起始时间'}}
          </div>
        </div>
        <el-form-item label="备注">
          <el-input v-model="form.remarks" type="textarea" :maxlength="500"></el-input>
          <p style="color: #999;margin: 0">* 生成绩效报告的时间取决于选择的数据量，如遇长时间等待请稍后刷新</p>
        </el-form-item>

        <el-form-item label="抄送人">
          <el-select
            style="width: 350px"
            v-model="form.carbonCopy"
            filterable
            clearable
            remote
            multiple
            placeholder="请选择绩效报告抄送人，须具备运营分析权限"
            :loading="remoteSearchLoading"
            :remote-method="getApproveList">
            <el-option
              v-for="item in approveList"
              :key="item.userId"
              :label="item.displayName"
              :value="item.userId">
            </el-option>
          </el-select>
        </el-form-item>

        <!--<el-form-item label="审核人" >-->
          <!--<el-select v-model="approvePersonIds" multiple clearable filterable @change="validate" placeholder="请选择" disabled style="width: 300px">-->
            <!--<el-option-->
              <!--v-for="item in approvePerson"-->
              <!--:key="item.value"-->
              <!--:label="item.label"-->
              <!--:value="item.value">-->
            <!--</el-option>-->
          <!--</el-select>-->
        <!--</el-form-item>-->

        <el-form-item label="发布流程" class="publish">
          <approve-process stage="create"></approve-process>
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
            v-for="(column, index) in columns"
            :key="`${column.field}_${index}`"
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
              <!--<template v-else-if="column.field === 'settlement'">-->
              <!--{{scope.row[column.field]}}-->
              <!--</template>-->
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
        <el-button type="primary" @click="confirmCreateReport('')" :disabled="pending">包含重复数据并继续</el-button>
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
  <choose-team-user-options-dialog 
    ref="teamUserOptionsDialog"
    v-model="form.isRepeat"
    @update="updateFormIsrepeat"
  >
  </choose-team-user-options-dialog>
  <!-- start 选择团队人员处理方式弹窗 -->
  <!-- end 选择团队人员处理方式弹窗 -->
</section>
</template>

<script>
import platform from '@src/platform';
import { formatDate } from '@src/util/lang';

import * as TeamApi from '@src/api/TeamApi';
import {createPerformanceReport, getApprovePerson, getApprovePersonList, checkTagUserRepeat, checkTaskRepeatCalculation} from '@src/api/PerformanceApi';

import ApproveProcess from './ApproveProcess.vue'
import ChooseTeamUserOptionsDialog from './ChooseTeamUserOptionsDialog.vue';

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
      settingPending: false,
      remoteSearchLoading: false,
      approveList: [],

      approvePerson: [],
      approvePersonIds: [],
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
        carbonCopy: [],
        state: 0,
        timeType: 0,
        remarks: '',
        sign: 'first',
        isRepeat: ''
      },
      formValidation: {
        reportName: true,
        ruleId: true,
        target: true,
        time: true,
      },
      submitted: false,
      teamAndUser: {
        data: [],
        list: [],
        repeatNameList: [],
      },
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
    },
    /** 是否开启服务团队派单 */
    isAllotByTag() {
      return this.initData?.isAllotByTag === true;
    }
  },
  mounted() {
    if(!this.isAllotByTag) {
      this.rangeOptions.splice(1, 1);
    }
  },
  methods: {
    fetchTeam(params) {
      return TeamApi.tagList(params);
    },
    init() {
      getApprovePerson()
        .then(res => {
          if (res.status) return;
          this.approvePerson = res.data
            .map(({userId, displayName}) => ({
              label: displayName,
              value: userId
            }));
          this.approvePersonIds = res.data
            .map(({userId}) => userId);
        })
        .catch(err => console.error(err))
    },
    confirmCreateReport(sign = '') {
      let params = {
        ...this.buildParams(),
        sign,
      };

      this.pending = true;
      createPerformanceReport(params)
        .then(res => {
          let isSucc = res.status == 0;

          this.pending = false;
          
          platform.alert(res.message || '发生未知错误');
          
          if(isSucc) {
            this.visible = false;
            this.showExportList();
          }

        })
        .catch(e => console.error('e', e));
    },
    onSubmit() {
      let res = this.validateForm();
      this.submitted = true;
      if (!res) return;
      this.pending = true;
      const params = this.buildParams();

      checkTaskRepeatCalculation(params)
        .then(res => {
          let data = res.data;
          let isSucc = res.status == 0;

          this.pending = false;

          if (!isSucc) {
            return this.$platform.notification({
              title: '失败',
              message: (h => (<div>{res.message || '发生未知错误'}</div>))(this.$createElement),
              type: 'error',
            });
          }

          // 结算是否重复
          if (!data) {
            this.visible = false;
            this.confirmCreateReport();
          } else {
            this.reports = data;
            this.stage = 'confirm';
          }
        })
        .catch(e => {
          this.pending = false;
          console.error('e', e);
        });
    },
    buildTarget() {
      try {
        let data = this.teamAndUser?.data || {};
        let targetObject = {};

        let users = data?.users || [];
        let teams = data?.teams || [];

        users.forEach(u => {
          let tagId = u.tagId;
          if(!targetObject.hasOwnProperty(tagId)) {
            targetObject[tagId] = []
          }
          targetObject[tagId].push(u.userId)
        });
        teams.forEach(team => { targetObject[team.id] =  'isAll'});

        return JSON.stringify(targetObject);

      } catch (error) {
        conosole.log(error);
        return ''
      }

    },
    buildParams() {
      const {ruleId, reportName, time, range, state, remarks, sign, timeType, carbonCopy, isRepeat} = this.form;
      let target = '';
      let userIsPepeat = '';

      if (this.form.target && this.form.target.length) {
        if (!range) {
          target = this.form.target.map(({userId}) => userId).join(',') || '';
        } else {
          target = this.buildTarget();
          userIsPepeat = isRepeat ? isRepeat : 'repeat'
        }
      }

      return {
        ruleId,
        reportName,
        state,
        timeType: !state ? 0 : timeType,
        remarks,
        startTime: `${formatDate(time[0], 'YYYY-MM-DD')} 00:00:00`,
        endTime: `${formatDate(time[1], 'YYYY-MM-DD') } 23:59:59`,
        [range ? 'teams' : 'users']: target,
        carbonCopy: carbonCopy.join(','),
        sign,
        isRepeat: userIsPepeat,
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
    validate() {
      if (!this.submitted) return;
      this.validateForm();
    },
    validateForm() {
      const keys = Object.keys(this.formValidation);
      let val = null;

      return keys.map(key => {
        val = this.form[key];
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
    getApproveList(keyword) {
      return getApprovePersonList({
        keyword: keyword || '',
        pageNum: 1,
        pageSize: 20,
      })
        .then(res => {
          this.approveList = res.data.list;
        })
        .catch(e => console.error('e', e));
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
        carbonCopy: [],
        state: 0,
        timeType: 0,
        remarks: '',
        sign: 'first',
        isRepeat: '',
      };
      this.stage = 'build';
      this.submitted = false;
      this.formValidation = {
        reportName: true,
        ruleId: true,
        target: true,
        time: true,
      }
      this.teamAndUser = {
        list: [],
        data: [],
        repeatNameList: []
      }
    },
    /** 选择人员  */
    selectUser() {
      let choose = this.isAllotByTag ? 'team' : 'dept';
      let options = {
        max: -1,
        isHideTeam: true,
        selected: (
          this.isAllotByTag 
          ? {
              users: this.form.target
            } 
          : this.form.target
        )
      }

      this.$fast.contact.choose(choose, options).then(res => {
        if(res.status != 0) return

        this.form.target = res?.data?.users || [];

      })
        .catch(err => console.error(err))
    },
    /** 选择团队  */
    selectTeam() {
      let options = {
        isRepeatUser: true,
        isHideTeam: false,
        max: -1,
        selectType: 'performance',
        selected: this.teamAndUser.data || [],
        showTeamCheckbox: true,
      };

      this.$fast.contact.choose('team', options).then(res => {
        this.teamAndUser.data = res.data;

        let users = this.teamAndUser?.data?.users || [];
        let teams = this.teamAndUser?.data?.teams || [];

        users = users.map(user => {
          return { id: user.userId, name: user.displayName }
        })
        this.teamAndUser.list = teams.concat(users);
        this.form.target = this.teamAndUser.list.map(({name}) => name);
        this.checkTagAndUserRepeat();

      })
        .catch(err => console.error(err))
    },
    /** 检查团队用户是否重复 */
    checkTagAndUserRepeat() {
      let params = {
        paramJson: this.buildTarget()
      };
      this.pending = true;
      checkTagUserRepeat(params).then(result => {
        let data = result.data;
        let isSucc = result.status == 0;
        let isRepeat = false;

        if(isSucc) {
          isRepeat = (data.isRepeat === true);

          if(isRepeat) {
            this.teamAndUser.repeatNameList = data.repeatUserNameList;
            this.$refs.teamUserOptionsDialog.show(this.teamAndUser.repeatNameList);
          }

        } else {
          this.$platform.notification({
            title: '失败',
            message: result.message || '',
            type: 'error',
          });
        }

      }).catch(err => console.error('checkTagUserRepeat', err))
        .finally(() => this.pending = false)
    },
    updateFormIsrepeat(value) {
      if(value == 'cancel') {
        this.selectTeam();
      }
    },
    showExportList() {
      window.parent.showExportList();
      window.parent.exportPopoverToggle(true);
    }
  },
  components: {
    [ApproveProcess.name]: ApproveProcess,
    [ChooseTeamUserOptionsDialog.name]: ChooseTeamUserOptionsDialog,
  }
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
  bottom: -20px;

  color: #f56c6c;
  font-size: 12px;
  padding: 3px 0 0 0px;
  line-height: 16px;
}

.target-group .el-form-item__content{
  display: flex;

  .biz-team-select {
    width: 315px;
    margin-left: 15px;
  }

  .el-input__inner {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
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

.create-performance-report-modal {

  .approve-process-container {
    width: 350px;
    margin: 0;
  }

  .base-modal-body {
    padding: 15px;
    padding-right: 25px;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
  }

}

.customized-label{
  .el-date-editor{
    width:  350px !important;
  }
}

</style>
