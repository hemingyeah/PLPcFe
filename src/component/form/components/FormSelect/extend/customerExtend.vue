<template>
  <div class="form-select">
    <div class="flex-x">
      <el-select
        :value="value"
        filterable
        remote
        clearable
        :placeholder="`${extendData[field.mainKey]==='' || extendData[field.mainKey]===undefined ?`请先选择${field.extendDisplayName}`:field.placeholder}`"
        @focus="remoteMethod"
        :disabled="extendData[field.mainKey]==='' || extendData[field.mainKey]===undefined?true:false"
        :remote-method="remoteMethod"
        :loading="loading"
        @change="update"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.value"
          :value="item.value"
        ></el-option>
      </el-select>
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
import SettingMixin from "@src/component/form/mixin/setting";
/** *
 *  高级搜索组件  关联的搜索 1对多
 * extendData  String 关联的数据
 * extendDisplayName String 关联数据的名称
 */

export default {
  name: "customer-extend",
  mixins: [SettingMixin],
  props: {
    values: {
      type: String,
      default: () => ""
    },
    field: {
      type: Object,
      default: () => ({})
    },
    setting: {
      type: Object,
      default: () => ({})
    },
    extendData: {
      type: Object
    },
    extendDisplayName: {
      type: String,
      default: () => ""
    },
    /** 用于获取FormDesign实例 */
    getContext: Function
  },
  computed: {
    value() {
      return this.values;
    }
  },
  watch: {
    extendData: {
      handler(newValue, oldValue) {
        if (
          !newValue[this.field.mainKey] &&
          newValue[this.field.mainKey] !== 0 &&
          newValue[this.field.fieldName] !== "" &&
          newValue[this.field.fieldName] !== undefined
        ) {
          this.$emit("update", { newValue: "", field: this.field });
        }
      },
      deep: true,
      immediate: true
    }
  },
  data() {
    return {
      options: [],
      loading: false
    };
  },
  mounted() {},
  methods: {
    remoteMethod() {
      this.loading = true;
      this.$http[this.field.searchType === "GET" ? "get" : "post"](
        this.field.searchUrl,
        this.extendData || {}
      ).then(res => {
        if (res.list.length > 0 && this.field.resTranslate) {
          res.list = res.list.map(res_ => {
            return this.field.resTranslate(res_);
          });
          this.options = res.list;
        }
        this.loading = false;
      });
    },
    update(value) {
      this.$emit("update", { newValue: value, field: this.field });
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