<!--  -->
<template>
  <div>
    <form-view :fields="fields" :value="product">
      <div slot="name"></div>
      <template slot="customer" slot-scope="{ value }">
        <div class="form-view-row" v-if="value">
          <label>客户</label>
          <div class="form-view-row-content link" @click="openCustomer">
            {{ product.customerName }}
          </div>
        </div>
        <div class="form-view-row" v-if="value && hasLinkman">
          <label>联系人</label>
          <div class="form-view-row-content">
            {{
              product.linkman &&
                product.linkman.name + ' ' + product.linkman.phone
            }}
          </div>
        </div>
        <form-address-view
          v-if="value && hasAddress"
          :field="{ displayName: '地址' }"
          :value="product.address"
        >
        </form-address-view>
      </template>

      <div slot="qrcodeId" slot-scope="{ value }">
        <div class="form-view-row">
          <label>产品二维码</label>
          <div class="form-view-row-content" v-show="value">
            <span>{{ value }}</span>
            <div ref="qrcode" style="margin: 10px 0;"></div>
            <a href="javascript:;" class="link" @click="openDownloadCodeDialog"
            >下载</a
            >
            <a href="javascript:;" class="link" @click="unbindQrcodeFromProduct"
            >删除</a
            >
          </div>
          <div class="form-view-row-content" v-show="!value">
            <a href="javascript:;" class="link" @click="openBindCodeDialog"
            >关联二维码</a
            >
          </div>
        </div>
      </div>

      <template slot="createTime" slot-scope="{ value }">
        <div class="form-view-row" v-if="value">
          <label>创建时间</label>
          <div class="form-view-row-content">
            <span>{{ value | fmt_datetime }}</span>
          </div>
        </div>
      </template>
    </form-view>
  </div>
</template>

<script>
export default {
  props:{
    fields:{
      type:Object,
      default:()=>{
        {}
      }
    },
    product:{
      type:Object,
      default:()=>{
        {}
      }
    }
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
};
</script>
<style lang="scss" scoped></style>
