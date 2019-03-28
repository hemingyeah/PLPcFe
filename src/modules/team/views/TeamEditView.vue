<template>
  <form @submit.prevent="submit" class="form-page" v-loading.fullscreen.lock="loadingPage">
    <div class="form-page-header">
      <div class="form-page-tool">
        <button type="button" class="btn-text btn-back" @click="goBack"><i class="iconfont icon-arrow-left"></i> 返回</button>
        <span class="cut-off-line">|</span>
        <button type="submit" :disabled="pending" class="btn btn-primary">提交</button>
      </div>
    </div>
    <form-builder ref="form" :value="form">
      <form-item label="团队名称" :validation="checkName">
        <form-text :field="filedMap.tagName" v-model="form.tagName"/>
      </form-item>
      <form-item label="团队描述" validation>
        <form-textarea :field="filedMap.description" v-model="form.description"/>
      </form-item>
      <form-item label="团队主管" validation>
        <form-user v-if="action == 'create'" :field="filedMap.teamLeaders" v-model="form.teamLeaders" max="10" multiple/>
        <team-user-select v-if="action == 'edit'" :field="filedMap.teamLeaders" :fetch="fetchTeamUser" v-model="form.teamLeaders"/>
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
      <form-item label="负责区域" :validation="checkPlace">
        <team-places :field="filedMap.tagPlaceList" v-model="form.tagPlaceList"/>
      </form-item>
    </form-builder>
  </form>
</template>

<script>
import * as TeamApi from '@src/api/TeamApi'

import _ from 'lodash'
import qs from 'qs';
import FormMixin from '@src/component/form/components/FormMixin'

export default {
  name: 'team-edit-view',
  props: {
    initData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      action: '',
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
      id: '',
      loadingPage: false,
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
    /** 自定义验证团队名称 */
    checkName(value, field, changeStatus){
      return new Promise((resolve, reject) => {
        this.remoteCheckName({id: this.id, field: 'name', value}, resolve, changeStatus)
      })
    },
    remoteCheckName: _.debounce(function (params, resolve, changeStatus){
      changeStatus(true);
      return TeamApi.checkUnique(params).then(validate => {
        changeStatus(false);
        return resolve(validate ? null : '团队名称不能重复');
      })
    }, 250),

    checkPlace(){
      return new Promise((resolve, reject) => {
        let tagPlaceList = this.form.tagPlaceList || [];
        let message = null;
        for(let i = 0; i < tagPlaceList.length; i++){
          let place = tagPlaceList[i] || {};
          if(!place.province || !place.city){
            message = '请补全负责区域';
            break;
          }
        }
        resolve(message)
      })
    },
    async fetchTeamUser(params) {
      return TeamApi.userList({...params, ...{tagId: this.id}})
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
      params.teamLeaders = data.teamLeaders;

      return params
    },
    unPackData(data) {
      let form = {};

      form.tagName = data.tagName;
      form.description = data.description;
      form.teamLeaders = data.teamLeaders || [];
      form.teamLeaderRole = true;
      form.phone = data.phone;
      form.tagAddress = data.tagAddress || {};
      form.tagPlaceList = data.tagPlaceList || [];

      return form
    },
    submit() {
      return this.$refs.form.validate()
        .then(valid => {
          if(!valid) return Promise.reject('validate fail.');

          const params = this.packData(this.form);
          return this.action === 'edit' ? this.teamUpdate(params) : this.teamCreate(params);
        })
        .catch(err => {
          console.error(err);
        })
    },
    /* 新建 团队 */
    async teamCreate(params) {
      this.pending = true;
      let child = '';

      try {
        // 判断是否是新建子团队
        if(this.parent.id) {
          params.parent = {
            id: this.parent.id,
            tagName: this.parent.tagName
          };
          child = '子';
        }

        let result = await TeamApi.createTag(params);

        this.$platform.notification({
          type: result.status == 0 ? 'success' : 'error',
          title: `${child}团队创建${result.status == 0 ? '成功' : '失败'}`,
          message: result.status == 0 ? null : result.message
        })

        if(result.status == 0) {
          this.goBack();
        }
      } catch (error) {
        console.error('error: ', error);
      }

      this.pending = false;
    },
    /* 更新 团队 */
    async teamUpdate(params) {
      this.pending = true;
    
      try {
        params.id = this.id;
        let result = await TeamApi.updateTag(params);

        this.$platform.notification({
          type: result.status == 0 ? 'success' : 'error',
          title: `团队编辑${result.status == 0 ? '成功' : '失败'}`,
          message: result.status == 0 ? null : result.message
        })
        if(result.status == 0) this.goBack();
      } catch (error) {
        console.error('error: ', error);
      }

      this.pending = false;
    }
  },
  created () {
    let query = qs.parse(window.location.search.substr(1));
    let tag = this.initData.tag || {};

    this.action = tag.id ? 'edit' : 'create';
    this.id = tag.id || '';
    this.form = this.unPackData(tag)
    this.parent.id = query.pid;
    this.parent.tagName = query.pname;
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
              <button id={`form_${this.field.fieldName}`} type="button" class="btn-text" onClick={e => this.addPlace()}><i class="iconfont icon-add"></i>添加</button>
            </div>
            {
              this.value.map((item, index) => (
                <div class={['team-form-place', item.success ? 'is-success' : null]} key={index}>
                  <base-dist-picker value={this.convertToArray(item)} onInput={e => this.update(item, e)}/>
                  <button type="button" class="btn-text" onClick={e => this.removePlace(item)}>删除</button>
                </div>
              ))
            }
          </div>
        )
      }
    },
    'team-user-select': {
      name: 'team-user-select',
      mixins: [FormMixin],
      props: {
        value: {
          type: Array,
          default: () => []
        },
        fetch: Function
      },
      methods: {
        input(value){
          this.$emit('input', value)
        },
      },
      render(h){
        return (
          <biz-user-select 
            value={this.value}
            onInput={e => this.input(e)}
            fetch={this.fetch} multiple/>
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

  .btn-text{
    font-size: 13px;
    color: $color-danger;
  }
}
</style>
