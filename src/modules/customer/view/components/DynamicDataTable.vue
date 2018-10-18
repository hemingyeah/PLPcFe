<template>
  <div class="dynamic-data-table-container">
    <el-table>

    </el-table>
    <el-pagination
      background
      layout="prev, pager, next"
      :page-size="params.pageSize"
      :total="totalItems">
    </el-pagination>

  </div>
</template>

<script>
  export default {
    name: "dynamic-data-table",
    props: {
      columns: {
        type: Array,
        default: () => ([]),
      },
      sourceData: {
        type: Array,
        default: () => ([]),
      },
      action: {
        type: Object,
        default: () => ({}),
      },
    },
    data() {
      return {
        totalItems: 100,
        params: {
          pageSize: 10,
          pageNum: 1,
        },
        list: [],
      }
    },
    mounted() {
      console.log('mounted');
    },
    methods: {
      fetchData() {
        this.$http.get(this.action.url, this.params)
        .then(res => {
          console.log('res', res);
        })
        .catch(err => {
          console.error('err', err);
        })
      }
    },
  }
</script>

<style lang="scss">

</style>