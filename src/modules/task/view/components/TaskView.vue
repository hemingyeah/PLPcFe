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

    <template slot="customer" slot-scope="{ field }">
      
      <!-- start 客户字段 -->
      <div class="form-view-row">
        <label>{{ field.displayName }}</label>
        <div class="form-view-row-content nowrap">
          <span
            class="link-text"
            @click="openCustomerView"
            v-if="!isEncryptField(customer.name) && canSeeCustomer"
          >{{ customer.name }}</span>

          <template v-else>{{ customer.name }}</template>

          <el-tooltip v-if="showCustomerRelationTaskCount" placement="top">
            <div slot="content" v-html="`未完成工单：${customerRelationTaskCountData.unfinished} </br> 全部工单：${customerRelationTaskCountData.all}`"></div>
            <el-button class="task-count-button" @click="openCustomerView">
              {{ `${customerRelationTaskCountData.unfinished}/${customerRelationTaskCountData.all}` }}
            </el-button>
          </el-tooltip>
        </div>
      </div>
      <!-- end 客户字段 -->

      <!-- start 联系人 -->
      <div class="form-view-row" v-if="customerOption.linkman">
        <label>联系人</label>
        <div class="form-view-row-content nowrap">
          <template v-if="!hasCallCenterModule">{{ linkman }}</template>

          <template v-else>
            <span v-if="isEncryptField(linkman)" @click.stop="makePhoneCall">{{ linkman }}</span>
            <template v-else>
              {{ linkman }}
              <el-tooltip content="拨打电话" placement="top" v-if="linkman">
                <i class="iconfont icon-dianhua1" @click.stop="makePhoneCall"></i>
              </el-tooltip>
            </template>
          </template>
        </div>
      </div>
      <!-- end 联系人 -->

      <!-- start 联系人地址 -->
      <div class="form-view-row" v-if="customerOption.address">
        <label>地址</label>
        <div class="form-view-row-content nowrap">
          {{ address }}
          <i v-if="showMap" class="iconfont icon-address" @click="openMap"></i>
        </div>
      </div>
      <!-- start 联系人地址 -->

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

    <!-- start 工单状态 -->
    <template slot="state" slot-scope="{ field, value }">
      <div class="form-view-row">
        <label>{{ field.displayName }}</label>
        <div class="form-view-row-content">
          <span class="task-state" :style="{'background-color': getTaskStateColor(task)}">{{ getTaskStateName(task) }}</span>
        </div>
      </div>
    </template>
    <!-- end 工单状态 -->

  </form-view>
</template>

<script>
/* api */
import * as TaskApi from '@src/api/TaskApi.ts';

/* utils */
import TaskStateEnum from '@model/enum/TaskStateEnum';
import Filter from '@src/filter/filter.js';

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
    }
  },
  data() {
    return {
      products: this.buildProducts(),
      // 客户、产品关联工单数量数据
      relationTaskCountData: {
        customer: { all: 0, unfinished: 0 },
        product: { all: 0, unfinished: 0 }
      },
      hasCallCenterModule: localStorage.getItem('call_center_module') == 1
    }
  },
  computed: {
    /** 
    * @description 客户字段 
    */
    customerField() {
      return this.fields.filter(f => f.fieldName === 'customer')[0];
    },
    /** 
    * @description 客户字段配置 
    */
    customerOption() {
      return (this.customerField.setting && this.customerField.setting.customerOption) || {};
    },
    /** 
    * @description 客户
    */
    customer() {
      return this.task?.customer || {};
    },
    /** 
    * @description 联系人
    */
    linkman() {
      let lmName = this.task.tlmName || this.customer.lmName;
      let lmPhone = this.task.tlmPhone || this.customer.lmPhone;

      if (lmName) return this.isEncryptField(lmName) ? ENCRYPT_FIELD_VALUE : `${lmName} ${lmPhone}`;

      return '';
    },
    /** 
    * @description 地址
    */
    address() {
      let { validAddress, taddress, isEncryptTaddress } = this.task;

      if (validAddress) return isEncryptTaddress ? ENCRYPT_FIELD_VALUE : Filter.prettyAddress(taddress);

      return '';
    },
    /** 
    * @description 显示查看地图icon
    * 1. 地址未加密
    * 2. 经纬度
    */
    showMap() {
      let { taddress, isEncryptTaddress } = this.task;
      let { longitude, latitude } = taddress;
      return longitude && latitude && !isEncryptTaddress;
    },
    /** 
    * @description 客户关联的工单数量
    */
    customerRelationTaskCountData() {
      return this.relationTaskCountData.customer;
    },
    /** 
    * @description 产品关联的工单数量
    */
    productRelationTaskCountData() {
      return this.relationTaskCountData.product;
    },
    /** 
    * @description 是否显示客户关联的工单数量
    * 1. 客户存在
    * 2. 且全部数量>0
    * 3. 客户未加密
    */
    showCustomerRelationTaskCount() {
      let { all } = this.customerRelationTaskCountData;
      return this.customer?.id && Number(all) > 0 && !this.isEncryptField(this.customer.name);
    },
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
    * @description 工单状态
    */
    getTaskStateName(task) {
      return TaskStateEnum.getNameForTask(task);
    },
    /** 
    * @description 工单状态备件色
    */
    getTaskStateColor(task) {      
      return TaskStateEnum.getColorForTask(task);
    },
    /** 
    * @description 修改计划时间
    */
    modifyPlanTime() {
      this.$parent.openDialog('modifyPlanTime');
    },
    /** 
    * @description 打开地图
    */
    openMap() {
      let address = this.task.taddress;
      let longitude = address.longitude;
      let latitude = address.latitude;

      if(!longitude || !latitude) return;
      
      this.$fast.map
        .display({ ...address })
        .catch(err => console.error('openMap catch an err: ', err));
    },
    /** 
    * @description 打开客户详情
    */
    openCustomerView() {
      let fromId = window.frameElement.getAttribute('id');
      const customerId = this.customer.id;

      if(!customerId) return;

      this.$platform.openTab({
        id: `customer_view_${customerId}`,
        title: '客户详情',
        close: true,
        url: `/customer/view/${customerId}?noHistory=1`,
        fromId
      })
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
    * @description 获取客户关联的工单数量
    */
    getCountForCreate(params) {
      return TaskApi.getCountForCreate(params).then((result = {}) => {
        this.relationTaskCountData[params.module] = result;
      })
    },
    /**
    * @description 拨打电话
    */
    async makePhoneCall() {
      let phone = this.task.tlmPhone || this.customer.lmPhone;

      if (!phone) return;

      const result = await TaskApi.dialout({ taskType:'task', phone });
      if (result.code != 0) {
        return this.$platform.notification({
          title: '呼出失败',
          message: result.message || '',
          type: 'error',
        })
      }
    },
    /**
    * @description 是否加密字段
    */
    isEncryptField(value) {
      return value === '***';
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
    // 查询关联工单数量
    if (this.canSeeCustomer) {
      this.getCountForCreate({ module: 'customer', id: this.customer.id });

      if (this.products && this.products.length == 1) {
        this.getCountForCreate({ module: 'product', id: this.products[0].id });
      }
    }
  }
}
</script>
<style lang="scss">
.task-view-containner {
  .task-state {
    padding: 2px 8px;
    border-radius: 2px;
    display: inline-block;
    color: #fff;
    font-size: 12px;
  }

  .nowrap {
    white-space: nowrap;
  }
}
</style>