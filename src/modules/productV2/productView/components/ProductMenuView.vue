<!--  -->
<template>
  <div>
    <form-view
      class="task-tab-container task-view-containner"
      :fields="fields"
      :value="propData"
    >
      <div slot="name"></div>
      <template slot="customer" slot-scope="{ value }">
        <div class="form-view-row" v-if="value">
          <label>客户</label>
          <div class="form-view-row-content link" @click="openCustomer">
            {{ propData.customerName }}
          </div>
        </div>
        <div class="form-view-row" v-if="value && hasLinkman">
          <label>联系人</label>
          <div class="form-view-row-content">
            {{
              propData.linkman &&
                propData.linkman.name + ' ' + propData.linkman.phone
            }}
          </div>
        </div>
        <form-address-view
          v-if="value && hasAddress"
          :field="{ displayName: '地址' }"
          :value="propData.address"
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
    </form-view>
  </div>
</template>

<script>
export default {
  name: 'prop-data-menu-view',
  props: {
    fields: {
      type: Object | Array,
      default: () => {
        {
        }
      },
    },
    propData: {
      type: Object,
      default: () => {
        {
        }
      },
    },
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
};
</script>
<style lang="scss">
</style>
