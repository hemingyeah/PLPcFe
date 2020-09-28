<template>
  <div class="form-select">
    <div class="flex-x">
      <el-select
        :value="value"
        filterable
        :placeholder="`${extendData[field.mainKey]==='' || extendData[field.mainKey]===undefined ?`请先选择${field.extendDisplayName}`:field.placeholder}`"
        :disabled="extendData[field.mainKey]==='' || extendData[field.mainKey]===undefined?true:false"
        @change="update"
      >
        <el-option v-for="item in options" :key="item.id" :label="item.value" :value="item.value"></el-option>
      </el-select>
      <!-- <el-select
        :value="value"
        filterable
        remote
        clearable
        :placeholder="`${extendData[field.mainKey]==='' || extendData[field.mainKey]===undefined ?`请先选择${field.extendDisplayName}`:field.placeholder}`"
        :disabled="extendData[field.mainKey]==='' || extendData[field.mainKey]===undefined?true:false"
        :filter-method="remoteMethod"
        @focus="remoteMethod"
        @blur="filterBlur"
        @visible-change="visibleChange"
        :loading="loading"
        @change="update"
        ref="searchSelect"
      >
        <el-option v-for="item in options" :key="item.id" :label="item.value" :value="item.value"></el-option>
      </el-select>-->
      <el-tooltip
        v-if="field.formRight"
        class="item"
        effect="dark"
        :content="field.formRight.con"
        placement="bottom"
      >
        <i :class="['mar-l-15','iconfont','point',field.formRight.icon]"></i>
      </el-tooltip>
    </div>
  </div>
</template>

<script>
import SettingMixin from '@src/component/form/mixin/setting';
import { settingProps } from '@src/component/form/components/props';
/** *
 *  高级搜索组件  关联的搜索 1对多
 * extendData  String 关联的数据
 * extendDisplayName String 关联数据的名称
 */

export default {
  name: 'customer-extend',
  mixins: [SettingMixin],
  props: {
    ...settingProps,
    values: {
      type: String,
      default: () => ''
    },
    extendData: {
      type: Object
    },
    extendDisplayName: {
      type: String,
      default: () => ''
    },
    /** 用于获取FormDesign实例 */
    getContext: Function
  },
  computed: {
    value(){
      return this.values
    }
  },
  watch: {
    extendData: {
      handler(newValue, oldValue) {
        if (newValue[this.field.mainKey]) {
          this.remoteMethod();
        }
      },
      deep: true,
      immediate: true
    },
  },
  data() {
    return {
      options: [],
      loading: false,
      extend_data: ''
    };
  },
  mounted() {},
  methods: {
    remoteMethod() {
      this.loading = true;
      this.$http[this.field.searchType === 'GET' ? 'get' : 'post'](
        this.field.searchUrl,
        this.extendData || {}
      ).then(res => {
        if (res.list.length > 0) {
          res.list = res.list.map(res_ => {
            if (this.field.resTranslate) {
              res_ = this.field.resTranslate(res_);
            }
            return res_;
          });
          this.$set(this, 'options', res.list);
        } else {
          this.options = [];
        }
        this.loading = false;
      });
    },
    update(value) {
      this.$emit('update', { newValue: value, field: this.field });
    },
    visibleChange(val) {
      if (!val) {
        const input = this.$refs.searchSelect.$children[0].$refs.input;
        input.blur();
      }
    },
    filterBlur() {
      //
    }
  }
};
</script>
<style lang="scss">
.flex-x {
  display: flex;
  align-items: center;
}
.mar-l-15 {
  margin-left: 15px;
}
.point {
  cursor: pointer;
}
</style>