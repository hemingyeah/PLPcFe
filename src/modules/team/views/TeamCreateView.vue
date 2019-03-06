<template>
  <form @submit.prevent="submit" class="form-page">
    <div class="form-page-header">
      <div class="form-page-tool">
        <button type="button" class="btn-text btn-back" @click="goBack"><i class="iconfont icon-arrow-left"></i> 返回</button>
        <span class="cut-off-line">|</span>
        <button type="submit" :disabled="pending" class="btn btn-primary">提交</button>
      </div>
    </div>
    <form-builder ref="teamCreateForm" :value="form">
      <form-item label="团队名称" validation>
        <form-text :field="filedMap.tagName" v-model="form.tagName"/>
      </form-item>
      <form-item label="团队描述" validation>
        <form-textarea :field="filedMap.description" v-model="form.description"/>
      </form-item>
      <form-item label="团队主管" validation>
        <form-user :field="filedMap.teamLeaders" v-model="form.teamLeaders" max="10" multple/>
      </form-item>
      <form-item label="主管权限">
        <div class="team-form-role-tip"><input type="checkbox" checked disabled> 团队管理员（团队主管将自动获得团队管理员角色权限）</div>
      </form-item>
      <form-item label="联系方式" validation>
        <form-text :field="filedMap.phone" v-model="form.phone"/>
      </form-item>
      <form-item label="团队位置" validation>
        <form-address :field="filedMap.tagAddress" v-model="form.tagAddress"/>
      </form-item>
      <form-item label="负责区域" :validation="placeValidator">
        <team-places v-model="form.tagPlaceList"/>
      </form-item>
    </form-builder>
  </form>
</template>

<script>
import * as FormUtil from '@src/component/form/util';
import * as TeamApi from '@src/api/TeamApi'

import FormMixin from '@src/component/form/components/FormMixin'

export default {
  name: 'team-create-view',
  props: {
    initData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      action: 'create',
      pending: false,

      filedMap: {
        tagName: {
          displayName: '团队名称', 
          fieldName: 'tagName',
          formType: 'text', 
          isNull: 0
        },
        description: {
          displayName: '团队描述', 
          fieldName: 'description',
          formType: 'textarea', 
          isNull: 1
        },
        teamLeaders: {
          displayName: '团队主管', 
          fieldName: 'teamLeaders',
          formType: 'user', 
          isNull: 0
        },
        phone: {
          displayName: '联系方式', 
          fieldName: 'phone',
          formType: 'phone', 
          isNull: 1
        },
        tagAddress: {
          displayName: '团队位置', 
          fieldName: 'tagAddress',
          formType: 'address', 
          isNull: 1
        },
        tagPlaceList: {
          displayName: '负责区域', 
          fieldName: 'tagPlaceList',
          formType: 'area', 
          isNull: 1
        }
      },
     
      form: {
        tagName: '',
        description: '',
        teamLeaders: [],
        teamLeaderRole: false,
        tagPlaceList: []
      },


      
      parent: {}, // 主团队信息
      teamData: {},
      users: [], // 用户
    }
  },
  computed: {
    /* 是否是 新建团队 */
    isCreate() {
      return this.action != 'edit'
    },
  },
  methods: {
    placeValidator(){
      return new Promise((resolve, reject) => {
        let tagPlaceList = this.form.tagPlaceList || [];
        let message = null;
        for(let i = 0; i < tagPlaceList.length; i++){
          let place = tagPlaceList[i] || {};
          if(!place.province || !place.city){
            //this.$set(place, 'success', false)
            message = '请补全负责区域';
          }else{
            //this.$set(place, 'success', true)
          }
        }
        resolve(message)
      })
    },
    /** @deprecated */
    async fetchUsers() {
      let params = {
        pageSize: 0,
        pageNum: 1,
        tagId: this.id,
      }
      try {
        let result = await TeamApi.userList(params);

        this.users = result.list.map(l => {
          return {
            text: l.displayName,
            value: l.userId
          }
        });
        this.form.teamLeaders = this.teamData.teamLeaders.map(leader => {
          return leader.userId
        })
      } catch (e) {
        console.error('fetchUsers catch error', e);
        this.users = [];
      }
    },
    /**  @deprecated 查询单个团队的信息 */
    async getTag() {
      try {
        let params = {
          id: this.id
        }
        let result = await TeamApi.getTag(params);

        if(result.status == 0) {
          this.teamData = result.data;
          this.form = this.unPackData(result.data);
          // 加载数据
          this.fetchUsers();
        } else {
          this.$platform.alert(result.meesage);
        }

      } catch (error) {
        console.log('error: ', error);
      }
    },
    /* 返回 */
    goBack() {
      window.parent.frameHistoryBack(window);
    },
    /* 打包给服务端的数据 */
    packData(data) {
      let params = {};

      params.tagName = data.tagName;
      params.description = data.description;
      params.teamLeaders = data.teamLeaders;
      params.phone = data.phone;
      params.tagAddress = data.tagAddress;

      params.tagPlaceList = data.tagPlaceList || [];

      // 编辑团队
      if('edit' == this.action) {
        params.teamLeaders = this.users.filter(user => {
          return data.teamLeaders.some(leader => leader == user.value)
        }).map(user => {
          return {
            displayName: user.text,
            userId: user.value
          }
        })
      }

      return params

    },
    unPackData(data) {
      let form = {};

      form.tagName = data.tagName;
      form.description = data.description;
      form.teamLeaders = data.teamLeaders;
      form.teamLeaderRole = true;
      form.phone = data.phone;
      form.tagAddress = data.tagAddress;
      form.tagPlaceList = data.tagPlaceList;

      return form
    },
    /* TODO: 提交 */
    submit() {
      this.$refs.teamCreateForm.validate()
        .then(valid => {
          //if (!valid) return Promise.reject('validate fail.');

          const params = this.packData(this.form);

          return console.log(params)

          if (this.action === 'edit') {
            return this.teamUpdate(params);
          }

          this.teamCreate(params);
        })
        .catch(err => {
          console.error(err);
        })
        .finally(() => {
          this.pending = false;
          this.loadingPage = false;
        });
    },
    /* 新建 团队 */
    async teamCreate(params) {
      try {
        let result = await TeamApi.createTag(params);

        if(result.status == 0) {
          this.goBack();
        } else {
          this.$platform.alert(result.message);
        }
      } catch (error) {
        console.log('error: ', error);
      }
    },
    /* 更新 团队 */
    async teamUpdate(params) {
      let _params = params;
      _params.id = this.teamData.id;

      try {
        let result = await TeamApi.updateTag(_params);

        if(result.status == 0) {
          this.goBack();
        } else {
          this.$platform.alert(result.message);
        }
      } catch (error) {
        console.log('error: ', error);
      }
    },
    /* 验证 团队主管 */
    validatorTeamLeader(value, field, changeStatus) {
      return new Promise((resolve, reject) => {
        if(!value || value.length <= 0) {
          resolve('请选择团队主管')
        } else {
          changeStatus(false)
        }
      })
    },
    /* 验证 团队主管权限 */
    validatorTeamLeaderRole(value, field, changeStatus) {
      
      return new Promise((resolve, reject) => {
        if(!value) {
          resolve('请选择团队主管，自动带入团队主管权限')
        } else {
          changeStatus(false)
        }
      })
    }
  },
  /* TODO: 编辑修改 */
  async mounted () {
    try {
      // 初始化默认值
      let form = {};
      // if (this.initData.action === 'edit' && this.initData.id) {
      //   // 处理编辑时数据
      //   this.loadingPage = true;

      //   let result = await CustomerApi.getForEdit(this.initData.id);

    // if('create' == this.action) {
    //   this.parent = {
    //     tagName: query.tagName || '',
    //     id: query.id || ''
    //   }
    // } else {
    //   this.id = query.id || '';
      
    //   this.getTag();
    // }
    } catch (e) {
      console.error('TeamEdit error ', e);
    }
  },
  components: {
    'team-places': {
      mixins: [FormMixin],
      props: {
        value: {
          type: Array,
          default: () => []
        }
      },
      methods: {
        addPlace(){
          this.value.push({});
          this.$emit('input', this.value);
        },
        removePlace(item){
          let index = this.value.indexOf(item);
          if(index >= 0) this.value.splice(index, 1);

          this.$emit('input', this.value);
        },
        convertToArray(item){
          let {province, city, dist} = item
          return [province, city, dist];
        },
        update(item, value = []){
          let [province, city, dist] = value;

          this.$set(item, 'province', province)
          this.$set(item, 'city', city)
          this.$set(item, 'dist', dist)

          this.$emit('input', this.value);
        }
      },
      render(h){
        return (
          <div class="team-form-places">
            <div class="team-form-places-header">
              <p>设置团队的服务区域用于新建客户时自动分配客户所属服务团队</p>
              <button type="button" class="btn-text" onClick={e => this.addPlace()}><i class="iconfont icon-add"></i>添加</button>
            </div>
            {
              this.value.map((item, index) => (
                <div class={['team-form-place', item.success ? 'is-success' : null]} key={index}>
                  <base-dist-picker value={this.convertToArray(item)} onInput={e => this.update(item, e)}/>
                  <button type="button" onClick={e => this.removePlace(item)}>删除</button>
                </div>
              ))
            }
          </div>
        )
      }
    }
  }
}
</script>

<style lang="scss">
body{
  padding: 10px;
}

.team-form-role-tip{
  height: 32px;
  display: flex;
  align-items: center;
  color: $text-color-secondary;

  input{
    margin-right: 5px;
  }
}

.team-form-places{
  p{
    padding: 4px 0;
    margin: 0;
    line-height: 24px;
    color: $text-color-secondary;
  }
}

.team-form-places-header{
  padding: 4px 0;
  color: $text-color-secondary;
  display: flex;
  flex-flow: row nowrap;

  p{
    flex: 1;
    margin: 0;
    line-height: 24px;
  }

  .btn-text{
    color: $color-primary;

    i{
      font-size: 12px;
      margin-right: 5px;
    }
  }
}

.team-form-place{
  display: flex;
  flex-flow: row nowrap;

  .base-dist-picker{
    flex: 1;
    margin-right: 5px;

    & > .el-cascader{
      width: 100%;
    }
  }

  & + .team-form-place{
    margin-top: 5px;
  }
}
</style>
