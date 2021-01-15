<template>
  <base-modal
    title="选择可用团队"
    width="344px"
    @cancel="cancel"
    :show.sync="isShow"
    :mask-closeable="false">
    <div class="choose-team">
      <el-input
        style="margin-bottom: 22px"
        placeholder="请输入关键词搜索"
        prefix-icon="el-icon-search"
        @input="search"
        v-model="keyword">
      </el-input>
      <el-tree
        v-loading="loading"
        :data="teamList"
        show-checkbox
        @check="handleCheck"
        default-expand-all
        :default-checked-keys="checkedTeamList"
        node-key="id"
        ref="teamTree"
        highlight-current
        check-strictly
        :props="defaultProps">
      </el-tree>
    </div>
    <el-row class="choose-team-footer" type="flex" justify="space-between" slot="footer">
      <el-checkbox v-model="flag" @change="checkAll" :disabled="loading">全选</el-checkbox>
      <div>
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" :loading="pedding" @click="update">确定(已选择{{checkedTeamList.length}})</el-button>
      </div>
    </el-row>
  </base-modal>
</template>

<script>
import _ from 'lodash';

/** api */
import * as TeamApi from '@src/api/TeamApi';
import * as SettingApi from '@src/api/SettingApi';

export default {
  name: 'choose-team-dialog',
  props: {
    id: {
      type: String,
      default: ''
    },
    visiable: {
      type: Boolean,
      default: false
    },
    value: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isShow: false,
      keyword: '',
      flag: false,
      teamList: [],
      teamIds: [],
      checkedTeamList: [],

      loading: false,
      pedding: false
    }
  },
  computed: {
    defaultProps() {
      return {
        children: 'children',
        label: 'tagName'
      }
    }
  },
  watch: {
    visiable(newVal){
      this.isShow = newVal;
      if(newVal) {
        this.checkedTeamList = this.value;
        this.keyword = '';
        this.fetchTagList();
      }
    },
  },
  methods: {
    cancel() {
      this.$emit('update:visiable', false);
    },
    update() {
      let params = {
        id: this.id,
        tagIds: this.checkedTeamList.length === 0 ? '' : this.checkedTeamList.join(',')
      };
      this.pedding = true;
      SettingApi.changeTags(params).then(res => {
        this.pedding = false;
        this.$emit('update', this.checkedTeamList);
        this.cancel();
      }).catch(err => {
        console.log('changeTag => err', err);
      })
        .finally(() => {
          this.pedding = false;
        })
    },
    fetchTagList(keyword = '') {
      let params = {
        keyword,
        onlyParent: true,
        pageNum: 1,
        pageSize: 50
      }
      this.loading = true;
      TeamApi.tagList(params).then(res => {
        this.teamList = res.list;
        this.teamIds = this.getTeamIds(res.list);
                
        if(this.teamList.length === 0) {
          this.flag = 0;
          return;
        }
        this.flag = !this.teamIds.some(teamId => !this.checkedTeamList.includes(teamId));
      }).catch(err => {
        console.error('getTagList => error', err);
      })
        .finally(() => {
          this.loading = false;
        })
    },
    search: _.debounce(function(keyword) {
      this.fetchTagList(keyword);
    }, 300),
    handleCheck(data, checkObj) {
      this.checkedTeamList = [
        ...new Set([
          ...this.checkedTeamList.filter(item => !this.teamIds.includes(item)),
          ...checkObj.checkedKeys
        ])
      ];
      this.flag = !this.teamIds.some(teamId => !this.checkedTeamList.includes(teamId));
    },
    checkAll(flag) { // 全选或反选
      let checkedTeamList = []
      this.flag = flag;

      if(flag) {
        this.$refs.teamTree.setCheckedNodes(this.teamList);
        checkedTeamList = [...new Set([...this.checkedTeamList, ...this.teamIds])];
      }else {
        checkedTeamList = this.checkedTeamList.filter(item => !this.teamIds.includes(item));
        this.$refs.teamTree.setCheckedNodes([]); 
      }

      this.checkedTeamList = checkedTeamList;
    },
    getTeamIds(list) { // 获取所有团队id（包括子级）
      let ids = [];
      list.map(item => {
        if(item.children && item.children.length > 0) {
          let childIds = this.getTeamIds(item.children);
          ids = ids.concat(childIds);
        }

        ids.push(item.id);
      })
      return ids;
    }
  }
}
</script>

<style lang="scss" scoped>
.choose-team{
    height: 437px;
    padding: 20px;
    overflow: auto;
}

.choose-team-footer{
    width: 100%;
    line-height: 32px;
}
</style>