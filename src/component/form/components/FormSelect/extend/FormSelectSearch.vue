
<template>
  <div class="form-select">
    <!-- 多选 -->
    <el-select
      v-if="updata"
      :id="`form_${field.fieldName}`"
      :placeholder="placeholder"
      :clearable="clearable"
      :multiple="isMulti"
      ref="elSelect"
      filterable
      :value="value"
      @change="input"
    >
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.text"
        :value="item.value"
      >
      </el-option>
    </el-select>

  </div>
</template>

<script>
import FormMixin from '@src/component/form/mixin/form';

export default {
  name: 'form-select',
  mixins: [FormMixin],
  props: {
    value: [String, Number, Array],
    source: {
      type: Array,
    },
    clearable: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      newValue: this.value,
      updata: true
    };
  },
  watch: {
    isMulti(v) {
      this.updata = false
      setTimeout(() => {
        this.updata = true
      })
    }
  },
  computed: {
    isMulti() {
      let setting = this.field.setting || {};
      return setting.isMulti;
    },
    options() {
      let setting = this.field.setting || {};
      let dataSource = setting.dataSource || [];

      dataSource = dataSource.map((d) => {
        if (typeof d === 'string') {
          return {
            text: d,
            value: d,
          };
        }
        return d;
      });
      return this.source || dataSource || [];
    },
  },
  methods: {
    input(newValue) {
      let oldValue = null;
      this.$refs.elSelect.blur();
      this.$emit('update', { newValue, oldValue, field: this.field });
      this.$emit('input', newValue);
    },
  },
};
</script>


<style lang="scss">
.form-select {
  width: 100%;

  .el-select {
    width: 100%;

    .el-input__inner {
      padding-left: 10px;
    }

    // 超出长度多行显示
    .el-tag {
      height: auto;
      .el-select__tags-text {
        white-space: pre-wrap;
      }
    }
    // 超出单行显示'...'
    // .el-tag {
    //   position: relative;
    //   max-width: 100%;
    //   display: flex;
    //   justify-content: center;
    //   align-items: center;
    //   .el-select__tags-text {
    //     white-space: nowrap;
    //     text-overflow: ellipsis;
    //     overflow: hidden;
    //     padding-right: 10px;
    //     display: inline-block;
    //     max-width: 100%;
    //   }
    //   .el-tag__close {
    //     position: absolute;
    //     right: 0;
    //     top: 4px;
    //   }
    // }
  }
}
</style>
