<template>
  <base-modal 
    :title="title" width="800px"
    :show.sync="show" 
    @closed="$emit('destory')"
    @cancel="$emit('canel')">
    <div class="bc-dept-wrap">
      <div class="bc-dept">
        <base-tree :data="depts" :selected="selectedDept" @node-selected="chooseDept"/>
      </div>
      <div class="bc-user">
        <div class="bc-search">
          <label class="bc-search-inner">
            <i class="iconfont icon-search"></i>
            <input type="search" placeholder="搜索全部员工" :value="params.keyword" @input="inputKeyword" maxlength="50" autofocus>
          </label>
        </div>

        <div class="bc-user-panel" v-loadmore="loadmoreOptions">
          <p class="bc-contact-search-tip" v-if="mode == 'search' && !loading">为您查询到相关记录{{userPage.total || 0}}条</p>

          <contact-user-item 
            v-for="user in userPage.list" :key="user.userId" :user="user"
            @toggle="chooseUser"/>
          
          <div class="bc-contact-loading" v-if="loading">正在加载，请稍等...</div>
          <div v-if="userPage.total == 0 && !loading && mode == 'choose'" class="bc-contact-empty">
            <img src="../../../assets/img/contact-empty.png" />
            <p>暂无成员</p>
          </div>
        </div>
      </div>
      <div class="bc-chosen" v-if="isMulti">
        <div class="bc-chosen-user" v-for="user in chosen" :key="user.userId">
          <div class="bc-chosen-user-head" :style="{backgroundImage: `url(${head(user)})`}"></div>
          <span>{{user.displayName}}</span>
          <i class="iconfont icon-guanbi" @click="removeUser(user)"></i>
        </div>
      </div>
    </div>
    <div class="bc-contact-footer" v-if="isMulti">
      <span class="bc-contact-chosen-count" v-if="max <= 0">当前已选{{chosen.length}}人</span>
      <button type="button" class="bc-contact-cancel" @click="show = false">关闭</button>
      <button type="button" class="bc-contact-choose" @click="post">确定{{btnText}}</button>
    </div>
  </base-modal>
</template> 

<script>
import _ from 'lodash';
import http from '@src/util/http';
import Page from '@model/Page';
import Platform from '@src/platform';

import ContactUserItem from './ContactUserItem.vue';
import DefaultHead from '@src/assets/img/avatar.png';

export default {
  name: 'base-contact-dept',
  props: {
    /** 
     * 最大选择人数，
     * 1 -- 单选
     * > 1 -- 多选
     * <= 0 -- 不限制选择人数
     */
    max: {
      type: Number,
      default: 0
    },
    selectedUser: {
      type: Array,
      default: () => ({})
    },
    title: {
      type: String,
      default: '请选择人员'
    },
    //是否显示任务统计
    showTaskCount: {
      type: Boolean,
      default: false
    },
    //是否显示用户工作状态
    showUserState: {
      type: Boolean,
      default: false
    },
    action: { //用户数据请求地址
      type: String,
      default: '/security/department/user'
    },
    lat: {
      type: String,
      default: ''
      // default: '27.127668'
    },
    lng: {
      type: String,
      default: ''
      // default: '113.961467'
    },
    allotMap: {
      type: String,
      default: ''
    },


    // allot: { //弃用
    //   type: Boolean,
    //   default: false
    // },
  },
  data(){
    return {
      mode: 'choose',
      show: false,
      loading: true,
      loadmoreOptions: {
        disabled: false,
        callback: this.loadmore
      },

      depts: [], //部门
      selectedDept: {}, //选中的部门
      chosen: [], //已选中的人

      params: {
        keyword: '', //搜索关键词
        deptId: '',
        pageNum: 1,
        pageSize: 100
      }, //参数
      userPage: new Page()
    }
  },
  computed: {
    btnText(){
      return this.max > 0 ? `(${this.chosen.length}/${this.max})` : "";
    },
    //是否多选
    isMulti(){
      return this.max != 1;
    },
    //是否允许添加用户
    allowAddUser(){
      let chosenLen = this.chosen.length;
      let max = this.max <= 0 ? 5 : this.max;
      return chosenLen < max;
    }
  },
  methods: {
    post(){
      let data = this.chosen.map(item => {
        let user = {
          userId: item.userId,
          displayName: item.displayName,
          staffId: item.staffId,
          head: item.head || ''
        }
        return user;
      });

      this.show = false;
      this.$emit('input',data);
    },
    inputKeyword(event){
      this.params.keyword = event.target.value;
      this.search();
    },
    /** 搜索人员 */
    search: _.debounce(function(){
      if(!this.params.keyword){ //空值  显示团队
        this.mode = 'choose';
        this.chooseDept(this.selectedDept);
        return;
      }

      this.searchUser();
    },500),
    /** 选择人员 */
    chooseUser(user){
      if(!user) return;

      //单选则直接返回
      if(!this.isMulti) {
        this.show = false;
        this.$emit('input', {
          userId: user.userId,
          displayName: user.displayName,
          staffId: user.staffId,
          head: user.head || ''
        })
        return;
      }

      user.selected ? this.removeUser(user) : this.addUser(user);
    },
    /** 添加人员 */
    addUser(user){
      if(!this.allowAddUser) return Platform.alert('人数已达上限');
    
      user.selected = true;

      var index = -1;
      var len = this.chosen.length;
      for(var i = 0; i < len;i++){
        if(user.userId == this.chosen[i].userId){
          index = i;
          break;
        }
      }
      index == -1 && this.chosen.push(user);
    },
    /** 移除选择的人员 */
    removeUser(user){
      user.selected = false;

      var index = -1;
      var len = this.chosen.length;
      for(var i = 0; i < len;i++){
        if(this.chosen[i].userId == user.userId){
          index = i;
          break;
        }
      }
      index >= 0 && this.chosen.splice(index,1);
    },
    /** 搜索用户 */
    async searchUser(){
      try {
        this.mode = 'search';
        this.loading = true;
        this.userPage.list = [];

        this.params.deptId = 'root';
        this.params.pageNum = 1;
        
        let userPage = await this.fetchUser(this.params);
        this.userPage.merge(Page.as(userPage));
      } catch (error) {
        console.error(error)
      }

      this.loading = false
      this.loadmoreOptions.disabled = !this.userPage.hasNextPage;
    },
    /** 选中一个部门 */
    async chooseDept(dept){
      try {
        this.mode = 'choose';
        this.selectedDept = dept;
        this.userPage.list = [];
        this.loading = true;

        this.params.keyword = '';
        this.params.deptId = this.selectedDept.id;
        this.params.pageNum = 1;

        let userPage = await this.fetchUser(this.params);

        this.userPage.merge(Page.as(userPage));
      } catch (error) {
        console.error(error)
      }

      this.loading = false;
      this.loadmoreOptions.disabled = !this.userPage.hasNextPage;
    },
    async loadmore(){
      this.loadmoreOptions.disabled = true;
      this.loading = true;

      try {
        this.params.pageNum += 1;
      
        let userPage = await this.fetchUser(this.params)
        this.userPage.merge(Page.as(userPage));
      } catch (error) {
        console.error(error)
      }

      this.loading = false;
      this.loadmoreOptions.disabled = !this.userPage.hasNextPage;
    },
    /** 抓取用户数据 */
    fetchUser(params = {}){      
      return http.get(this.action, params).then(page => {
        //合并数据
        let rows = page.list || [];

        for(let i = 0;i < rows.length; i++){
          let user = rows[i];

          let index = -1;
          for(let j = 0;j < this.chosen.length;j++){
            if(user.userId == this.chosen[j].userId){
              index = j;
              break;
            }
          }

          if(index >= 0){//存在相同数据 则替换原数据
            user.selected = true;
            this.$set(this.chosen, index, user);
          }else{
            user.selected = false;
          }
        }
        return page;
      });
    },
    /** 抓取团队数据 */
    fetchDept(){
      return http.get('/security/department/tree').then(result => {
        if(result.status == 1) return [];

        let depts = result.data || [];
        let index = -1;

        for(var i = 0; i < depts.length; i++){
          if(depts[i].name == '单独授权人员'){
            index = i;
            break;
          }
        }

        //将单独授权人员放在最后
        if(index >= 0){
          let arr = depts.splice(index,1);
          depts.push(arr[0]); 
        } 
        return depts;
      })
    },
    async initialize(){
      this.show = true;
      try {
        this.depts = await this.fetchDept();
        this.chooseDept(this.depts[0]); //默认选中第一个
      } catch (error) {
        console.error(error)
      }
    },
    head(user){
      return user.head || DefaultHead;
    }
  },
  mounted(){
    this.initialize();
  },
  components: {
    [ContactUserItem.name]: ContactUserItem
  }
}
</script>

<style lang="scss">
.bc-dept-wrap{
  display: flex;
  flex-flow: row nowrap;
  height: 450px;
}

.bc-dept{
  width: 240px;
  overflow: auto;
  height: 100%;
  padding: 2px 5px;
}

.bc-user{
  height: 100%;
  flex: 1;
  overflow: hidden;
  border-left: 1px solid #e9ecef;
}

.bc-search{
  height: 41px;
  padding: 6px;
  border-bottom: 1px solid #e9ecef;
}

.bc-search-inner{
  background-color: #f0f0f0;
  display: flex;
  flex-flow: row nowrap;
  border-radius: 2px;
  margin: 0;
  padding: 2px;

  i{
    display: block;
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    font-size: 14px;
  }

  input[type='search']{
    flex: 1;
    border: none;
    outline: none;
    height: 24px;
    padding: 0;
    line-height: 24px;
    margin: 0;
    font-size: 14px;
    background-color: transparent;
    -webkit-appearance:none; 
  }
}

.bc-user-panel{
  height: calc(100% - 41px);
  overflow-y: auto;
}

.bc-chosen{
  width: 180px;
  border-left: 1px solid #e9ecef;
  padding: 0 5px;
  overflow-y: auto;
}

.bc-chosen-user{
  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  height: 32px;
  padding: 0 5px;
  margin: 6px 3px;

  box-shadow: 0 0 1px rgba(0,0,0,.15);
  transition: background-color ease-out .3s;
  user-select: none;


  span{
    flex: 1;
    display: block;
    font-size: 14px;
    padding-left: 5px;
    line-height: 24px;
    @include text-ellipsis();
  }

  i{
    color: #9a9a9a;
    cursor: pointer;
    visibility: hidden;
    font-size: 14px;

    &:hover{
      color: #e84040;
    }
  }

  &:hover{
    background-color: #f5f5f5;

    i{
      visibility: visible;
    }
  } 
}

.bc-chosen-user-head{
  display: block;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  overflow: hidden;

  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
}

.bc-contact-footer{
  height: 52px;
  padding: 10px;
  text-align: right;
  border-top: 1px solid #e9ecef;
}

.bc-contact-chosen-count{
  float: left;
  color: $text-color-second;
  font-size: 14px;
  line-height: 32px;
}

.bc-contact-choose,
.bc-contact-cancel{
  outline: none;
  border:none;
  height: 28px;
  padding: 0 10px;
  background-color: transparent;
  cursor: pointer;
  font-size: 13px;
  border-radius: 2px;
  min-width: 65px;
}


.bc-contact-choose{
  background-color: $color-primary;
  color: #fff;
  line-height: 32px;
  height: 32px;
}

.bc-contact-cancel{
  color: $text-color-second;
  background-color: #fff;
  height: 32px;
  line-height: 32px;
  transition: background-color ease .15s;

  &:hover{
    background-color: #f0f0f0;
  }
}

.bc-contact-loading{
  text-align: center;
  padding: 10px;
  color: #999;
  font-size: 14px;
}

.bc-contact-empty{
  padding-top: 50px;
  text-align: center;
  color: #999;

  img{
    display: block;
    margin: 0 auto;
    width: 180px;
    margin-bottom: 15px;
  }
}

.bc-contact-search-tip{
  margin: 0;
  font-size: 14px;
  color: #999;
  line-height: 20px;
  font-weight: 400;
  padding: 6px 0 4px 10px;
}
</style>