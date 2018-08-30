<template>
  <div class="customer-list-container" ref="customerListPage">
    <!--搜索-->
    <search-group
      :customerConfig="customerConfig"
      v-on:search-list="searchList">
    </search-group>

    <!--列表-->
    <customer-list
      :customerConfig="customerConfig"
      v-on:search-list="searchList"
      v-on:modify-dynamic-columns-display="modifyDynamicColumnsDisplay"
      ref="customerList">
    </customer-list>

  </div>
</template>

<script>
  import CustomerList from './CustomerList.vue';
  import SearchGroup from './SearchGroup.vue';

export default {
  name: 'customer-list-view',
  data() {
    return {
      customerConfig: {},
    };
  },
  props: {},
  mounted() {
    this.fetchConfig();
  },
  methods: {
    fetchConfig() {
      const localStorageData = this.getLocalStorageData();
      let columnStatus = [];

      this.$http.get('/v2/customer/getConfig')
        .then(result => {
          const customerConfig = result;
          customerConfig.fieldInfo = result.fieldInfo
            .map(f => {
              if (!localStorageData || !localStorageData.columnStatus || !localStorageData.columnStatus.length) {
                return f;
              }
              columnStatus = localStorageData.columnStatus;
              if (columnStatus.some(cs => cs.field === f.fieldName)) {
                f.show = true;
              } else {
                f.show = false;
              }
              return f;
            });
          this.customerConfig = customerConfig;
        });
    },
    modifyDynamicColumnsDisplay(newColumns) {
      const fieldInfo = this.customerConfig.fieldInfo;
      if (!fieldInfo || !fieldInfo.length) return;

      this.customerConfig.fieldInfo.forEach(field => {
        if (newColumns.some(f => f.field === field.fieldName)) {
          field.show = true;
        } else {
          field.show = false;
        }
      });
    },
    searchList(params) {
      console.log('page searchList value', params);

      let instance = this.$loading.show(this.$refs.customerListPage);
      this.$refs.customerList.fetchCustomerData(params)
        .then(() => {
          instance.hide();
        })
        .catch(err => {
          instance.hide();
          console.log('err', err);
        })
    },
    getLocalStorageData() {
      const dataStr = localStorage.getItem('customerListData') || '{}';
      return JSON.parse(dataStr);
    },
  },
  components: {
    [CustomerList.name]: CustomerList,
    [SearchGroup.name]: SearchGroup,
  }
}
</script>

<style lang="scss" scoped>
  .customer-list-container {
    background: #f4f7f5;
    padding: 10px;
  }

</style>
