<template>
  <base-modal title="请选择人员计算方式" :show.sync="visible" width="600px" class="choose-team-user-options-modal">

    <!-- start 重复人员列表 -->
    <div v-if="repeatNameList.length > 0" class="choose-team-user-options-modal-list">
      以下成员有重复: <br>
      {{ repeatNameList.join('，') }}
    </div>
    <!-- end 重复人员列表 -->

    <div class="choose-team-user-options-modal-btns">
      <base-button type="primary" @event="choose('onlyParent')">只计算主团队</base-button>
      <base-button type="primary" @event="choose('repeat')">包含所有成员</base-button>
      <base-button type="danger" @event="choose('cancel')">取消</base-button>

    </div>
  
    <div slot="footer" class="export-footer">
      
    </div>
  </base-modal>
</template>

<script>
export default {
  name: 'choose-team-user-options-dialog',
  props: {
    value: {
      type: String,
      default: '',
    }
  },
  data() {
    return {
      repeatNameList: [],
      visible: false,
    }
  },
  computed: {
  },
  mounted() {
  },
  methods: {
    choose(type) {
      this.$emit('input', type);
      this.$emit('update', type);
      this.visible = false;
    },
    show(repeatNameList = []) {
      this.visible = true;
      this.repeatNameList = repeatNameList;
    }
  },
}
</script>

<style lang='scss'>
.choose-team-user-options-modal {
  .base-modal  {
    margin-top: 200px;
    position: relative;
    right: 4px;
  }

  .base-modal-body {
    padding: 15px 15px 0 15px;
  }

  .base-modal-header-close {
    display: none;
  }

}

.choose-team-user-options-modal-list {
  line-height: 30px;
  padding-bottom: 20px;
}

.choose-team-user-options-modal-btns {
  display: flex;
  justify-content: space-around;
}
</style>