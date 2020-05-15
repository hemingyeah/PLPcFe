<template>
  <base-modal :show.sync="show" class="customer-attention-modal" width="520px">
    <h3 slot="title">已关注用户 <small>以下用户设置了关注该客户，您可以取消他们的关注</small></h3>
    
    <p class="customer-attention-tips" v-if="users.length == 0">暂无用户关注该客户</p>
    <template v-else>
      <span 
        v-for="user in users" :key="user.userId"
        class="customer-attention-tag">{{user.displayName || user.userName}} <i class="iconfont icon-yemianshanchu" @click="remove(user)"></i></span>
    </template>
    
    <div class="customer-attention-footer" slot="footer">
      <button type="button" class="btn btn-text" @click="show = false">关闭</button>
      <button type="button" class="btn btn-primary" @click="submit">确定</button>
    </div>
  </base-modal>
</template>

<script>
import { cloneDeep } from 'lodash';
import Platform from '@src/platform';

export default {
  name: 'customer-attention',
  data(){
    return {
      show: false,
      originUsers: [],
      users: []
    }
  },
  methods: {
    view(users){
      this.originUsers = users;
      this.users = cloneDeep(users);
      this.show = true;
    },
    remove(user){
      let index = this.users.findIndex(u => u.userId == user.userId);

      if(index >= 0) this.users.splice(index, 1)
    },
    async submit(){
      let removeUsers = this.originUsers.filter(u => !this.users.find(i => i.userId == u.userId));
      if(removeUsers.length == 0) return this.show = false;

      let userName = removeUsers.reduce((acc, cur, index, arr) => {
        if(index > 3) return acc;
        if(index == 3) {
          return `${acc.slice(0, -1)}等${arr.length}人`;
        }

        return `${acc}${cur.displayName || cur.userName},`;
      }, '');

      if(userName.endsWith(',')) userName = userName.slice(0, -1);
      
      if(!await Platform.confirm(`确定要取消${userName}对该客户的关注吗？`)) return;

      this.$emit('submit', {removeUsers, userName})
      this.show = false;
    }
  }
}
</script>

<style lang="scss">
.customer-attention-tag{
  cursor: default;
  display: inline-block;
  background-color: $color-primary;
  color: #fff;
  margin: 5px 0 0 5px;
  padding: 3px 12px;
  line-height: 20px;
  border-radius: 4px;

  i{
    cursor: pointer;
    font-size: 12px;
  }

  &:hover{
    background-color: lighten($color-primary, 10%);
  }
}

.customer-attention-modal{
  user-select: none;

  small{
    color: $text-color-secondary;
    font-size: 12px;
  }

  .base-modal-body{
    padding: 5px 10px 10px 5px;
  }

  .base-modal-footer{
    border-top: 1px solid #e9ecef;
    padding: 10px;
    text-align: right;
  }
}

.customer-attention-tips{
  margin: 0;
  padding: 5px 0 0 5px;
  line-height: 26px;
  color: $text-color-secondary;
}
</style>

