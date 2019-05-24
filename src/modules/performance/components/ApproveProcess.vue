<template>
  <ul class="approve-process-container">
    <li :class="{processing: order >= 0}">
      <i class="iconfont icon-chuanjianbaogao"></i>
      <h5>创建</h5>
    </li>
    <li class="line" :class="{processing: order > 0.5, 'half-processing': order === 0.5}">
      <div> </div>
      <div> </div>
      <el-tag size="mini" v-if="stage === 'approve'">审核中</el-tag>
    </li>
    <li :class="{processing: order >= 1}">
      <i class="iconfont icon-tijiaoshenhe"></i>
      <h5>审核</h5>
    </li>
    <li class="line" :class="{processing: order > 1.5, 'half-processing': order === 1.5}">
      <div> </div>
      <div> </div>
    </li>

    <li :class="{processing: order >= 2}">
      <i class="iconfont icon-fabu"></i>
      <h5>发布</h5>
    </li>
    <!--<li class="line" :class="{processing: order > 2.5, 'half-processing': order === 2.5}">-->
      <!--<div></div>-->
      <!--<div></div>-->
    <!--</li>-->
    <!--<li :class="{processing: order >= 3}">-->
      <!--<i class="iconfont icon-tongzhi1"></i>-->
      <!--<h5>通知参与人</h5>-->
    <!--</li>-->
  </ul>
</template>

<script>
// create approve publish notice

export default {
  name: 'approve-process',
  props: {
    stage: {
      type: String,
      default: '',
    },
  },
  data() {
    return {}
  },
  computed: {
    order() {
      const stage = this.stage;
      if (!stage) return 0;

      switch (stage) {
      case 'create':
        return 0;
      case 'created':
        return 0.5;
      case 'approve':
        return 0.5;
      case 'approved':
        return 1.5;
      case 'publish':
        return 2;
      case 'published':
        return 2.5;
      case 'notice':
        return 3;
      case 'noticed':
        return 3.5;
      default:
        return 0;
      }

    }
  },
  mounted() {
  },
  methods: {},
}
</script>

<style lang="scss">
  .approve-process-container {
    display: flex;
    justify-content: space-between;
    padding: 0;

    li {
      list-style: none;
      text-align: center;
      font-size: 15px;
      color: #AFAFAF;

      .iconfont {
        font-size: 24px;
      }

      h5 {
        margin: 0;
        margin-top: 12px;
        font-weight: normal;
      }
    }

    .line {
      flex-grow: 1;
      display: flex;
      padding-top: 15px;
      margin: 0 10px;
      position: relative;
      div {
        width: 50%;
        height: 0;
        border-top: 2px dashed #AFAFAF;
      }
      .el-tag {
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
      }
    }

    .processing {
      color: $color-primary;
      div {
        border-top: 2px dashed $color-primary;
      }
    }

    .half-processing {
      &>div:first-child {
        border-top: 2px dashed $color-primary;
      }
    }
  }

</style>