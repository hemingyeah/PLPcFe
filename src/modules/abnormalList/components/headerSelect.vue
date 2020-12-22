<template>
  <div class="header-select task-flex task-ai">
    <div class="team-select">
      <biz-team-select :value="team" multiple @input="update" />
    </div>
    <div class="task-ml15 task-span1">
      <el-select v-model="principal" placeholder="请选择负责人" multiple filterable clearable @change="excutorName">
        <el-option
          v-for="item in principalList"
          :key="item.userId"
          :label="item.displayName"
          :value="item.userId">
        </el-option>
      </el-select>
    </div>

    <div class="header-select-time">
      <el-date-picker
        v-model="dataTime"
        type="datetimerange"
        align="right"
        unlink-panels
        range-separator="至"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        @change="ceratTime"
      >
      </el-date-picker>
    </div>

  </div>
</template>
<script>
/* api */
import {TeamUser} from '@src/api/PerformanceApi';

export default {
  name: 'header-select',
  props: {
    columnar: {
      type: String,
    }
  },
  data() {
    return {
      team: [], // 选中的团队
      principalList: [], // 负责人列表
      principal: '', // 负责人
      dataTime: '', // 时间
    }
  },
  mounted() {
    this.teamUser()
  },
  methods: {
    /** 获取负责人 */
    async teamUser(teamId = '') {
      const parmas = {
        state: '',
        teamId
      }
      this.principalList = await TeamUser(parmas)
    },
    /* 团队选者 */
    update(event) {
      this.team = event
      let ids = event.map(item => {
        return item.id
      }).join(',')
      this.teamUser(ids)
      this.$emit('update', {name: this.columnar, ids})
    },
    excutorName(event) {
      this.$emit('excutorName', {name: this.columnar, event})
    },
    ceratTime(event) {
      this.$emit('ceratTime', {name: this.columnar, event})
    }
  }
}
</script>
<style lang="scss" scoped>
.team-select, .principal-list,.time {
  width: 200px!important;
}
</style>