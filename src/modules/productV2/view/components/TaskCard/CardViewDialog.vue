<template>
  <base-modal class="task-card-view-dialog" title="详情" :show.sync="visible" width="700px">
    <div class="base-modal-content">
      <form-view :fields="fields" :value="value">
        <!-- start 用时时间 -->
        <template slot="usedTime" slot-scope="{ field, value }" v-if="isHoursRecord">
          <div class="form-view-row">
            <label>{{ field.displayName }}</label>
            <div class="form-view-row-content task-card-view-row">
              {{ value }}
              <el-button type="text" size="mini" @click="openAddressDialog" v-if="isMobileData">详情</el-button>
            </div>
          </div>
        </template>
        <!-- end 用时时间 -->

        <!-- start 行程距离 -->
        <template slot="distance" slot-scope="{ field, value }" v-if="isHoursRecord">
          <div class="form-view-row">
            <label>{{ field.displayName }}</label>
            <div class="form-view-row-content task-card-view-row">
              {{ value }}
              <el-button type="text" size="mini" @click="openAddressDialog" v-if="isMobileData">详情</el-button>
            </div>
          </div>
        </template>
        <!-- end 行程距离 -->
      </form-view>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">确 定</el-button>
    </div>
  </base-modal>
</template>

<script>
export default {
  name: 'task-card-view-dialog',
  props: {
    fields: {
      type: Array,
      default: () => ([])
    },
    value: {
      type: Object,
      default: () => ({
        attribute: {}
      })
    },
    isHoursRecord: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      visible: false
    }
  },
  computed: {
    /** 
    * @description 是否移动端生成的数据
    */
    isMobileData() {
      let { fromType } = this.value?.attribute || {};

      return fromType == 2;
    }
  },
  methods: {
    /** 
    * @description 打开详情弹窗
    */
    openDialog() {
      this.visible = true;
    },
    /** 
    * @description 位置详情
    */
    openAddressDialog() {
      this.visible = false;

      let data = {
        action: 'location',
        cardInstance: this.value.attribute
      }

      this.$emit('action', data);
    }
  }
}
</script>

<style lang="scss">
.task-card-view-dialog {
  .task-card-view-row {
    white-space: nowrap;
    line-height: 20px;

    .el-button {
      padding: 4px;
    }
  }
}
</style>
