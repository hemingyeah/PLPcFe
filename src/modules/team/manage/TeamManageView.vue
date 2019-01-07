<template>
  <section class="team-manage-view" v-loading.fullscreen.lock="loadingPage">
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
        <!-- TODO: 是否有权限 新建 删除 -->
        <base-button type="primary" icon="icon-add1" @event="teamCreate">新建</base-button>
        <base-button type="primary" @event="teamChildCreate">新建子团队</base-button>
        <base-button type="primary" @event="teamDetail">团队详情</base-button>
        <base-button type="ghost" icon="icon-fe-close" @event="teamDelete">删除团队</base-button>
        <div ref="selectView"></div>
      </div>
      <!-- end 按钮 -->
      <!-- start 团队 表格 -->
      <div class="team-manage-table">
        <demo-view>
        </demo-view>
        <div class="table-footer">
          <div class="list-info">
            共<span class="level-padding">{{ paginationInfo.total }}</span>记录，
            已选中<span class="selectedCount">0</span>条
            <span class="selectedCount select-init-text" @click="selectionToggle()">清空</span>
          </div>
          <el-pagination
            class="customer-table-pagination"
            background
            @current-change="jump"
            @size-change="handleSizeChange"
            :page-sizes="[10, 20, 50]"
            :page-size="paginationInfo.pageSize"
            :current-page="paginationInfo.pageNum"
            layout="prev, pager, next, sizes, jumper"
            :total="paginationInfo.total">
          </el-pagination>
        </div>
      </div>
      <!-- end 团队 表格 -->
    </div>
    <!-- end 团队管理 内容 -->
  </section>
</template>

<script>
import DemoView from "./../../system/demo/DemoView.vue";
export default {
  name: 'team-manage-view',
  data() {
    return {
      loadingPage: false,
      keyword: '', // 搜索内容
      paginationInfo: {
        pageSize: 10,
        pageNum: 1,
        total: 1,
      }
    }
  },
  mounted() {
    const localStoragePageSize = this.storageGetData();
    if (localStoragePageSize) {
      this.paginationInfo.pageSize = Number(localStoragePageSize);
    }
    // this.fentchData();
    this.select();
  },
  methods: {
    fentchData() {
      // this.loadingPage = true;
      // setTimeout(() => {
      //   this.loadingPage = false;
      // }, 800)
    },
    /** 新建团队 */
    teamCreate() {
      window.location.href = `/team/create?id=${'0a22e14d-84e6-11e8-8546-00163e304a25'}`;
      // this.$platform.openTab({
      //   id: "team",
      //   title: "新建团队",
      //   url: "/team/create",
      //   reload: true
      // });
    },
    /** 团队详情 */
    teamDetail() {
      window.location.href = `/team/detail?id=${'0a22e14d-84e6-11e8-8546-00163e304a25'}`;
      // this.$platform.openTab({
      //   id: "team",
      //   title: "团队详情",
      //   url: "/team/detail",
      //   reload: true
      // });
    },
    /** 新建子团队 */
    teamChildCreate() {
      // TODO: 选择一个主团队后才可以 新建子团队
    },
    /** 删除团队 */
    async teamDelete() {
      try {
        // TODO: 删除主团队时 提示 子团队会一并删除
        const result = await this.$platform.confirm('您确定要删除选择的团队？');
        if (!result) return;

        this.$http.post(`/security/tag/delete/`)
          .then(res => {
            // 
          })
          .catch(err => console.error('teamDelete err', err));
      } catch (e) {
        console.error('teamDelete catch error', e);
      }
    },
    /** 缓存  get */
    storageGetData() {
      const dataStr = localStorage.getItem('team_manage_page_size') || '10';
      return dataStr;
    },
    /** 缓存 set */
    storageSetData() {
      localStorage.setItem('team_manage_page_size', JSON.stringify(this.paginationInfo.pageSize));
    },
    /** 页面数据大小 */
    handleSizeChange(pageSize) {
      this.paginationInfo.pageSize = pageSize;
      this.storageSetData();
    },
    /** 跳页 */
    jump(pageNum) {
      this.paginationInfo.pageNum = pageNum;
      // this.fetchData();
    },
    /** 选中的 select 切换 */
    selectionToggle() {
      // 
    },
    select() {
      let options = {
        placeholder: '请选择人员',
        multiple: false,
        el: this.$refs.selectView
      }
      this.$fast.selectTeam.choose('team', options).then(user => {
        console.log(user)
      }).catch(err => console.log(err))
    }
  },
  components: {
    [DemoView.name]: DemoView
  }
}
</script>

<style lang="scss">
  .team-manage-view {
    height: 100%;
    // overflow: auto;
    padding: 10px;

  }

  .manage-search-view {
    background-color: #fff;
    box-sizing: border-box;
    display: flex;
    justify-content: flex-end;

    height: 56px;
    padding: 12px 10px;

    .input-with-select {
      width: 400px;
    }

  }

  .manage-operate-btns {
    background-color: #fff;
    border-bottom: 1px solid #f2f2f2;
    display: flex;
    margin-top: 10px;
    padding: 10px;
    
    .danger-button {
      margin-left: 20px;
    }
    button {
      margin-right: 10px;
    }

  }

  .team-manage-table {
    background-color: #fff;
    & > div {
      padding: 10px;
    }
    table {
      text-align: left;
    }
    .base-table-nowrap-text {
      @include text-ellipsis;
      white-space: normal;
      word-break: break-all;
      line-height: 23px;
    }

    .table-footer {
      display: flex;
      justify-content: space-between;
      padding: 0px 10px 10px 10px;
      background: #fff;
      border-radius: 0 0 3px 3px;

      .list-info {
        font-size: 13px;
        line-height: 32px;
        margin: 0;
        color: #767e89;

        .level-padding {
          padding: 0 5px;
        }
        .selectedCount {
          color: $color-primary;
          padding: 0 3px;
          width: 15px;
          text-align: center;
          &:hover {
            cursor: pointer;
          }

        }

      }

    }

  }

  .team-table-view {

    .panel-title {
      font-size: 16px;
      line-height: 60px;
      padding: 0 25px;
      color: #848a93;
      border-bottom: 1px solid #f2f8f7;
      font-weight: normal;
      display: flex;
      justify-content: space-between;
    }
  
    .cancel-select-team-btn {
      margin-right: 20px;
      float: right;
      background: #E5E8F0;
      border-color: #E5E8F0;
      color: #646B78; 
    }

  }
  .selected-team-list {
    overflow-y: auto;
    padding: 0 20px;
    line-height: 45px;
    font-size: 14px;
    height: calc(100% - 130px);

    dt {
      display: flex;
      border-bottom: 1px solid #F0F5F5;
      font-weight: normal;
    }
    dd {
      display: flex;
      
      .iconfont {
        color: $color-primary;
        visibility: hidden;
      }
      &:hover {
        cursor: pointer;
        .iconfont {
          visibility: visible;
        }
      }

    }
    .id-team {
      padding: 0 5px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 120px;
    }
    .name-team {
      padding: 0 5px;
      width: 220px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

  }
</style>
