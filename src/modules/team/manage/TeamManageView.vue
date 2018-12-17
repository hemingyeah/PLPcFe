<template>
  <section class="team-manage-view">
    <!-- start 团队管理 内容 -->
    <div class="team-manage-content">
      <!-- start 搜索 -->
      <div class="manage-search-view">
        <el-input placeholder="输入团队信息进行搜索" v-model="keyword" class="input-with-select">
        </el-input>
        <base-button type="primary" native-type="submit">搜索</base-button>
      </div>
      <!-- end 搜索 -->
      <!-- start 按钮 -->
      <div class="manage-operate-btns">
        <base-button type="primary" icon="icon-add" @event="teamCreate">新建</base-button>
        <base-button type="primary" @event="teamChildCreate" disabled>新建子团队</base-button>
        <base-button type="danger" @event="teamDelete" disabled>删除团队</base-button>
      </div>
      <!-- end 按钮 -->
    </div>
    <!-- end 团队管理 内容 -->
  </section>
</template>

<script>
import platform from '@src/platform'
export default {
  name: 'team-manage-view',
  data() {
    return {
      keyword: '', // 搜索内容
    }
  },
  methods: {
    /** 新建团队 */
    teamCreate() {
      platform.openTab({
        id: "team",
        title: "新建团队",
        url: "/team/create",
        reload: true
      });
    },
    /** 新建子团队 */
    teamChildCreate() {
      // 
    },
    /** 删除团队 */
    teamDelete() {
      // 
    },
  }
}
</script>

<style lang="scss">
  .team-manage-view {
    height: 100%;
    overflow: auto;
    padding: 10px;

  }

  .manage-search-view {
    background-color: #fff;
    box-sizing: border-box;
    display: flex;
    justify-content: flex-end;

    height: 60px;
    padding: 14px 10px;

    .input-with-select {
      width: 400px;
    }

  }

  .manage-operate-btns {
    background-color: #fff;
    margin-top: 15px;
    padding: 10px;
    
    .danger-button {
      margin-left: 20px;
    }

  }

</style>
