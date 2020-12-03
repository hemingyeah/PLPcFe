<!--  -->
<template>
  <div>
    <form-view
      class="task-tab-container task-view-containner"
      :fields="fields"
      :value="dataInfo"
    >
      <div slot="name"></div>
      <template slot="customer" slot-scope="{ value }">
        <div class="form-view-row" v-if="value">
          <label>客户</label>
          <div class="form-view-row-content link" @click="openCustomer">
            {{ dataInfo.customerName }}
          </div>
        </div>
        <div class="form-view-row" v-if="value && hasLinkman">
          <label>联系人</label>
          <div class="form-view-row-content">
            {{
              dataInfo.linkman &&
                dataInfo.linkman.name + ' ' + dataInfo.linkman.phone
            }}
          </div>
        </div>
        <form-address-view
          v-if="value && hasAddress"
          :field="{ displayName: '地址' }"
          :value="dataInfo.address"
        >
        </form-address-view>
      </template>

      <template slot="createTime" slot-scope="{ value }">
        <div class="form-view-row" v-if="value">
          <label>创建时间</label>
          <div class="form-view-row-content">
            <span>{{ value | fmt_datetime }}</span>
          </div>
        </div>
      </template>

      <template slot="product_menu_part">
        <div class="normal-form-view-box">
          <div class="normal-title-2 mar-b-8">
            <div class="flex-1 ">关联备件</div>
          </div>

          <mini-table
            :id="propData.id"
            data-type="part"
            page-type="view"
            v-if="flashPartType"
          />
        </div>
      </template>
      <template slot="product_menu_wiki">
        <div class="normal-form-view-box">
          <div class="normal-title-2">
            <div class="flex-1 mar-b-8">关联知识库</div>
          </div>
          <mini-table
            :id="propData.id"
            data-type="wiki"
            page-type="view"
            v-if="flashProductType"
          />
        </div>
      </template>
    </form-view>
  </div>
</template>

<script>
import { getProductMenuField, getPageInfo } from "@src/api/ProductV2Api";
import MiniTable from "@src/modules/productV2/productMenu/WorkTree/compoment/MiniTable.vue";
export default {
  name: "catalog-view",
  props: {
    propData: {
      type: Object,
      default: () => ({}),
    },
  },
  components: {
    MiniTable,
  },
  data() {
    return {
      flashPartType: true,
      flashProductType: true,
      fields: [],
      dataInfo: {},
    };
  },
  created() {
    getProductMenuField()
      .then((res) => {
        const { code, result, message } = res;
        if (code == 0) {
          const fields = result || [];
          let arr = [];
          const sortedFields = fields.sort((a, b) => a.orderId - b.orderId);
          console.log(sortedFields);
          this.fields = sortedFields;
        } else {
          this.$notify.error({
            title: "网络错误",
            message,
            duration: 2000,
          });
        }
      })
      .catch((error) => {});
  },
  mounted() {
    this.resetPage();
  },
  methods: {
    resetPage() {
      getPageInfo({
        id: this.propData.id,
      }).then((res) => {
        if (res.code == 0) {
          res.result.catalogInfo.productVideo = res.result.catalogInfo.productVideo || [];
          res.result.catalogInfo.productPic = res.result.catalogInfo.productPic || [];
          res.result.catalogInfo.productExplain = res.result.catalogInfo.productExplain || [];
          if (res.result.selectField.length) {
            this.fields.map((item) => {
              if (res.result.selectField.indexOf(item.id) > -1)
                item["hideform"] = true;
              else item["hideform"] = false;
              return item;
            });
          }
          this.$set(this, "dataInfo", res.result.catalogInfo);
        } else {
          this.$notify.error({
            title: "网络错误",
            message: res.message,
            duration: 2000,
          });
        }
      });
    },
  },
};
</script>
<style lang="scss"></style>
