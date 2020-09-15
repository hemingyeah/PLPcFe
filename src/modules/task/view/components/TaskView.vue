<template>
  <form-view class="task-view-containner" :fields="fields" :value="task">
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
      <div class="form-view-row" v-if="customerOption.product">
        <label>产品</label>
        <div class="form-view-row-content">
          <template v-for="product in products">
            <span
              class="link-text row-item-margin"
              :key="product.id"
              @click="openProductView(product.id)"
              v-if="!isEncryptField(product.name) && canSeeCustomer"
            >{{ product.name }}</span>

            <span class="row-item-margin" :key="product.id" v-else>{{ product.name }}</span>
          </template>
          
          <el-tooltip v-if="showProductRelationTaskCount" placement="top">
            <div slot="content" v-html="`未完成工单：${productRelationTaskCountData.unfinished} </br> 全部工单：${productRelationTaskCountData.all}`"></div>
            <el-button class="task-count-button" @click="openProductView(products[0].id)">
              {{ `${productRelationTaskCountData.unfinished}/${productRelationTaskCountData.all}` }}
            </el-button>
          </el-tooltip>
        </div>
      </div>
      <!-- end 产品 -->
    </template>

    <!-- start 计划时间 -->
    <template slot="planTime" slot-scope="{ field }">
      <div class="form-view-row">
        <label>{{ field.displayName }}</label>
        <div class="form-view-row-content form-view-row-plantime">
          {{ getPlanTimeValue(field) }}
          <template v-if="allowModifyPlanTime">
            <el-tooltip class="item" effect="dark" content="修改计划时间" placement="top">
              <i class="iconfont icon-edit" @click="modifyPlanTime"></i>
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

    <!-- start 协同人 -->
    <template slot="synergies" slot-scope="{ field, value }">
      <div class="form-view-row">
        <label>{{ field.displayName }}</label>
        <div class="form-view-row-content">
          <span class="row-item-margin" v-for="item in value" :key="item.userId">{{ item.displayName }}</span>
          <template v-if="allowEditSynergy">
            <el-tooltip class="item" effect="dark" content="修改协同人" placement="top">
              <i class="iconfont icon-edit" @click="modifySynergies"></i>
            </el-tooltip>
          </template>
        </div>
      </div>
    </template>
    <!-- end 协同人 -->
  </form-view>
</template>

<script>
/* api */
import * as TaskApi from '@src/api/TaskApi.ts';

const ENCRYPT_FIELD_VALUE = '***';

export default {
  name: 'task-view',
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
    taskEditAuth: {
      type: Boolean,
      default: false
    },
    customerOption: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      products: this.buildProducts(),
      productRelationTaskCountData: {} // 产品关联的工单数量
    }
  },
  computed: {
    /** 
    * @description 是否显示产品关联的工单数量
    * 1. 产品存在且只有一个
    * 2. 且全部数量>0
    * 3. 且未加密
    */
    showProductRelationTaskCount() {
      let { products } = this.task;
      let { all } = this.productRelationTaskCountData;
      return products && products.length == 1 && Number(all) > 0 && this.isEncryptField(products[0].name);
    },
    /** 
    * @description 允许修改协同人
    */
    allowEditSynergy() {
      let stateArr = ['allocated', 'accepted', 'processing', 'refused', 'taskPool', 'created'];
      let { isDelete, state } = this.task;

      return this.taskEditAuth && isDelete == 0 && stateArr.indexOf(state) > -1;
    }
  },
  methods: {
    /** 
    * @description 修改计划时间
    */
    modifyPlanTime() {
      this.$parent.openDialog('modifyPlanTime');
    },
    /** 
    * @description 打开产品详情
    */
    openProductView(productId) {
      let fromId = window.frameElement.getAttribute('id');

      if(!productId) return;
      
      this.$platform.openTab({
        id: `product_view_${productId}`,
        title: '产品详情',
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
        this.relationTaskCountData[params.module] = result;
      })
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
    * @description 计划时间
    */
    getPlanTimeValue(field) {
      let { dateType } = field?.setting || {};
      let { isEncryptPlanTime, planTime} = this.task;

      if (planTime) {
        if (isEncryptPlanTime) return ENCRYPT_FIELD_VALUE;

        // 计划时间格式为日期时需格式化
        if (dateType == 'date') return planTime.slice(0, 10);

        return planTime;
      }

      return '';
    },
    /** 
    * @description 修改协同人
    */
    modifySynergies() {
      let options = {
        title: '修改协同人',
        selected: this.task.synergies,
        seeAllOrg: true,
        max: 14
      };
      
      return this.$fast.contact.choose('dept', options).then(result => {
        if(result.status == 0) {
          let synergies = result?.data?.users || [];

          const params = { taskId: this.task.id, synergies }
          TaskApi.updateSynergies(params).then(res => {
            if (res.success) {
              this.task.synergies = synergies;
            } else {
              this.$platform.alert(res.message);
            }
          }).catch(err => console.error(err))
        }
      })
        .catch(err => console.error(err))
    }
  },
  mounted() {
    // 查询产品关联工单数量
    if (this.canSeeCustomer && this.products && this.products.length == 1) {
      this.getCountForCreate({ module: 'product', id: this.products[0].id });
    }
  }
}
</script>
<style lang="scss">
.task-view-containner {
  .nowrap {
    white-space: nowrap;
  }
}
</style>