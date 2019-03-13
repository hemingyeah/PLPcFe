<template>
  <base-modal :title="title" :show.sync="visible" width="800px" class="base-import-modal" @closed="reset">
    <el-form ref="form" :model="form" label-width="80px">

      <el-form-item label="规则名称" :error="formValidationResult.ruleName">
        <el-input v-model="form.ruleName" @change="validate"></el-input>
      </el-form-item>
      <el-form-item label="规则说明" :error="formValidationResult.ruleDesc">
        <el-input v-model="form.ruleDesc" @change="validate" type="textarea" :maxlength="500"></el-input>
      </el-form-item>
      <el-form-item label="类别" style="margin-bottom: 0px!important;">
        <el-radio-group v-model="form.ruleType" @change="changeRuleType">
          <el-radio :label="0">计分制</el-radio>
          <el-radio :label="1">奖金制</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="规则内容">
        按照工单完成数量
      </el-form-item>

      <el-form-item label="计算方式" v-if="form.ruleType">
        <el-select v-model="form.rewardType" @change="validate" placeholder="请选择">
          <el-option
            v-for="item in calculations"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="生效条件" class="base-condition-wrap">
        <el-select v-model="form.effectCondition" @change="changeEffectCondition" placeholder="请选择">
          <el-option
            v-for="item in includeTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>

        <span class="ordinary-text" v-if="form.effectCondition">为</span>
        <el-select v-model="form.category" v-if="form.effectCondition" :class="{'input-is-error': formValidationResult.category}" @change="changeCategory" placeholder="请选择">
          <el-option
            v-for="item in categories"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>

        <div v-if="!form.effectCondition" class="special-condition-wrap">
          <span class="ordinary-text">负责人{{conditionConfig.label}}</span>
          <el-input v-model="form.rules[0].executorScore" @change="validate" :class="{'input-is-error': formValidationResult.rules[0].fields.some(v => v === 'executorScore')}" class="count-input" placeholder="请输入内容"></el-input>
          <span class="ordinary-text">{{conditionConfig.unit}}</span>
          <span class="ordinary-text">协同人{{conditionConfig.label}}</span>
          <el-input v-model="form.rules[0].assistantScore" @change="validate" :class="{'input-is-error': formValidationResult.rules[0].fields.some(v => v === 'assistantScore')}" class="count-input" placeholder="请输入内容"></el-input>
          <span class="ordinary-text">{{conditionConfig.unit}}</span>
        </div>
      </el-form-item>

      <el-form-item>
        <el-select v-model="form.custFieldOfTask" @change="changeCustFieldOfTask" v-if="form.category === 'customizedFields'" placeholder="请选择">
          <el-option
            v-for="item in taskTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <span class="ordinary-text" v-if="form.custFieldOfTask">的</span>
        <el-select v-model="form.customizedField" v-if="form.custFieldOfTask" @change="changeCustomizedField" :disabled="!taskSelectFields.length" placeholder="请选择">
          <el-option
            v-for="item in taskSelectFields"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>

      <div v-if="conditionVisible" class="condition-wrap">
        <specific-condition
          v-for="(item, index) in form.rules"
          :item="item"
          :key="index"
          :label="form.effectCondition !== 2 ?`条件${index+1}` : '排除条件'"
          :rules="form.rules"
          :config="conditionConfig"
          :validation="formValidationResult.rules"
          @delete-condition="modifyCondition"
          @update="updateCondition"
          :options="options" />

        <base-button v-if="form.effectCondition !== 2" type="only-text" @event="modifyCondition({action: 'add', })">添加条件</base-button>
      </div>

    </el-form>
    <div class="dialog-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="onSubmit" :disabled="pending">确 定</el-button>
    </div>
  </base-modal>
</template>

<script>
import {createPerformanceRule, getFieldsForPerformance, updatePerformanceRule} from '@src/api/PerformanceApi';
import SpecificCondition from './SpecificCondition.vue';

export default {
  name: 'setting-rule-dialog',
  props: {
    allTypes: {
      type: Object,
      default: () => ({})
    },
  },
  data() {
    return {
      visible: false,
      pending: false,
      submitted: false,
      performanceRule: {},
      includeTypes: [
        {
          label: '全部',
          value: 0
        },
        {
          label: '仅包含',
          value: 1
        },
        {
          label: '仅排除',
          value: 2
        }
      ],
      calculations: [
        {
          label: '按毛利',
          value: 'profit'
        },
        {
          label: '按营收金额',
          value: 'sale'
        },
        {
          label: '按工单数量',
          value: 'amount'
        }
      ],
      categories: [
        {
          label: '工单类型',
          value: 'taskTypes',
        },
        {
          label: '服务类型',
          value: 'serviceTypes',
        },
        {
          label: '服务内容',
          value: 'serviceContents',
        },
        {
          label: '自定义字段',
          value: 'customizedFields',
        },
      ],
      allTaskSelectFields: {},
      taskSelectFields: [],
      form: {
        ruleName: '',
        ruleDesc: '',
        ruleType: 0,
        effect: 1, // 是否启用
        rewardType: 'profit', // 计算方式
        effectCondition: 0, // 生效条件
        category: '', // 工单类型、服务类型、服务内容或者 自定义字段
        custFieldOfTask: '',
        customizedField: '',
        rules: [
          {
            types: [],
            executorScore: 0,
            assistantScore: 0,
          },
        ],
      },
      formValidation: {
        ruleName(form) {
          let val = form.ruleName;
          if (val) return { field: 'ruleName', value: val, status: 0};
          return {
            field: 'ruleName',
            value: val,
            status: 1,
            msg: '必填',
          }
        },
        ruleDesc(form) {
          let val = form.ruleDesc;
          if (val) return { field: 'ruleDesc', value: val, status: 0};
          return {
            field: 'ruleDesc',
            value: val,
            status: 1,
            msg: '必填',
          }
        },
        category(form) {
          const {effectCondition, category, } = form;
          if (!effectCondition) return { field: 'category', value: category, status: 0};
          if (category) return { field: 'category', value: category, status: 0};
          return {
            field: 'category',
            value: category,
            status: 1,
            msg: '必选',
          }
        },
        custFieldOfTask(form) {
          const {custFieldOfTask, category, } = form;
          if (category !== 'customizedFields') return { field: 'custFieldOfTask', value: custFieldOfTask, status: 0};
          if (custFieldOfTask) return { field: 'custFieldOfTask', value: custFieldOfTask, status: 0};
          return {
            field: 'custFieldOfTask',
            value: custFieldOfTask,
            status: 1,
            msg: '必选',
          }
        },
        customizedField(form) {
          const {custFieldOfTask, category, customizedField} = form;
          if (category !== 'customizedFields') return { field: 'customizedField', value: customizedField, status: 0};
          if (!custFieldOfTask) return { field: 'customizedField', value: customizedField, status: 0};
          if (customizedField) return { field: 'customizedField', value: customizedField, status: 0};
          return {
            field: 'customizedField',
            value: customizedField,
            status: 1,
            msg: '必选',
          }
        },
        rules(form) {
          const rules = form.rules;

          return rules.map(rule => {
            const {ruleType, effectCondition, rewardType, } = form;
            let errFields = [];
            let executorScore = Number(rule.executorScore);
            let assistantScore = Number(rule.assistantScore);

            if (!ruleType) {
              // 计分制
              if (effectCondition && (!rule.types || !rule.types.length)) {
                // 部分生效 验证 选择类型
                errFields.push('types');
              }
              if (isNaN(executorScore) || typeof executorScore !== 'number' || executorScore < 0) {
                errFields.push('executorScore');
              }

              if (isNaN(assistantScore) || typeof assistantScore !== 'number' || assistantScore < 0) {
                errFields.push('assistantScore');
              }
              if (errFields.length) {
                return {
                  status: 1,
                  msg: '请正确填写',
                  fields: errFields,
                }
              }
              return {status: 0, fields: []};
            }

            // 奖金 全部生效
            if (effectCondition && (!rule.types || !rule.types.length)) {
              // 部分生效 验证 选择类型
              errFields.push('types');
            }

            if (rewardType !== 'amount') {
              // 按百分比计算
              // || executorScore > 100  || assistantScore > 100
              if (isNaN(executorScore) || typeof executorScore !== 'number' || executorScore < 0) {
                errFields.push('executorScore');
              }

              if (isNaN(assistantScore) || typeof assistantScore !== 'number' || assistantScore < 0) {
                errFields.push('assistantScore');
              }

            } else {
              // 按整数计算
              if (!Number(rule.executorScore)) {
                errFields.push('executorScore');
              }

              if (!Number(rule.assistantScore)) {
                errFields.push('assistantScore');
              }
            }
            if (errFields.length) {
              return {
                status: 1,
                msg: '请正确填写',
                fields: errFields,
              }
            }

            return {status: 0, fields: []};
          })
        }
      },
      formValidationResult: {
        ruleName: null,
        ruleDesc: null,
        ruleType: null,
        rewardType: null,
        effectCondition:  null,
        category: null,
        custFieldOfTask: null,
        customizedField: null,
        rules: [{status: 0, fields: []}],
      },

    }
  },
  computed: {
    taskTypes() {
      return this.allTypes.taskTypes || [];
    },
    serviceTypes() {
      return this.allTypes.serviceTypes || [];
    },
    serviceContents() {
      return this.allTypes.serviceContents || [];
    },
    options() {
      const {form, allTypes, } = this;

      if (form.category !== 'customizedFields') {
        return allTypes[form.category] || [];
      }

      if (form.customizedField) {
        return this.taskSelectFields.filter(f => f.value === form.customizedField)[0].dataSource;
      }
      return [];
    },
    conditionVisible() {
      let arr = ['taskTypes', 'serviceTypes', 'serviceContents'];

      if (arr.some(key => key === this.form.category)) {
        return true;
      }
      return !!this.form.customizedField;
    },
    conditionConfig() {
      const {ruleType, rewardType} = this.form;
      let prefix = '';
      if (this.form.effectCondition === 2) {
        prefix = '排除后';
      }

      if (!ruleType) {
        return {
          label: '每单计',
          unit: '分',
          prefix,
        }
      }

      if (ruleType && rewardType !== 'amount') {
        return {
          label: '每单得',
          unit: '%',
          prefix,
        }
      }

      return {
        label: '每单得',
        unit: '元',
        prefix,
      };
    },
    title() {
      return this.performanceRule.id ? '编辑绩效规则' : '新增绩效规则';
    },
    action() {
      return this.performanceRule.id ? 'edit' : 'create';
    }
  },
  mounted() {
  },
  methods: {
    onSubmit() {
      this.submitted = true;
      if (!this.validateForm()) return;
      const params = this.buildParam();

      this.pending = true;
      let fn = this.action === 'create' ? createPerformanceRule : updatePerformanceRule;

      fn(params)
        .then(res => {
          if (!res.status) {
            this.pending = false;
            this.visible = false;
            // refresh list
            this.$emit('refresh-rules');
            this.reset();
          }
        })
        .catch(e => console.error('e', e));

    },
    validateForm() {
      let keysOfValidation = Object.keys(this.formValidation);

      let res = keysOfValidation.map(key => {
        const res = this.formValidation[key](this.form);

        this.formValidationResult[key] = res.msg || null;
        if (key !== 'rules') return !res.status;
        this.formValidationResult.rules = res;
        return res.every(r => !r.status);
      });
      return res.every(r => r);
    },
    buildParam() {
      let {
        ruleName,
        ruleDesc,
        ruleType,
        effectCondition,
        rules,
        category,
        customizedField,
        effect,
        rewardType,
        custFieldOfTask,
      } = this.form;
      let tv = {};
      let ruleArr = [];

      rules.forEach(rule => {
        if (rule.types.length > 1) {
          ruleArr = [...ruleArr, ...rule.types.map(type => ({
            ...rule,
            types: [type]
          }))]
        } else {
          ruleArr.push(rule);
        }
      });

      return {
        id: this.performanceRule.id || '',
        ruleName,
        ruleDesc,
        ruleType,
        effectCondition,
        effect,
        ruleContents: ruleArr.map(r => {
          tv = {};
          if (category === 'taskTypes') {
            tv.settleType = 'templateId';
          } else if (category === 'serviceTypes') {
            tv.settleType = 'serviceType';
          } else if (category === 'serviceContents') {
            tv.settleType = 'serviceContent';
          } else if (category === 'customizedFields') {
            tv.settleType = 'customField';
            // tv.customField = custFieldOfTask;
            tv.customFieldValue = customizedField;
            tv.templateId = custFieldOfTask;
          }

          if (ruleType) {
            tv.rewardType = rewardType;
          }

          tv.screenMsg = r.types[0];
          tv.assPerson = r.assistantScore;
          tv.chargePerson = r.executorScore;

          return tv;
        })
      };
    },
    fetchFields(id) {
      this.form.customizedField = '';
      let selectedTaskType = this.form.custFieldOfTask;
      if (this.allTaskSelectFields[selectedTaskType]) {
        this.taskSelectFields = this.allTaskSelectFields[selectedTaskType]
        return Promise.resolve();
      }

      return getFieldsForPerformance(id)
        .then(({succ, data}) => {
          if (succ) {
            this.taskSelectFields = data
              .filter(({formType, setting}) => formType === 'select' && setting && !setting.isMulti)
              .map(({displayName, fieldName, setting}) => ({
                label: displayName,
                value: fieldName,
                dataSource: setting.dataSource.map(op => ({
                  label: op,
                  value: op,
                }))
              }));

            return this.allTaskSelectFields[this.form.custFieldOfTask] = this.taskSelectFields;
          }

          return this.taskSelectFields = [];
        })
        .catch(e => console.error('e', e));
    },
    updateCondition({index, newVal, }) {
      this.form.rules[index] = newVal;
      let { rules, } = this.form;

      this.$set(this.form, 'rules', [...rules.map((e, i) => {
        if (i === index) return newVal;
        return e;
      })]);

      this.validate();
    },

    modifyCondition({action, index }) {
      let { rules, } = this.form;
      let { rules: result, } = this.formValidationResult;
      if (action === 'add') {
        this.$set(this.form, 'rules', [...rules, {
          types: [],
          executorScore: 0,
          assistantScore: 0,
        }]);
        this.$set(this.formValidationResult, 'rules', [...result, {
          status: 0, fields: [],
        }]);
      } else {
        this.$set(this.form, 'rules', [...rules.filter((e, i) => i !== index)]);
        this.$set(this.form, 'formValidationResult', [...rules.filter((e, i) => i !== index)]);
      }

      this.validate();
    },
    toggleDialog(pr) {
      this.visible = !this.visible;
      // edit
      if (this.visible && pr) {

        this.performanceRule = pr;

        this.transferRuleToForm();
      }
    },
    transferRuleToForm() {
      const {ruleName, ruleDesc, ruleType, effect, effectCondition, ruleContent, } = this.performanceRule;
      const {settleType, templateId, customFieldValue, rewardType} = ruleContent[0];
      let newRules = [];
      let isSame = false;

      if (!effectCondition && ruleContent.length === 1) {
        newRules.push({
          ...ruleContent[0],
          types: [],
        })
      } else {
        ruleContent.forEach(r => {
          isSame = newRules.some(nr => nr.assPerson === r.assPerson && nr.chargePerson === r.chargePerson);
          if (isSame) {
            newRules = newRules.map(nr => {
              if (nr.assPerson === r.assPerson && nr.chargePerson === r.chargePerson) {
                nr.types = [r.screenMsg, nr.screenMsg];
              }

              return nr;
            })
          } else {
            newRules.push({
              ...r,
              types: [r.screenMsg]
            });
          }

        });

      }

      this.form = {
        ruleName,
        ruleDesc,
        ruleType,
        effect, // 是否启用
        rewardType: rewardType || 'profit',
        effectCondition: effectCondition || 0,
        category: '', // 工单类型、服务类型、服务内容或者 自定义字段
        custFieldOfTask: '',
        customizedField: '',
        rules: newRules.map(({assPerson, chargePerson, types}, index) => ({
          types,
          assistantScore: assPerson,
          executorScore: chargePerson,
        })),
      }


      if (settleType === 'templateId') {
        this.form.category = 'taskTypes'
      }

      if (settleType === 'serviceType') {
        this.form.category = 'serviceTypes'
      }

      if (settleType === 'serviceContent') {
        this.form.category = 'serviceContents'
      }

      if (settleType === 'customField') {
        this.form.category = 'customizedFields';
        this.form.custFieldOfTask = templateId;
        this.fetchFields(templateId)
          .then(() => {
            this.form.customizedField = customFieldValue;
          })
      }
      this.formValidationResult.rules = newRules.map(() => ({
        status: 0,
        fields: [],
      }));
    },
    // input change event
    validate() {
      if (this.submitted) {
        this.validateForm();
      }
    },
    changeCustomizedField() {
      this.clearSomeFieldsVal(['rules']);
      this.validate();
    },
    changeCustFieldOfTask() {
      this.fetchFields(this.form.custFieldOfTask);

      this.clearSomeFieldsVal(['rules', 'customizedField']);
    },
    changeRuleType() {
      let fields = ['category', 'custFieldOfTask', 'customizedField', 'rules', 'rewardType', 'effectCondition'];
      this.clearSomeFieldsVal(fields);

      this.validate();
    },
    changeCategory() {
      let fields = ['rules', 'custFieldOfTask', 'customizedField'];
      this.clearSomeFieldsVal(fields);
      this.validate();
    },
    changeEffectCondition() {
      let fields = ['category', 'custFieldOfTask', 'customizedField', 'rules'];
      this.clearSomeFieldsVal(fields);
      this.clearSomeFieldsVal(fields);
    },
    // clear val
    reset() {
      this.clearSomeFieldsVal(['ruleName', 'ruleDesc', 'category', 'custFieldOfTask', 'customizedField', 'effectCondition', 'ruleType', 'rewardType', 'rules']);
      this.performanceRule = {};
    },
    clearSomeFieldsVal(fields) {
      let defaultValIsEmptyString = ['ruleName', 'ruleDesc', 'category', 'custFieldOfTask', 'customizedField'];
      let defaultValIsZero = ['effectCondition', 'ruleType'];
      let key = null;

      for (let i = 0;i <= fields.length;i++) {
        key = fields[i];
        if (key === 'rewardType') {
          this.form[key] = 'profit';
          continue;
        }

        if (key === 'rules') {
          this.$set(this.form, 'rules', [{
            types: [],
            executorScore: 0,
            assistantScore: 0,
          }]);
          this.$set(this.formValidationResult, 'rules', [{
            status: 0, fields: [],
          }]);
          continue;
        }

        if (defaultValIsZero.indexOf(key) !== -1) {
          this.form[key] = 0;
          continue;
        }

        if (defaultValIsEmptyString.indexOf(key) !== -1) {
          this.form[key] = '';
          continue;
        }
      }

    },
  },
  components: {
    [SpecificCondition.name]: SpecificCondition,
  }
}
</script>

<style lang="scss">


  .el-textarea textarea{
    padding: 5px 10px;
  }
  .el-form-item__error {
    top: auto;
  }

  .el-form-item {
    margin-bottom: 10px!important;
  }

  .el-radio {
    height: 32px;
    line-height: 32px;
  }

  .input-is-error input {
    border-color: #f56c6c;
  }

  .ordinary-text {
    padding: 0 10px;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
  }

  .base-condition-wrap {
    .el-form-item__content {
      display: flex;
    }
    .special-condition-wrap {
      .el-input {
        width: 80px;
      }
    }
  }


  .condition-wrap {
    .specific-condition-container {
      border-top: 1px dashed #ccc;
    }

    .specific-condition-container:last-child {
      border-bottom: 1px dashed #ccc;
    }
  }

</style>