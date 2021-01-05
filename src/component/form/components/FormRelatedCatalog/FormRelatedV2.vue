<template>
  <div class="flex-x al-start" id="form-related-catalog">
    <biz-form-remote-select
      ref="product"
      :field="field"
      v-model="comValue"
      value-key="id"
      :remote-method="remoteMethod"
      @input="update"
      :cleared="true"
      :placeholder="placeholder || '请选择产品类型'"
    >
      <div class="related-task-option" slot="option" slot-scope="{ option }">
        <div class="related-task-option-desc">
          <p>
            <span>{{ option.pathName }}</span>
          </p>
        </div>
      </div>
    </biz-form-remote-select>
    <el-button v-show="comValue.length" class="mar-l-10" @click="previewCatalog">查看</el-button>
  </div>
</template>

<script>
/** api */
import { searchAllcatalog } from '@src/api/ProductV2Api';

/** mixin */
import FormMixin from '@src/component/form/mixin/form';

import _ from 'lodash';

export default {
  name: 'form-related-catalog',
  mixins: [FormMixin],
  props: {
    value: {
      type: Array | String,
      default: () => [],
    },
  },
  data() {
    return {
      comValue: [],

      page: 1,
      pageSize: 20,
    };
  },
  watch: {
    value(val) {
      this.init(val);
    },
  },
  mounted() {
    this.init(this.value);
  },
  methods: {
    init(val) {
      if (val && val.length > 0) {
        let comValue = _.cloneDeep(val);
        this.comValue = comValue.map((item) => {
          item.label = item.pathName;
          return item;
        });
      }
    },
    remoteMethod(params) {
      let { keyword, pageNum, pageSize } = params;
      params = {
        page: pageNum,
        pageSize:50,
        keyWord: keyword,
      };

      return searchAllcatalog(params)
        .then((res) => {
          if (!res || !res.result || !res.result.list) return;
          res.result.list = res.result.list.map((item) =>
            Object.freeze({
              label: item.pathName,
              ...item,
            })
          );

          return res.result;
        })
        .catch((e) => console.error(e));
    },
    update(newValue) {
      console.log('newValue', newValue);
      this.inputForValue(newValue[0]);
    },
    previewCatalog(){
      if(!this.comValue.length) return

      console.log(this.comValue, this.value)
      this.$platform.openTab({
        id: `productV2_catalog_view_${this.comValue[0].id}`,
        title: '产品类型详情',
        close: true,
        url: `/productV2/catalog/view?id=${this.comValue[0].id}`
      });
    }
  },
};
</script>

<style lang="scss" scoped>
.related-task-option {
  font-size: 12px;
}
</style>
