<template>
  <div class="header-select task-flex task-ai">
    <div class="team-select">
      <biz-team-select :value="team" multiple @input="update" />
    </div>
    <div class="task-ml15 task-span1">
      <el-select v-model="principal" placeholder="请选择负责人" multiple filterable clearable>
        <el-option
          v-for="item in principalList"
          :key="item.userId"
          :label="item.displayName"
          :value="item.userId">
        </el-option>
      </el-select>
    </div>
    <el-date-picker
      class="time"
      v-model="dataTime"
      type="datetime"
      placeholder="选择日期时间"
      align="right">
    </el-date-picker>
  </div>
</template>
<script>
/*api */
import {TeamUser} from '@src/api/PerformanceApi';

export default {
  name: 'header-select',
  data() {
    return {
      team: [], //选中的团队
      principalList: [], //负责人列表
      principal: '', //负责人
      dataTime: '', //时间
    }
  },
  mounted() {
    this.teamUser()
  },
  methods: {
    /**获取负责人 */
    async teamUser(teamId = '') {
      const parmas = {
        state: '',
        teamId
      }
      this.principalList = await TeamUser(parmas)
    },
    /*团队选者 */
    update(event) {
      this.team = event
      let ids = event.map(item => {
        return item.id
      }).join(',')
      this.teamUser(ids)
    }
  }
}
</script>
<style lang="scss" scoped>
.team-select, .principal-list,.time {
  width: 200px!important;
}
</style>