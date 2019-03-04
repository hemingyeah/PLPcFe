<template>
  <el-form-item class="specific-condition-container" :label="label">

    <el-select
      v-model="value.types"
      multiple
      collapse-tags
      style="margin-left: 20px;"
      placeholder="请选择">
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value">
      </el-option>
    </el-select>
    <div class="detail">
      <p>
        <span class="ordinary-text">负责人每单计</span>
        <el-input v-model="value.executorScore" class="count-input" placeholder="请输入内容"></el-input>
        <span class="ordinary-text">分</span>
      </p>
      <p>
        <span class="ordinary-text">协调人每单计</span>
        <el-input v-model="value.assistantScore" class="count-input" placeholder="请输入内容"></el-input>
        <span class="ordinary-text">分</span>
      </p>
    </div>


    <el-button class="delete-contact-btn" type="danger" style="height: 32px;">删除</el-button>



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
  },
  data() {
    return {
      value: {
        types: [],
        executorScore: 0,
        assistantScore: 0,

      },
    }
  },
  mounted() {
    console.log('mounted');
  },
  methods: {},
}
</script>

<style lang="scss">

  .specific-condition-container {
    display: flex;
    padding: 10px 0;

    .el-form-item__content {
      margin-left: 0!important;
      flex-grow: 1;
      display: flex;
      /*justify-content: space-between;*/

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