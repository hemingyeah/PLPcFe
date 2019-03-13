<template>
  <el-form-item class="specific-condition-container" :label="label">

    <el-select
      :value="value.types"
      @input="(val) => updateVal({val, action: 'types', })"
      multiple
      collapse-tags
      style="margin-left: 20px;"
      :class="{'input-is-error': currentItemValidation.fields.some(k => k === 'types')}"
      placeholder="请选择">
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :disabled="otherConditionValue.some(val => val === item.value)"
        :value="item.value">
      </el-option>
    </el-select>
    <div class="detail">
      <p>
        <span class="ordinary-text">{{config.prefix}}负责人{{config.label}}</span>
        <el-input :value="value.executorScore" @input="(val) => updateVal({val, action: 'executorScore', })" :class="{'input-is-error': currentItemValidation.fields.some(k => k === 'executorScore')}" class="count-input" placeholder="请输入内容"></el-input>
        <span class="ordinary-text">{{config.unit}}</span>
      </p>
      <p>
        <span class="ordinary-text">{{config.prefix}}协同人{{config.label}}</span>
        <el-input :value="value.assistantScore" @input="(val) => updateVal({val, action: 'assistantScore', })" :class="{'input-is-error': currentItemValidation.fields.some(k => k === 'assistantScore')}" class="count-input" placeholder="请输入内容"></el-input>
        <span class="ordinary-text">{{config.unit}}</span>
      </p>
    </div>

    <el-button class="delete-contact-btn" type="danger" style="height: 32px;" v-if="index > 1" @click="dele">删除</el-button>
    <!--<base-button type="danger" @event="deleteCondition">添加条件</base-button>-->
  </el-form-item>
</template>

<script>
export default {
  name: "specific-condition",
  props: {
    label: {
      type: String,
      default: '条件1'
    },
    options: {
      type: Array,
      default: () => ([])
    },
    rules: {
      type: Array,
      default: () => ([])
    },
    validation: {
      type: Array,
      default: () => ([])
    },
    config: {
      type: Object,
      default: () => ({})
    },
  },
  data() {
    return {
    }
  },
  computed: {
    index() {
      // 这里的index是从1开始
      if (this.label === '排除条件') return 1;
      return Number(this.label.match(/\d/g)[0]);
    },
    value() {
      return this.rules[this.index - 1];
    },
    currentItemValidation() {
      return this.validation[this.index - 1];
    },
    otherConditionValue() {
      let arr = [];
      this.rules
        .filter((el, index) => index !== this.index - 1)
        .map(({types}) => types)
        .forEach(types => {
          // types 是(每个条件选择了哪几个工单或者自定义字段的id)一个数组， 直接return map后的结果会是一个二维数组
          arr = [...arr, ...types]
        });
      return arr;
    }
  },
  mounted() {
    console.log('mounted');
  },
  methods: {
    updateVal({action, val}) {
      let newVal = {
        ...this.value,
        [action]: val,
      };
      this.$emit('update', {
        newVal,
        index: this.index - 1,
      });
    },
    dele() {
      this.$emit('delete-condition', {
        action: 'delete',
        index: this.index - 1,
      })
    }
  },
}
</script>

<style lang="scss">
  .input-is-error input {
    border-color: #f56c6c;
  }

  .specific-condition-container {
    display: flex;
    padding: 10px 0;

    .el-form-item__content {
      margin-left: 0!important;
      flex-grow: 1;
      display: flex;

      .el-input, .el-select {
        height: 32px;
        margin: 0!important;
      }

      .detail {
        margin-left: 20px;
        flex-grow: 1;
        padding-left: 12px;

        .el-select {
          align-items: center;
        }

        .ordinary-text {
          padding: 0 10px;
        }

        p {
          margin: 0;
          line-height: 32px;

          .count-input {
            width: 60px;
          }
        }
        P:first-child {
          margin-bottom: 10px;
        }
      }
    }
  }

</style>