<template>
  <base-modal :title="title" :show.sync="visible" width="800px" class="base-import-modal">
    <el-form ref="form" :model="form" label-width="80px">

      <el-form-item label="规则名称">
        <el-input v-model="form.ruleName"></el-input>
      </el-form-item>
      <el-form-item label="规则说明">
        <el-input v-model="form.ruleDesc" type="textarea"></el-input>
      </el-form-item>
      <el-form-item label="类别" style="margin-bottom: 0px!important;">
        <el-radio-group v-model="form.ruleType" @change="resetOtherValueAfterChangeRuleType">
          <el-radio :label="0">计分制</el-radio>
          <el-radio :label="1">奖金制</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="规则内容">
        按照工单完成数量
      </el-form-item>

      <el-form-item label="计算方式" v-if="form.ruleType">
        <el-select v-model="form.rewardType" placeholder="请选择">
          <el-option
            v-for="item in calculations"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="生效条件" class="base-condition-wrap">
        <el-select v-model="form.effectCondition" @change="resetOtherValue" placeholder="请选择">
          <el-option
            v-for="item in includeTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>

        <span class="ordinary-text" v-if="form.effectCondition">为</span>
        <el-select v-model="form.category" v-if="form.effectCondition" @change="resetOtherValueAfterChangeCategory" placeholder="请选择">
          <el-option
            v-for="item in categories"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>

        <div v-if="!form.effectCondition" class="special-condition-wrap">
          <span class="ordinary-text">负责人{{conditionConfig.label}}</span>
          <el-input v-model="form.rules[0].executorScore" class="count-input" placeholder="请输入内容"></el-input>
          <span class="ordinary-text">{{conditionConfig.unit}}</span>
          <span class="ordinary-text">协同人{{conditionConfig.label}}</span>
          <el-input v-model="form.rules[0].assistantScore" class="count-input" placeholder="请输入内容"></el-input>
          <span class="ordinary-text">{{conditionConfig.unit}}</span>
        </div>
      </el-form-item>

      <el-form-item>
        <el-select v-model="form.custFieldOfTask" @change="fetchFields" v-if="form.category === 'customizedFields'" placeholder="请选择">
          <el-option
            v-for="item in taskTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <span class="ordinary-text" v-if="form.custFieldOfTask">的</span>
        <el-select v-model="form.customizedField" v-if="form.custFieldOfTask" :disabled="!taskSelectFields.length" placeholder="请选择">
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
          :label="`条件${index+1}`"
          :rules="form.rules"
          :config="conditionConfig"
          @delete-condition="modifyCondition"
          @update="updateCondition"
          :options="options" />

        <base-button type="only-text" @event="modifyCondition({action: 'add', })">添加条件</base-button>
      </div>

    </el-form>
    <div class="dialog-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="onSubmit" :disabled="pending">确 定</el-button>
    </div>
  </base-modal>
</template>

<script>
import {createPerformanceRule, getFieldsForPerformance} from '@src/api/PerformanceApi';
import SpecificCondition from './SpecificCondition.vue';

export default {
  name: "setting-rule-dialog",
  props: {
    allTypes: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      visible: true,
      title: '新增绩效规则',
      pending: false,
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
        ruleContent: '',
        effect: '', // 是否启用
        //
        rewardType: 'profit',
        effectCondition: 0,
        category: '',
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

      if (!ruleType) {
        return {
          label: '每单计',
          unit: '分',
        }
      }

      if (ruleType && rewardType !== 'amount') {
        return {
          label: '每单得',
          unit: '%',
        }
      }

      return {
        label: '每单得',
        unit: '元',
      };
    }
  },
  mounted() {

    console.log('taskTypes', this.allTypes);

  },
  methods: {
    onSubmit() {
      const params = this.buildParam();

      return createPerformanceRule(params)
        .then(res => {

          console.log('res', res);
        })
        .catch(e => console.error('e', e));
    },
    validateForm() {

    },
    buildParam() {
      let {
        ruleName,
        ruleDesc,
        ruleType,
        effectCondition,
        rules,
        category,
        customizedField
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
        ruleName,
        ruleDesc,
        ruleType,
        effectCondition,
        ruleContents: ruleArr.map(r => {
          tv = {};
          if (category === 'taskTypes') {
            tv.settleType = 'templateId';
          } else if (category === 'serviceTypes') {
            tv.settleType = 'serviceType';
          } else if (category === 'serviceContents') {
            tv.settleType = 'serviceContent';
          } else if (category === 'customField') {
            tv.settleType = 'customField';
            // tv.customField = custFieldOfTask;
            tv.customFieldValue = customizedField;
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
        return this.taskSelectFields = this.allTaskSelectFields[selectedTaskType]
      }

      getFieldsForPerformance(id)
        .then(({succ, data}) => {
          if (succ) {
            this.taskSelectFields = data
              .filter(({formType, setting}) => formType === 'select' && setting && !setting.isMulti)
              .map(({displayName, id, setting}) => ({
                label: displayName,
                value: id,
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
    updateCondition({index, newVal,}) {
      this.form.rules[index] = newVal;
      let { rules, } = this.form;

      this.$set(this.form, 'rules', [...rules.map((e, i) => {
        if (i === index) return newVal;
        return e;
      })]);
    },

    modifyCondition({action, index }) {
      let { rules, } = this.form;
      if (action === 'add') {
        return this.$set(this.form, 'rules', [...rules, {
          types: [],
          executorScore: 0,
          assistantScore: 0,
        }]);
      }

      this.$set(this.form, 'rules', [...rules.filter((e, i) => i !== index)]);
    },
    toggleDialog() {
      this.visible = !this.visible;
    },
    resetOtherValueAfterChangeRuleType() {
      let fields = ['ruleContent', 'category', 'custFieldOfTask', 'customizedField', 'rules', 'rewardType', 'effectCondition'];
      this.clearSomeFieldsVal(fields)
    },
    resetOtherValueAfterChangeCategory() {
      let fields = ['rules', 'custFieldOfTask', 'customizedField'];
      this.clearSomeFieldsVal(fields)
    },
    resetOtherValue() {

      let fields = ['ruleContent', 'category', 'custFieldOfTask', 'customizedField', 'rules'];
      this.clearSomeFieldsVal(fields)
    },
    // clear val
    clearSomeFieldsVal(fields) {

      let defaultValIsEmptyString = ['ruleName', 'ruleDesc', 'ruleContent', 'category', 'custFieldOfTask', 'customizedField'];
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

      // let form = {
      //   effect: '', // 是否启用
      //   // rewardType: 'profit',
      //   // effectCondition: 0,
      //   // ruleType: 0,
      //
      //   // rules: [
      //   //   {
      //   //     types: [],
      //   //     executorScore: 0,
      //   //     assistantScore: 0,
      //   //   },
      //   // ],
      // }
    },
  },
  components: {
    [SpecificCondition.name]: SpecificCondition,
  }
}
</script>

<style lang="scss">

  .ordinary-text {
    padding: 0 10px;
  }

  .el-form-item {
    margin-bottom: 10px!important;
  }

  .el-radio {
    height: 32px;
    line-height: 32px;
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