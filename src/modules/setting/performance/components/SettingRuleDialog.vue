<template>
  <base-modal :title="title" :show.sync="visible" width="800px" class="base-import-modal" @closed="reset">
    <el-form ref="form" :model="form" label-width="80px">

      <el-form-item label="规则名称" :error="formValidationResult.ruleName" required>
        <el-input v-model="form.ruleName" @change="validate" placeholder="[最多6个字]" :maxlength="6"></el-input>
      </el-form-item>
      <el-form-item label="规则说明" :error="formValidationResult.ruleDesc" required>
        <el-input v-model="form.ruleDesc" @change="validate" type="textarea" placeholder="[最多500个字]" :maxlength="500"></el-input>
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
          <el-tooltip :content="conditionConfig.tip" placement="top" effect="light">
            <el-input v-model="form.rules[0].executorScore" @change="validate" :class="{'input-is-error': formValidationResult.rules[0].fields.some(v => v === 'executorScore')}" class="count-input" placeholder="请输入内容"></el-input>
          </el-tooltip>
          <span class="ordinary-text">{{conditionConfig.unit}}</span>
          <span class="ordinary-text">协同人{{conditionConfig.label}}</span>
          <el-tooltip :content="conditionConfig.tip" placement="top" effect="light">
            <el-input v-model="form.rules[0].assistantScore" @change="validate" :class="{'input-is-error': formValidationResult.rules[0].fields.some(v => v === 'assistantScore')}" class="count-input" placeholder="请输入内容"></el-input>
          </el-tooltip>
          <span class="ordinary-text">{{conditionConfig.unit}}</span>
        </div>
      </el-form-item>

      <el-form-item class="base-condition-wrap">
        <el-select v-model="form.custFieldOfTask" :class="{'input-is-error': formValidationResult.custFieldOfTask}" @change="changeCustFieldOfTask" v-if="form.category === 'customizedFields'" placeholder="请选择">
          <el-option
            v-for="item in taskTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <span class="ordinary-text" v-if="form.custFieldOfTask">的</span>
        <el-select v-model="form.customizedField" :class="{'input-is-error': formValidationResult.customizedField}" v-if="form.custFieldOfTask" @change="changeCustomizedField" :disabled="!taskSelectFields.length" placeholder="请选择">
          <el-option
            v-for="item in taskSelectFields"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="warning">
        <span class="warning">{{warning}}</span>
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
      warning: '',
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
              if (isNaN(executorScore) || typeof executorScore !== 'number' || executorScore < 0 || executorScore > 9999 || (/\./g.test(executorScore) && executorScore.toString().split('.')[1].length > 1)) {
                errFields.push('executorScore');
              }

              if (isNaN(assistantScore) || typeof assistantScore !== 'number' || assistantScore < 0 || assistantScore > 9999 || (/\./g.test(assistantScore) && assistantScore.toString().split('.')[1].length > 1)) {
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
              if (isNaN(executorScore) || typeof executorScore !== 'number' || executorScore < 0 || executorScore > 100 || (/\./g.test(executorScore) && executorScore.toString().split('.')[1].length > 1)) {
                errFields.push('executorScore');
              }

              if (isNaN(assistantScore) || typeof assistantScore !== 'number' || assistantScore < 0 || assistantScore > 100 || (/\./g.test(assistantScore) && assistantScore.toString().split('.')[1].length > 1)) {
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

      // ruleType 0 计分制 1奖金制
      // rewardType

      if (!ruleType) {
        return {
          label: '每单计',
          unit: '分',
          prefix,
          tip: '请输入数字，可以有一位小数，最大9999'
        }
      }

      if (ruleType && rewardType !== 'amount') {
        return {
          label: '每单得',
          unit: '%',
          prefix,
          tip: '请输入数字，可以有一位小数，最大100'
        }
      }

      return {
        label: '每单得',
        unit: '元',
        prefix,
        tip: '请输入数字，可以有一位小数，最大9999'
      };
    },
    title() {
      return this.performanceRule.id ? '编辑绩效规则' : '新增绩效规则';
    },
    action() {
      return this.performanceRule.id ? 'edit' : 'create';
    }
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
          this.pending = false;

          if (res.status) {
            return this.$platform.notification({
              title: '失败',
              message: res.message || '',
              type: 'error',
            });
          }

          this.visible = false;
          this.$platform.notification({
            title: this.action === 'create' ? '添加成功' : '更新成功',
            type: 'success',
          });

          this.$emit('refresh-rules');
          this.reset();
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
        return Promise.resolve(this.taskSelectFields);
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

      // 把负责人、协调人分值相同的条件合并
      ruleContent.forEach(singleRule => {
        if (newRules.every(nr => nr.assPerson !== singleRule.assPerson && nr.chargePerson !== singleRule.chargePerson)) {
          newRules.push(singleRule);
        } else {
          newRules = newRules.map(nr => {
            if (nr.assPerson === singleRule.assPerson && nr.chargePerson === singleRule.chargePerson) {
              return {
                assPerson: nr.assPerson,
                chargePerson: nr.chargePerson,
                settleType: nr.settleType,
                screenMsg: `${nr.screenMsg},${singleRule.screenMsg}`
              }
            }
            return nr
          })
        }
      });

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
        rules: newRules.map(({assPerson, chargePerson, screenMsg}, index) => ({
          types: screenMsg ? screenMsg.split(',') : [],
          assistantScore: assPerson,
          executorScore: chargePerson,
        })),
      };

      if (settleType === 'templateId') {
        this.form.category = 'taskTypes';
        // 把选中的工单类型中被删除的过滤掉
        this.form.rules = this.form.rules.map(condition => {
          condition.types = condition.types.filter(t => this.taskTypes.some(template => template.value === t));

          if (!condition.types.length) {
            condition.placeHolder = '工单类型已被删除请重选';
            this.warning = '工单类型已被删除，请重新编辑该绩效规则';
          }

          return condition
        })
        // .filter(condition => condition.types.length)
      }

      if (settleType === 'serviceType') {
        this.form.category = 'serviceTypes';
        // this.form.rules = this.form.rules.map(condition => {
        //   condition.types = condition.types.filter(t => this.serviceTypes.some(template => template.value === t))
        //   return condition
        // })
      }

      if (settleType === 'serviceContent') {
        this.form.category = 'serviceContents';
        // this.form.rules = this.form.rules.map(condition => {
        //   condition.types = condition.types.filter(t => this.serviceContents.some(template => template.value === t))
        //   return condition
        // })
      }

      if (settleType === 'customField') {
        this.form.category = 'customizedFields';
        this.form.custFieldOfTask = templateId;
        // 工单被删除， 把工单往下的值清空
        if (this.taskTypes.every(t => t.value !== templateId)) {
          this.warning = '工单类型已被删除，请重新编辑该绩效规则';
          return this.changeCategory();
        }

        // 选项被删除
        if (!templateId) return;
        this.fetchFields(templateId)
          .then((res) => {
            let selectedField = res.filter(field => field.value === customFieldValue) || [];

            if (res.length && selectedField.length) {
              // 处理选项被删除的情况
              this.form.rules = this.form.rules.map(rule => {
                // 把被删除的选项过滤掉
                rule.types = rule.types.filter(type => selectedField[0].dataSource.some(option => option.value === type));
                if (!rule.types.length) {
                  this.warning = '自定义字段的选项已被删除，请重新编辑该绩效规则';
                }
                // rule.placeHolder = '选项已被删除请重选';
                return rule;
              });

              return this.form.customizedField = customFieldValue;
            }
            this.warning = '自定义字段已被删除，请重新编辑该绩效规则';
            // res 是条件被选中的字段，如果长度为0就是选中的字段被删除了， reset
            this.clearSomeFieldsVal(['rules', 'customizedField']);
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
      this.validate();
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
      this.submitted = false;
      this.warning = '';
      this.formValidationResult = {
        ruleName: null,
        ruleDesc: null,
        ruleType: null,
        rewardType: null,
        effectCondition:  null,
        category: null,
        custFieldOfTask: null,
        customizedField: null,
        rules: [{status: 0, fields: []}],
      };
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

  .warning {
    color: #f56c6c;
    font-size: 12px;
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
