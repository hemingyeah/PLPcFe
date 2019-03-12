<template>
  <div class="performance-view-container">

    <dl class="main-info">

      <dt>{{reportDetail.reportName}}</dt>
      <dd>规则名称：{{reportDetail.ruleName}}</dd>
      <dd>创建时间：{{reportDetail.createTime}}</dd>
      <dd>统计范围：{{reportDetail.allSize}}</dd>
      <dd>规则命中：{{reportDetail.hitSize}}</dd>
      <dd>统计方式：{{reportDetail.ruleType}}</dd>
      <dd>统计状态：{{1}}</dd>
      <dd>起止时间：{{1}}</dd>
      <dd>备注：{{reportDetail.remark}}</dd>
    </dl>

    <div class="detail-list">
      <p>导出</p>
      <!--table-->



    </div>
  </div>
</template>

<script>
export default {
  name: "performance-view",
  props: {
    initData: {
      type: Object,
      default: () => ({}),
    }
  },
  data() {
    return {


      columns: [
        {
          label: '对象',
          field: 'users',
        },
        {
          label: '命中规则',
          field: 'hitNumber',
        },
        {
          label: '绩效方式',
          field: 'ruleType',
        },
        {
          label: '绩效结果',
          field: 'result',
        },
        {
          label: '明细',
          field: 'action',
        },
      ]
    }
  },
  computed: {
    reports() {
      if (!this.initData || !this.initData.reportDescList || !this.initData.reportDescList.reportMap) return [];
      return this.initData.reportDescList.reportMap;
    },
    reportDetail() {
      if (!this.initData || !this.initData.reportDescList || !this.initData.reportDescList.ruleMap) return {}
      const {reportName, ruleName, allSize, hitSize, ruleType, createTime, startTime, endTime, remark, } = this.initData.reportDescList.ruleMap;

      return {
        reportName,
        ruleName,
        createTime,
        allSize,
        hitSize,
        ruleType,
        remark,


      }
    }
  },
  mounted() {
    console.log('this.initData', this.initData);
  },
  methods: {},
}
</script>

<style lang="scss">

  .performance-view-container {
    display: flex;
    padding: 10px;

    .main-info {
      margin: 0;
      background: #fff;
    }
    .detail-list {
      background: #fff;
      margin-left: 10px;
      flex-grow: 1;

    }
  }

</style>