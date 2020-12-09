<template>
  <div class="form-related-task">
    <el-select
      v-model="comValue"
      style="width: 100%"
      multiple
      filterable
      remote
      reserve-keyword
      default-first-option
      popper-append-to-body
      popper-class="option-item"
      loading-text="载入更多结果......"
      no-data-text="未找到结果"
      autocomplete="on"
      value-key="id"
      @change="update"
      :placeholder="placeholder"
      :remote-method="search"
      :loading="loading"
    >
      <el-option
        v-for="option in options"
        :key="option.value"
        :label="option.taskNo"
        :value="option"
      >
        <div class="related-task-option" slot="option" slot-scope="{ option }">
          <div class="related-task-option-desc">
            <p>
              <span>{{ option.pathName }}</span>
            </p>
          </div>
        </div>
      </el-option>
    </el-select>
  </div>
</template>

<script>
/** api */
import { searchAllcatalog } from "@src/api/ProductV2Api";

/** mixin */
import FormMixin from "@src/component/form/mixin/form";

import _ from "lodash";

export default {
  name: "form-related-catalog",
  mixins: [FormMixin],
  props: {
    value: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      comValue: [],
      options: [],
      loading: false,

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
        let value = _.cloneDeep(val);
        this.comValue = value.map((item) => {
          item.value = item.id;
          return item;
        });
        this.options = value;
      }
    },
    search(keyword = "") {
      let params = {
        page: this.page,
        pageSize: this.pageSize,
        keyWord: keyword,
      };
      this.loading = true;

      searchAllcatalog(params)
        .then((res) => {
          if (!res || !res.result || !res.result.list) return;
          this.options = res.result.list.map((item) =>
            Object.freeze({
              label: item.pathName,
              ...item,
            })
          );

          return res;
        })
        .catch((e) => console.error(e))
        .finally(() => {
          this.loading = false;
        });
      //   .then(res => {
      // 	if (!res || !res.result || !res.result.content) return;
      // 	if (res.result.content) {
      // 		this.options = res.result.content.map(task => Object.freeze({
      //       value: task.id,
      //       taskNo: task.taskNo,
      // 			taskId: task.id,
      // 			templateId: task.templateId,
      // 			linkMan: task.linkMan || {},
      // 			customer: task.customerEntity || {},
      // 			products: task.products || []
      //     }));
      // 	}
      // })
    },
    update(newValue) {
      this.inputForValue(newValue[0].id);
    },
  },
};
</script>

<style lang="scss" scoped>
.form-related-task {
  width: 100%;
}

.el-select-dropdown__item {
  * {
    margin: 0;
  }
  width: 580px;
  height: auto !important;
  padding: 10px 12px;
  h3 {
    font-size: 14px;
    font-weight: 500;
    line-height: 24px;
  }

  p {
    display: flex;
    justify-content: space-between;
    line-height: 24px;

    & > span {
      width: 50%;
      display: flex;
      justify-content: flex-start;
      font-size: 12px;
      color: #666666;
      padding-right: 10px;

      & > label {
        padding: 0;
        width: auto !important;
      }
      & > span {
        @include text-ellipsis();
      }
    }
  }
}
</style>
