<template>
  <biz-form-remote-select
    ref="product"
    :field="field"
    v-model="taskValue"
    value-key="taskId"
    :remote-method="remoteMethod"
    @input="updateTask"
    :placeholder="placeholder || '请选择工单编号'"
    multiple
  >
    <div class="related-task-option" slot="option" slot-scope="{ option }">
      <h3>{{ option.taskNo}}</h3>
      <div class="related-task-option-desc">
        <p>
          客户姓名：
          <span>{{option.customerName}}</span>
        </p>
        <p>
          联系人：
          <span>{{option.linkMan && option.linkMan.name}}</span>
        </p>
        <p>
          电话：
          <span>{{option.linkMan && option.linkMan.phone}}</span>
        </p>
      </div>
      <p v-if="option.products && option.products.length > 0">
        产品：
        <span v-for="(product, idx) in option.products" :key="idx">
          {{option.products[idx].name}}{{(idx <option.products.length - 1) && ','}}
        </span>
      </p>
    </div>
  </biz-form-remote-select>
</template>

<script>
/** api */
import { search } from "@src/api/TaskApi.ts";

/** mixin */
import FormMixin from "@src/component/form/mixin/form";

import _ from "lodash";

export default {
  name: "form-related-task",
  mixins: [FormMixin],
  props: {
    value: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      taskValue: [],

      page: 1,
      pageSize: 20,
    };
  },
  watch: {
    value(val) {
      this.init(val);
    }
  },
	mounted() {
    this.init(this.value);
	},
  methods: {
    init(val) {
      if(val && val.length > 0) {
        let taskValue = _.cloneDeep(val);
        this.taskValue = taskValue.map(item => {
          item.label = item.taskNo;
          return item;
        });
      }
    },
    remoteMethod(params) {
      let {keyword,pageNum,pageSize} = params;
      params = {
        page: pageNum,
        pageSize,
				keyword
      };

      return search(params)
        .then((res) => {
          if (!res || !res.result || !res.result.content) return;
          res.list = res.result.content.map((task) =>
            Object.freeze({
              label: task.taskNo,
              taskNo: task.taskNo,
              taskId: task.id,
              templateId: task.templateId,
              customerName: task.customerEntity && (task.customerEntity.name || ''),
              linkMan: task.linkMan || {},
              products: task.products || [],
            })
          );

          res.total = res.result.totalElements;
          res.totalPages = res.result.totalPages;
          res.hasNextPage = !!(res.totalPages > params.page);
          res.pageNum = params.page;

          return res;
        })
        .catch((e) => console.error(e))
    },
    updateTask(newValue) {
      console.log('newValue', newValue);
      this.inputForValue(
        newValue.map((item) => {
          return {
            taskId: item.taskId,
            taskNo: item.taskNo,
            templateId: item.templateId,
          };
        })
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.related-task-option{
  font-size: 12px;
  line-height: 14px;
  padding-top: 20px;
  h3 {
    font-size: 14px;
  }
  p {
    margin-bottom: 0;
    padding-bottom: 20px;
  }
  &-desc {
    display: flex;
    justify-content: space-between;
    padding-right: 10px;
    p{
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      &:last-child{
        min-width: 120px;
      }
    }
  }
}
</style>
