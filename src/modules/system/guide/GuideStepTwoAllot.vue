<template>
  <div class="guide-allot-view">
    <!-- start title -->
    <div class="guide-allot-title">
      为同事分配系统权限，体验全流程管理
    </div>
    <!-- end title -->
    
    <!-- start 权限列表 -->
    <div class="guide-role-view">
      <role-list 
        :list="roleList" 
        @update="updateRoleList">

      </role-list>
    </div>
    <!-- end 权限列表 -->

    <!-- start 底部按钮 -->
    <div class="guide-view-footer">
      
      <span @click="prev" class="guide-view-footer-left">
        <i class="iconfont icon-left"></i>
        <!-- <span> -->
        {{ prevBtnText }}
        <!-- </span> -->
      </span>
      <base-button @event="next">
        下一步
      </base-button>
      <span @click="jump" class="guide-view-footer-right">
        {{ jumpBtnText }}
        <i class="iconfont icon-right"></i>
      </span>
    </div>
    <!-- end 底部按钮 -->
  </div>
</template>

<script>
import RoleList from './component/RoleList.vue';

export default {
  name: 'guide-step-two-allot',
  inject: ['initData'],
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      roleList: [
        {
          name: '服务工程师',
          id: '3',
          users: []
        },
        {
          name: '系统管理员',
          id: '1',
          users: []
        },
        {
          name: '普通管理员',
          id: '2',
          users: []
        },
        {
          name: '财务结算员',
          id: '6',
          users: []
        },
        {
          name: '备件库管理员',
          id: '7',
          users: []
        },
        {
          name: '回访客服',
          id: '4',
          users: []
        },
      ],
    }
  },
  computed: {
    jumpBtnText() {
      return '跳过'
    },
    prevBtnText() {
      return '上一步'
    },
    userGuideNum(){
      return this?.initData?.userGuideNum || 0;
    }
  },
  methods: {
    emit(index, { key, value }) {
      this.$emit('next', [index, { key, value}]);
    },
    // 跳过
    jump() {
      this.roleList.forEach(l => {
        l.users = [];
      });
      this.emit(2, {
        key: 'role',
        value: []
      })
    },
    // 下一步
    next() {
      let isHasUser = false;
      let list = {};

      // 用户去重，判断是否达到人数上限
      let userIds = [];
      this.roleList.forEach(role => {
        role.users.forEach(user => {
          userIds.push(user.userId);
        });
      });

      let usersNumber = [...new Set(userIds)].length;

      if(usersNumber > this.userGuideNum) {
        return this.$platform.notification({
          title: '失败',
          type: 'error',
          message: `授权用户已达上限，您最多可以添加${this.userGuideNum}人`
        })
      }


      // 检测是否选择用户
      for(let i = 0; i < this.roleList.length; i++) {
        list = this.roleList[i];

        if(Array.isArray(list.users) && list.users.length > 0) {
          isHasUser = true;
          break;
        }
      }

      if(!isHasUser) {
        return this.$platform.notification({
          title: '失败',
          type: 'error',
          message: '请先为同事分配试用资格',
        });
      }

      let roleList = this.roleList.map(l => {
        return {
          roleId: l.id,
          userId: l.users.map(u => u.userId)
        }
      })

      this.emit(2, { key: 'role', value: roleList});
    },
    // 上一步
    prev() {
      this.roleList.forEach(list => {
        list.users = [];
      });
      this.emit(0, { key: 'role', value: []});
    },
    updateRoleList(list) {
      this.roleList = list;
    }
  },
  components: {
    [RoleList.name]: RoleList
  }
}
</script>

<style lang="scss">
.guide-allot-view {

  .guide-allot-title {
    color: #333;
    font-size: 16px;
    font-weight: bold;
    line-height: 22px;
  }

  .guide-role-view {
    max-height: 340px;
    overflow-y: scroll;
  }

  .role-item {
    margin-top: 20px;
  }

}
</style>