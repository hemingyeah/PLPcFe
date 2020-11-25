<template>
  <div class="form-related-task">
		<el-select
			v-model="taskValue"
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
      value-key="taskId"
			@change="updateTask"
			:placeholder="placeholder"
			:remote-method="searchTask"
			:loading="loading">
				<el-option
					v-for="option in options"
					:key="option.value"
					:label="option.taskNo"
					:value="option">
						<h3 class="option-item-font">{{option.taskNo}}</h3>
						<p class="option-item-font">
							<span v-if="option.customer">
								<label>客户姓名：</label>
								<span>{{option.customer && option.customer.name}}</span>
							</span>
							<span v-if="option.linkMan">
								<label>联系人：</label>
								<span>{{option.linkMan && option.linkMan.name}}</span>
							</span>
							<span v-if="option.linkMan">
								<label>电话：</label>
								<span>{{option.linkMan && option.linkMan.phone}}</span>
							</span>
						</p>
						<p v-if="option.products && option.products.length > 0" class="option-item-font">
							<span>
								<label>产品：</label>
								<span v-for="(product, idx) in option.products" :key="idx">
									{{option.products[idx].name}}{{(idx <option.products.length - 1) && ','}}
								</span>
							</span>
						</p>
				</el-option>
		</el-select>
  </div>
</template>

<script>
/** api */
import { search } from '@src/api/TaskApi.ts';

/** mixin */
import FormMixin from '@src/component/form/mixin/form';

import _ from 'lodash'

export default {
  name: 'form-related-catalog',
  mixins: [FormMixin],
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      taskValue: [],
			options: [],
      loading: false,
      
      page: 1,
      pageSize: 20
    }
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
          item.value = item.taskNo;
          return item;
        });
        this.options = taskValue;
      }
    },
		searchTask(keyword = '') {
			let params = {
        page: this.page,
        pageSize: this.pageSize,
				keyword
      };
			this.loading = true;
			search(params).then(res => {
				if (!res || !res.result || !res.result.content) return;
				if (res.result.content) {
					this.options = res.result.content.map(task => Object.freeze({
            value: task.id,
            taskNo: task.taskNo,
						taskId: task.id,
						templateId: task.templateId,
						linkMan: task.linkMan || {},
						customer: task.customerEntity || {},
						products: task.products || []
          }));
				}
			})
			.catch(e => console.error(e))
			.finally(() => {
				this.loading = false;
			});
		},
		updateTask(newValue) {
      this.inputForValue(newValue.map(item => {
        return {
          taskId: item.taskId,
          taskNo: item.taskNo,
          templateId: item.templateId
        }
      }));
		}
  },
}
</script>

<style lang="scss" scoped>
.form-related-task{
  width: 100%;
}

.el-select-dropdown__item{
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
