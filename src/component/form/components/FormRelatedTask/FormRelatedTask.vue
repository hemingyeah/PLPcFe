<template>
  <div class="form-related-task">
		<el-select
			:value="value"
			style="width: 100%"
			multiple
			filterable
			remote
			reserve-keyword
			popper-class="option-item"
			loading-text="载入更多结果......"
			no-data-text="未找到结果"
			@change="updateTask"
			:popper-append-to-body="false"
			:placeholder="placeholder"
			:remote-method="searchTask"
			:loading="loading">
				<el-option
					v-for="option in options"
					:key="option.value"
					:label="option.label"
					:value="option">
						<h3 class="option-item-font">{{option.taskNo}}</h3>
						<p class="option-item-font">
							<span>
								<label>客户姓名：</label>
								<span>{{option.customer.name}}</span>
							</span>
							<span>
								<label>联系人：</label>
								<span>{{option.linkMan.name}}</span>
							</span>
							<span>
								<label>电话：</label>
								<span>{{option.linkMan.phone}}</span>
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
  name: 'form-related-task',
  mixins: [FormMixin],
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
			options: [],
			page: {
				pageSize: 10
			},
			loading: false
    }
	},
	mounted() {
		if(this.value && this.value.length > 0) {
			this.options = _.cloneDeep(this.value);
		}
	},
  methods: {
		searchTask(keyword) {
			let params = {
				...this.page,
				keyword
			};
			this.loading = true;
			search(params).then(res => {
				if (!res || !res.result || !res.result.content) return;
				if (res.result.content) {
					this.options = res.result.content.map(task => Object.freeze({
						label: task.taskNo,
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
			console.log("newValue", newValue);
			let oldValue = null;
      this.$emit('update', {newValue, oldValue, field: this.field});
      this.$emit('input', newValue);
		}
  },
}
</script>

<style lang="scss" scoped>
.form-related-task{
  width: 100%;
	.option-item{
		.el-select-dropdown__item{
			* {
				margin: 0;
			}
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
	}
}
</style>
