<template>
  <form-view class="task-tab-container task-view-containner" :fields="taskfields" :value="task">
    <template slot="taskNo" slot-scope="{ field, value }">
      <!-- start 工单编号 -->
      <div class="form-view-row">
        <label>{{ field.displayName }}</label>
        <div class="form-view-row-content">{{ value }}</div>
      </div>
      <!-- end 工单编号 -->

      <!-- start 工单类型 -->
      <div class="form-view-row">
        <label>工单类型</label>
        <div class="form-view-row-content">{{ task.templateName }}</div>
      </div>
      <!-- end 工单编号 -->
    </template>

    <template slot="customer">
      <!-- start 产品 -->
      <template v-if="customerOption.product">
        <div class="form-view-row" v-if="!products.length"><label>产品</label></div>
        <div class="product-list" v-else>
          <div class="product-item" v-for="(product, index) in products" :key="product.id">
            <div class="product-item-name">
              <label>产品</label>
              <span
                class="link-text"
                :key="product.id"
                @click="openProductView(product.id)"
                v-if="!isEncryptField(product.name) && canSeeCustomer"
              >{{ product.name }}</span>
              <span v-else>{{ product.name }}</span>
              <el-tooltip v-if="showProductRelationCount(product)" placement="top">
                <div slot="content" v-html="`未完成工单：${productRelationCount[product.id].unfinished} </br> 全部工单：${productRelationCount[product.id].all}`"></div>
                <div class="relation-count-button" @click="openProductView(product.id)">
                  {{ `${productRelationCount[product.id].unfinished}/${productRelationCount[product.id].all}` }}
                </div>
              </el-tooltip>
            </div>
            <div class="form-row-two-columns product-item-relation" v-if="relationProductfields.length">
              <div class="form-view-row" v-for="field in relationProductfields" :key="field.id">
                <label>{{ field.displayName }}</label>
                <div class="form-view-row-content"> {{ prettyRelationProductValue(task.attribute[field.fieldName], index) }} </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <!-- end 产品 -->

      <!-- TODO: 临时解决客户字段设置产品未勾选时隐藏 -->
      <template v-else><div class="hide"></div></template>
    </template>

    <!-- start 计划时间 -->
    <template slot="planTime" slot-scope="{ field }">
      <div class="form-view-row">
        <label>{{ field.displayName }}</label>
        <div class="form-view-row-content form-view-row-plantime">
          {{ planTime }}
          <template v-if="allowModifyPlanTime">
            <el-tooltip class="item" effect="dark" content="修改计划时间" placement="top">
              <i class="iconfont icon-bianji1" @click="modifyPlanTime"></i>
            </el-tooltip>
          </template>
        </div>
      </div>
    </template>
    <!-- end 计划时间 -->

    <!-- start 完成时间 -->
    <template slot="completeTime" slot-scope="{ field }" v-if="finishedState">
      <div class="form-view-row">
        <label>{{ field.displayName }}</label>
        <div class="form-view-row-content">{{ task.completeTime | fmt_datetime }}</div>
      </div>
    </template>
    <!-- end 完成时间 -->

    <!-- start 满意度 -->
    <template slot="degree" slot-scope="{ field }" v-if="task.isReview == 1">
      <div class="form-view-row">
        <label>{{ field.displayName }}</label>
        <div class="form-view-row-content">{{ task.degree }}</div>
      </div>
    </template>
    <!-- end 满意度 -->

    <!-- start 工单状态 -->
    <template slot="state" slot-scope="{ field }">
      <div class="form-view-row">
        <label>{{ field.displayName }}</label>
        <div class="form-view-row-content">
          <div class="task-state" :style="{'background-color': stateColor.bgColor, 'border-color': stateColor.bgColor, 'color': stateColor.color}">{{ stateText }}</div>
        </div>
      </div>
    </template>
    <!-- end 工单状态 -->

    <!-- start 协同人 -->
    <template slot="synergies" slot-scope="{ field, value }">
      <div class="form-view-row">
        <label>{{ field.displayName }}</label>
        <div class="form-view-row-content">
          <span class="synergies-name" v-for="item in value" :key="item.userId">{{ item.displayName }}</span>
          <template v-if="allowEditSynergy">
            <el-tooltip class="item" effect="dark" content="修改协同人" placement="top">
              <i class="iconfont icon-bianji1" @click="modifySynergies"></i>
            </el-tooltip>
          </template>
        </div>
      </div>
    </template>
    <!-- end 协同人 -->
    <!-- 创建方式 -->
    <template slot="source" slot-scope="{ field }" v-if="task.source">
      <div class="form-view-row">
        <label>{{ field.displayName }}</label>
        <div class="form-view-row-content">
          {{task.source}}
          <a class="link-text" :href="`/event/view/${task.eventId}`">
            <template v-if="task.eventNo">
              #{{task.eventNo}}
            </template>
          </a>
        </div>
      </div>
    </template>
    <!-- end 创建方式 -->
  </form-view>
</template>

<script>
/* api */
import * as TaskApi from "@src/api/TaskApi.ts";

/* enum */
import { TaskEventNameMappingEnum } from "@model/enum/EventNameMappingEnum.ts";

const ENCRYPT_FIELD_VALUE = "***";

export default {
  name: "task-view",
  props: {
    task: {
      type: Object,
      default: () => ({})
    },
    fields: {
      type: Array,
      default: () => ([])
    },
    finishedState: {
      type: Boolean,
      default: false
    },
    allowModifyPlanTime: {
      type: Boolean,
      default: false
    },
    isPaused: {
      type: Boolean,
      default: false
    },
    canSeeCustomer: {
      type: Boolean,
      default: false
    },
    allowEditSynergy: {
      type: Boolean,
      default: false
    },
    customerOption: {
      type: Object,
      default: () => ({})
    },
    planTime: {
      type: String,
      default: ""
    },
    stateColor: {
      type: Object,
      default: () => ({})
    },
    stateText: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      products: this.buildProducts(),
      productRelationCount: {} // 产品关联的工单数量
    }
  },
  computed: {
    /** 
    * @description 工单自定义字段
    * 过滤产品关联字段，需给每个产品显示对应产品关联字段
    */
    taskfields() {
      return this.fields.filter(field => field.formType != "relationProduct");
    },
    /** 
    * @description 产品关联字段
    */
    relationProductfields() {
      return this.fields.filter(field => field.formType == "relationProduct");
    }
  },
  methods: {
    /** 
    * @description 打开事件详情
    */
    openEventView(id) {
      this.$platform.openTab({
        title: "事件详情",
        close: true,
        url: `/event/view/${id}`,
      })
    },
    /** 
    * @description 修改计划时间
    */
    modifyPlanTime() {
      this.$emit("modifyPlanTime");
    },
    /** 
    * @description 打开产品详情
    */
    openProductView(productId) {
      let fromId = window.frameElement.getAttribute("id");

      if(!productId) return;
      
      this.$platform.openTab({
        id: `product_view_${productId}`,
        title: "产品详情",
        close: true,
        url: `/customer/product/view/${productId}?noHistory=1`,
        fromId
      })
    },
    /** 
    * @description 获取关联的工单数量
    */
    getCountForCreate(params) {
      return TaskApi.getCountForCreate(params).then((result = {}) => {
        this.$set(this.productRelationCount, params.id, result);
      })
    },
    /** 
    * @description 是否显示产品关联的工单数量
    * 1. 全部数量>0
    * 2. 且未加密
    */
    showProductRelationCount(product) {
      let { id, name } = product;
      let { all } = this.productRelationCount[id] || {};
      return Number(all) > 0 && !this.isEncryptField(name);
    },
    /**
    * @description 是否加密字段
    */
    isEncryptField(value) {
      return value === ENCRYPT_FIELD_VALUE;
    },
    /** 
    * @description 产品
    */
    buildProducts() {
      let productsArr = [];
      let { products, product} = this.task;

      if (products && products.length) return products;
      if (product && product.id) return productsArr.push(product);

      return productsArr;
    },
    /** 
    * @description 修改协同人
    */
    modifySynergies() {
      let options = {
        title: "修改协同人",
        selected: this.task.synergies,
        seeAllOrg: true,
        max: 14
      };
      
      return this.$fast.contact.choose("dept", options).then(result => {
        if(result.status == 0) {
          let synergies = result?.data?.users || [];

          const params = { taskId: this.task.id, synergies }
          TaskApi.updateSynergies(params).then(res => {
            if (res.success) {
              this.task.synergies = synergies;

              this.$eventBus.$emit(TaskEventNameMappingEnum.UpdateRecord);
            } else {
              this.$platform.alert(res.message);
            }
          }).catch(err => console.error(err))
        }
      })
        .catch(err => console.error(err))
    },
    /** 
    * @description 处理产品关联字段数据
    */
    prettyRelationProductValue(value, index) {
      if (Array.isArray(value)) {
        return value[index];
      }

      return value;
    }
  },
  created() {
    // 查询产品关联工单数量
    if (this.canSeeCustomer) {
      this.products.map(item => {
        this.$set(this.productRelationCount, item.id, { all: 0, unfinished: 0 });
        this.getCountForCreate({ module: "product", id: item.id });
      })
    }
  }
}
</script>
<style lang="scss">
.task-view-containner {
  .form-view-row-plantime {
    white-space: nowrap;
  }

  .icon-bianji1 {
    font-size: 14px;
  }

  .product-list {
    .product-item {
      &-name {
        line-height: 20px;
        display: flex;
        align-items: baseline;

        label {
          width: 98px;
          margin-bottom: 0;
          padding-left: 20px;
          color: $text-color-regular;
          background: url(../../../../assets/img/task/product_icon.png) no-repeat left 4px;
          background-size: 12px;
        }

        span {
          margin-right: 0;
        }
      }

      &-relation {
        margin-top: 8px;
        padding: 6px 10px;
        background-color: $bg-color-l3;
        border-radius: $border-radius-base;

        .form-view {
          background-color: $bg-color-l3;
        }
      }

      &:not(:last-child) {
        .product-item-name {
          margin-bottom: 8px;
        }

        .product-item-relation {
          margin-bottom: 16px;
        }
      }
    }
  }

  .synergies-name {
    margin-right: 12px;
  }
}
</style>