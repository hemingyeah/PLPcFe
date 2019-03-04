<template>
  <base-modal :title="title" :show.sync="visible" width="800px" class="base-import-modal">
    <el-form ref="form" :model="form" label-width="80px">


      <el-form-item label="规则名称">
        <el-input v-model="form.ruleName"></el-input>
      </el-form-item>

      <el-form-item label="规则说明">
        <el-input v-model="form.name" type="textarea"></el-input>
      </el-form-item>

      <el-form-item label="类别">
        <el-radio-group v-model="form.ruleType">
          <el-radio label="0">计分制</el-radio>
          <el-radio label="1">奖金制</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="规则内容">
        按照工单完成数量
      </el-form-item>

      <el-form-item label="生效条件">
        <el-select v-model="form.include" placeholder="请选择">
          <el-option
            v-for="item in includeTypes"
            :key="item.value"
            :label="item.name"
            :value="item.value">
          </el-option>
        </el-select>

        <span class="ordinary-text">为</span>
        <el-select v-model="form.category" v-if="form.include !== 'all'" placeholder="请选择">
          <el-option
            v-for="item in categories"
            :key="item.value"
            :label="item.name"
            :value="item.value">
          </el-option>
        </el-select>

        <el-select v-model="form.custFieldOfTask" v-if="form.category === 'customizedFields'" placeholder="请选择">
          <el-option
            v-for="item in taskTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>


      </el-form-item>

      <div v-if="conditionVisible" class="condition-wrap">
        <specific-condition :options="options"></specific-condition>
      </div>

    </el-form>

  </base-modal>
</template>

<script>
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
      includeTypes: [
        {
          name: '全部',
          value: 'all'
        },
        {
          name: '仅包含',
          value: 'include'
        },
        {
          name: '仅排除',
          value: 'exclude'
        }
      ],
      categories: [
        {
          name: '工单类型',
          value: 'taskTypes',
        },
        {
          name: '服务类型',
          value: 'serviceTypes',
        },
        {
          name: '服务内容',
          value: 'serviceContents',
        },
        {
          name: '自定义字段',
          value: 'customizedFields',
        },
      ],
      form: {
        ruleName: '',
        ruleDesc: '',
        effect: '',
        effectCondition: '',
        ruleType: '0',
        ruleContent: '',
        //
        include: 'include',
        category: 'taskTypes',
        custFieldOfTask: '',
        customizedField: '',
        rules: [],
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

      return allTypes[form.category] || [];
    },
    conditionVisible() {
      let arr = ['taskTypes', 'serviceTypes', 'serviceContents'];

      if (arr.some(key => key === this.form.category)) {
        return true;
      }

      if (this.form.category === 'customizedFields' && this.customizedField) {
        return true;
      }

      return false;
    }
  },
  mounted() {

    console.log('taskTypes', this.allTypes);

  },
  methods: {
    toggleDialog() {
      this.visible = !this.visible;
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

  .condition-wrap {

    .specific-condition-container {
      border-top: 1px dashed #ccc;
    }

    .specific-condition-container:last-child {
      border-bottom: 1px dashed #ccc;
    }

  }

</style>