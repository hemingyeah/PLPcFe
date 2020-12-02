<template>
  <el-select
    class="task-search"
    :value="field.returnData?value[field.returnData]:value"
    @input="choose"
    filterable
    remote
    reserve-keyword
    :placeholder="field.placeHolder ? field.placeHolder : '请输入关键词搜索'"
    :disabled="field.disabled ? field.disabled : false"
    clearable
    :loading="loading"
    :remote-method="search"
  >
    <el-option
      v-for="item in options"
      :key="item.id"
      :label="item.pathName"
      :value="item.id"
    ></el-option>
  </el-select>
</template>

<script>
import { searchAllcatalog } from '@src/api/ProductV2Api';
import FormMixin from '@src/component/form/mixin/form';

export default {
  name: 'catalog-search',
  mixins: [FormMixin],
  props: {
    value: {
      type: String | Number | Object,
      default: '',
    },
  },
  data() {
    return {
      loading: false,
      options: [],
    };
  },
  created() {
    let options = sessionStorage.getItem(`${this.field.fieldName}_options`);

    this.options = JSON.parse(options || '[]');
  },
  methods: {
    choose(newValue) {
      let oldValue = null;
      this.$emit('update', { newValue, oldValue, field: this.field });
    },
    search(keyword) {
      this.loading = true;
      searchAllcatalog({ keyWord:keyword, pageNum: 1 })
        .then((res) => {
          this.options = res.result.list;
          this.loading = false;
          sessionStorage.setItem(
            `${this.field.fieldName}_options`,
            JSON.stringify(this.options)
          );
        })
        .catch((err) =>
          console.error('searchTaskManager function catch err', err)
        );
    },
  },
};
</script>

<style lang="scss">
.task-search {
  width: 100%;
}
</style>
