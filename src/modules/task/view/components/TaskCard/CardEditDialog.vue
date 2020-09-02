<template>
  <base-modal class="task-card-edit-dialog" :title="title" :show.sync="visible" width="700px" @closed="reset">
    <div class="base-modal-content" v-if="init">
      <form-builder ref="form" :fields="fields" :value="form" @update="update">
        <!-- start 用时时间 -->
        <template slot="usedTime" slot-scope="{ field, value }" v-if="isHoursRecord">
          <form-item :label="field.displayName">
            <input class="usedTime" type="number" :value="value" :placeholder="field.placeHolder" disabled />
          </form-item>
        </template>
        <!-- end 用时时间 -->

        <!-- start 行程距离 -->
        <template slot="distance" slot-scope="{ field }" v-if="isHoursRecord">
          <form-item :label="field.displayName">
            <input class="distance" type="number" v-model="form.distance" oninput="value=value.replace(/[^\d.]/g, '').replace(/\.{2,}/g, '.').replace('.', '$#$').replace(/\./g, '').replace('$#$', '.').replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3').replace(/^\./g, '')" />
          </form-item>
        </template>
        <!-- end 行程距离 -->
      </form-builder>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="submit">保 存</el-button>
    </div>
  </base-modal>
</template>

<script>
/* util */
import * as Utils from '@src/component/form/util';

export default {
  name: 'task-card-edit-dialog',
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
    },
    action: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      visible: false,
      init: false,
      form: {}
    }
  },
  computed: {
    /**
    * @description 弹窗标题
    */
    title() {
      return this.action == 'edit' ? '编辑组件信息' : '添加组件信息';
    }
  },
  methods: {
    /**
    * @description 更新表单数据
    */
    update({ field, newValue, oldValue }) {
      let { fieldName, displayName } = field;

      if (this.$appConfig.debug) {
        console.info(`[FormBuilder] ${displayName}(${fieldName}) : ${JSON.stringify(newValue)}`)
      }

      this.$set(this.form, fieldName, newValue);

      // 计算工时记录用时时间
      if (this.isHoursRecord) {
        if (fieldName == 'startTime' || fieldName == 'endTime') this.setUsedTime();
      }
    },
    /**
    * @description 弹窗关闭重置数据
    */
    reset() {
      this.form = {};
      this.init = false;
    },
    /**
    * @description 打开弹窗
    */
    openDialog() {
      this.visible = true;

      this.$nextTick(()=> {
        this.unpack();
        this.init = true;
      })
    },
    /**
    * @description 将数据拆解成自定义表单可接收的数据
    */
    unpack() {
      let { attribute = {} } = this.value;
      let result = Utils.initialize(this.fields, { attribute });
      this.form = result;
    },
    /**
    * @description 表单验证
    */
    submit() {
      this.$refs.form
        .validate()
        .then(async valid => {
          if (!valid) return Promise.reject('validate fail.');

          // 判断工时记录的开始时间和结束时间
          if (this.isHoursRecord) {
            let { startTime, endTime } = this.form;
            if (startTime && endTime && startTime > endTime) return this.$platform.alert('结束时间要晚于开始时间');
          }

          this.$emit('submit', this.form);
        })
        .catch(err => {
          console.error(err);
        })
    },
    /** 
    * @description 计算用时时间
    * 结束时间-开始时间
    */
    setUsedTime() {
      let { startTime, endTime } = this.form;
      if (startTime && endTime) {
        let st = new Date(startTime).getTime();
        let et = new Date(endTime).getTime();
        let diff = (Math.abs(et - st) / 1000 / 60 / 60).toFixed(2);

        this.$set(this.form, 'usedTime', diff);
      }
    }
  }
}
</script>

<style lang="scss">
.task-card-edit-dialog {
  .usedTime,
  .distance {
    width: 100%;
  }
}
</style>
