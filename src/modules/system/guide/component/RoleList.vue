<template>
  <div>
    <div 
      class="role-item" 
      v-for="(item, index) in list"
      :key="`role_item_${index}`">

      <!-- start 名字 -->
      <div class="role-item-label">
        {{ item.name }}
      </div>
      <!-- end 名字 -->

      <!-- start 用户列表 -->
      <div class="role-item-users" v-if="item.users.length < 11">
        <!-- start 用户 -->
        <div class="role-item-user" v-for="(user) in item.users" :key="user.userId">
          <img :src="user.head ? user.head : defaultHead" />
          <span>
            {{ user.displayName }}
          </span>
        </div>
        <!-- end 用户 -->
        <div class="role-item-user" @click="addUserWithRole(item)">
          <i class="iconfont icon-icon02"></i>
          <span>
            选择
          </span>
        </div>
      </div>
      <div class="role-item-users" v-else>
        <!-- start 用户 -->
        <div class="role-item-user" v-for="(user) in item.users.slice(0, 10)" :key="user.userId">
          <img :src="user.head ? user.head : defaultHead" />
          <span>
            {{ user.displayName }}
          </span>
        </div>
        <!-- end 用户 -->
        <div class="role-item-user role-item-user-more">
          <i class="iconfont icon-diandiandian"></i>
          <span>
            等{{ item.users.length }}人
          </span>
        </div>
        <div class="role-item-user" @click="addUserWithRole(item)">
          <i class="iconfont icon-icon02"></i>
          <span>
            选择
          </span>
        </div>
      </div>
      <!-- end 用户列表 -->

    </div>
  </div>
</template>

<script>
import DefaultHead from '@src/assets/img/avatar.png';

export default {
  name: 'role-list',
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      defaultHead: DefaultHead,
    }
  },
  methods: {
    // 添加用户
    addUserWithRole(item) {
      let options = {};
      
      options.selectedUser = item.users;
      options.max = -1;
      options.title = '请选择成员';
      options.selected = item.users;

      this.$fast.contact.choose('dept', options).then(result => {
        item.users = result?.data?.users || [];
        this.$emit('update', this.list);
      })
        .catch(err => console.error(err))
    },
    
  },
}
</script>

<style lang="scss">
.role-item {
  display: flex;
  height: 48px;

  &-label {
    background-color: #f5f5f5;
    color: #333;

    line-height: 48px;
    text-align: center;

    margin-right: 5px;
    width: 110px;
  }
  &-users {
    display: flex;
    flex: 1;

    .role-item-user {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;

      cursor: pointer;

      margin-left: 20px;
      width: 36px;

      img {
        border-radius: 50%;

        height: 30px;
        width: 30px;
      }

      i {
        color: #999;

        height: 30px;
        width: 30px;
        margin: 0 auto;

        font-size: 24px;
        line-height: 30px;
        text-align: center;
      }
      span {
        color: #666;
        font-size: 12px;

        @include text-ellipsis;
      }

    }
    .role-item-user-more {
      min-width: 38px;
      max-width: 48px;
      span {
        overflow: initial;
        white-space: nowrap;
      }
    }

  }
}
</style>