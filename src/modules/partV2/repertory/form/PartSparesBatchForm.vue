

<template>
  <div class="part-spares-batch-form">
    <el-table :data="form" empty-text="请点击下方按钮添加要分配的数据">
      <el-table-column label="仓库" width="140px">
        <el-select v-model="scope.row.repertory" slot-scope="scope" @input="chooseRepertory($event,scope.row)">
          <el-option v-for="(option, index) in repertory" :key="index + option.id" :label="option.name" :value="option.id"></el-option>
        </el-select>
      </el-table-column>
      <el-table-column label="名称" width="150px">
        <el-autocomplete
          slot-scope="scope"
          popper-class="batch-in-part"
          v-model="scope.row.sparepartName"
          :fetch-suggestions="selectPart(scope.row)"
          placeholder="请选择备件"
          @select="choosePart($event, scope.row)">

          <div class="bacth-in-part-item" slot-scope="scope">
            <p>名称：{{scope.item.sparepart&&scope.item.sparepart.name}}</p>
            <p>编号：{{scope.item.sparepart&&scope.item.sparepart.serialNumber}}</p>
            <p>规格：{{scope.item.sparepart&&scope.item.sparepart.standard}}</p>
          </div>
        </el-autocomplete>

      </el-table-column>
      <el-table-column label="编号" prop="serialNumber"></el-table-column>
      <el-table-column label="类别" prop="sparepartType" width="100px"></el-table-column>
      <el-table-column label="备件规格" prop="standard" width="100px"></el-table-column>
      <el-table-column label="类型" prop="type"></el-table-column>
      <el-table-column label="库存数" width="120px" min-width="80px">
        <template slot-scope="scope">
          {{scope.row.repertoryCount}}
          <el-tooltip v-if="scope.row.safetyStock && (Number(scope.row.safetyStock) > scope.row.repertoryCount)" class="item" effect="dark" :content="`安全库存：${scope.row.safetyStock}`" placement="top">
            <el-tag size="mini" type="danger" class="tag-position">库存提醒</el-tag>
          </el-tooltip>
        </template>
      </el-table-column>
      <!-- 目标库 -->
      <el-table-column label="目标库" width="160px" placeholder="请选择目标库">
        <template slot-scope="scope">
          <el-select 
            v-if="scope.row.isFirst"
            v-model="scope.row.repertoryTarget" 
            @change="chooseSelect"
            :remote-method="getFetchUsers"
            filterable
            clearable
            remote
            :loading="user.loading"
            placeholder="请选择个人库">

            <el-option v-for="(option, index) in repertorys" :key="index + option.userId" :label="option.displayName" :value="option.userId">
              <div class="srp-user-item">
                <img :src="option.head || '/resource/images/account_userhead.png'">
                <p>{{option.displayName}}</p>
              </div>
            </el-option>

          </el-select>
          <div v-else>
            {{scope.row.repertoryTarget}}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="分配数" width="80px">
        <el-input slot-scope="scope" v-model="scope.row.variation" type="number" step="any" :min="0" :max="parseInt(scope.row.repertoryCount)"></el-input>
      </el-table-column>
      <el-table-column label="操作" width="60px" fixed="right">
        <el-button type="text" @click="remove(scope.row)" slot-scope="scope">删除</el-button>
      </el-table-column>
    </el-table>

    <div class="in-stock-remark" v-if="form.length > 0">
      <textarea :maxlength="500" placeholder="请输入备注内容" v-model="remark"></textarea>
    </div>
    
    <div class="part-batchIn-footer">
      <el-button type="text" @click="addPart" icon="el-icon-plus" :disabled="isAddBtnDisabled"> 添加</el-button>
      <p v-if="isAddBtnDisabled">
        单次批量操作最多支持20条。
      </p>
    </div>
  </div>
</template>

<script>
import MathUtil from '@src/util/math';

export default {
  name: 'part-spares-batch-form',
  inject: ['initData'],
  props: {
    sparepartConfig: Object,
    repertory: Array,
    repertories: {
      type: Array,
      default: () => []
    }
  },
  data(){
    return {
      repertorys: [],
      userId: '',
      user: {
        loading: false
      },
      repertoryTargetText: '',
      form: [],
      remark:'',
      userName: '',
      isAddBtnDisabled: false
    }
  },
  computed: {
    // TODO: 支持小数 提示
    minVariation () {
      let initData = this.initData;
      return !initData || !initData.precision ? 1 : (initData.precision == 1 ? 0.1 : 0.01);
    },
  },
  methods: {
    chooseSelect(val) {
      let name = '';
      this.repertorys.forEach(user => {
        if(user.userId == val) {
          name = user.displayName;
        }
      })
      this.userName = name;
      this.form.forEach(item => {
        this.$set(item, 'repertoryTarget', name);
      })
      this.$set(this.form[0], 'repertoryTarget', val)
    },
    remove(row){
      let index = -1;
      for(let i = 0; i < this.form.length; i++){
        if(this.form[i] == row){
          index = i;
          break;
        }
      }
      if(index >= 0) this.form.splice(index, 1);
      if(index == 0 && this.form.length > 0) {
        this.chooseSelect('');
        this.$set(this.form[0], 'isFirst', true);
        this.getFetchUsers();
      }
    },
    addPart() {
      if (this.form.length > 19) {
        this.isAddBtnDisabled = true;
        return this.$message({
          showClose: true,
          message: '最多添加20个备件',
          type: 'error'
        });
      }
      let row = this.add(null);
      this.form.push(row);
      if(this.form.length == 1) {
        this.getFetchUsers();
      }
    },
    add(event, row = {}){

      let repertories = this.repertory || [];

      let repertory = row.repertory || {};
      let sparepart = row.sparepart || {};

      let id = `${repertory.id }_${ sparepart.id}`;
      return {
        _id: id,
        sparepart: sparepart.id || '',
        sparepartName: sparepart.name || '',
        serialNumber: sparepart.serialNumber || '',
        sparepartType: sparepart.type || '',
        standard: sparepart.standard || '',
        type: '批量分配',
        repertory: repertory.id || repertories[0].id,
        repertoryTarget: this.userName || '',
        variation: 1,
        sparepartas: [],
        repertoryCount: row.repertoryCount || 0, // 库存数量
        safetyStock: row.safetyStock || ''
      }
    },
    selectPart(row){
      let that = this
      return function(keyword, cb){
        that.fetchSparepart(keyword, cb, row)
      }
    },
    fetchSparepart(keyword, cb, row){
      row.sparepartName = keyword;
      if(!keyword) {
        row.sparepart = '';
      }
      let model = {
        keyWord: keyword,
        pageSize: 50,
        pageNum: 1,
        enable: 1,
        repertoryId: row.repertory,
        managers: [this.userId]
      }

      this.$http.get('/partV2/repertory/list', model)
        .then(result => cb(result.list))
        .catch(err => console.log(err))
    },
    getFetchUsers(keyword) {
      let params = {
        pageSize: 50,
        tagIds: [],
        keyword
      }
      this.user.loading = true;

      this.$http.get('/partV2/repertory/users', params)
        .then(result => {
          let repertorys = result;
          if(this.form.length > 0 && !keyword) {
            this.$set(this.form[0], 'isFirst', true);
            // this.repertorys = repertorys;
          }
          this.repertorys = repertorys;
        })
        .catch(err => console.warn(err))
        .finally(() => this.user.loading = false);
    },
    hasRow(value){
      return this.form.some(item => item._id == value)
    },
    async chooseRepertory(val, row) {
      row.sparepartName = '';
      row['_id'] = '';
      row.sparepart = '';
      row.sparepartName = '';
      row.serialNumber = '';
      row.sparepartType = '';
      row.standard = '';
      row.repertoryCount = '';
      row.safetyStock = '';
      row.repertory = val;
    },
    choosePart(value, row){
      let id = `${row.repertory }_${ value.sparepart.id}`;
      
      // if(this.hasRow(id)) {
      //   this.$platform.toast('该记录已存在！', "warning");
      //   row.sparepart = ''
      //   return
      // }
      row['_id'] = id;
      row.sparepart = value.sparepart.id;
      row.sparepartName = value.sparepart.name;
      row.serialNumber = value.sparepart.serialNumber;
      row.sparepartType = value.sparepart.type;
      row.standard = value.sparepart.standard;
      row.repertoryCount = value.repertoryCount;
      row.safetyStock = value.safetyStock || null;
    },
    async pack(){
      let form = this.form;
      try {
        let message = [];
        let msgStr = '';
        let repertorys = [];
        let firstRepertoryId = '';
        if(form.length > 0) {
          firstRepertoryId = form[0].repertory;
        }

        form.forEach((item, index) => {
          repertorys.push(item.repertory);
        })
        // 仓库 去重 
        let uniqueRepertorys = [...new Set(repertorys)];

        let ids = [];
        for(let j = 0; j < uniqueRepertorys.length; j++) {
          let repertory = uniqueRepertorys[j];
          for(let i = 0; i < this.repertories.length; i++) {
            let item = this.repertories[i];
            if(item.id == repertory) {
              ids.push(item.teamIds || []);
              break;
            }
          }
        }
        // 请求数据
        let requests = [];
        ids.forEach((item, index) => {
          if(Array.isArray(item)) {
            let tagIds = item.map(id => id.id);
            requests.push(this.fetchData(tagIds))
          }
        })
        let results = await Promise.all(requests);
        for(let r = 0; r < ids.length; ++r) {
          let users = JSON.parse(JSON.stringify(results[r]));
          if(users.some(item => item.userId == form[0].repertoryTarget)) {
            ids.splice(r, 1);
            results.splice(r, 1);
            --r
          }
        }
        let repertoriesIds = [];
        for(let a = 0; a < this.repertories.length; a++) {
          let rep = this.repertories[a];
          for(let b = 0; b < ids.length; b++) {
            let teamIds = ids[b];
            if(rep.teamIds == teamIds) {
              repertoriesIds.push(rep.id);
              break;
            }
          }
        }
        let bool = false;
        let initData = this.initData;
        form.forEach((item, index) => {
          // bool = false;
          let count = this.decimalNumber(item.variation);
          if(repertoriesIds.indexOf(item.repertory) > -1){
            // 判断是库的 管理员
            let users = [];
            for(let i = 0; i < this.repertories.length; i++) {
              let repertory = this.repertories[i];
              
              if(repertory.id == item.repertory) {
                users = repertory.manager;
                let isPartAdmin = users.some(user => user.userId == this.form[0].repertoryTarget);
                if(!isPartAdmin) {
                  message.push(`第${index + 1}行,仓库中暂无此目标库，请删除或重新选择目标库`);
                  bool = true;
                  break;
                }
              }
            }
          }
          if( !item.sparepart 
              || !item.repertory 
              || !item.repertoryTarget 
              || item.variation <= 0 
              || item.repertoryCount == 0
              || item.variation > Number(item.repertoryCount)
              || count != -1){
            if(!bool) {
              msgStr = '仓库、备件、目标库不能为空；';
              msgStr += initData.precision == 0 ? '数量为大于0的正整数' : `数量大于0，支持${ initData.precision }位小数`
            }
          }
        })
        msgStr ? message.push(msgStr) : '';
        if(message.length > 0){
          // 
          if(message.length > 4) {
            message = message.slice(0, 4);
            message[message.length - 1] += '...'
          }
          this.$platform.alert(message.join('\n'))
          return null;
        } 
        return form.map(item => ({
          sparepartId: item.sparepart,
          repertoryId: item.repertory,
          variation: item.variation,
          targetId: form[0].repertoryTarget,
          remark: this.remark
        }));
      } catch (error) {
        console.log(error)
      }
      return null;
    },
    fetchData(tagIds){
      let params = {
        pageSize: 0,
        tagIds
      }

      return this.$http.get('/partV2/repertory/users', params)
    },
    async remarkText() {
      return this.remark
    },
    receive(data = [], userId = ''){
      if (data.length > 20) {
        return this.$platform.alert('单次最多支持分配20个备件');
      }

      this.form = data.map(item => this.add(null, item));
      if(this.form.length >= 1) {
        this.getFetchUsers();
      }
      this.userId = userId;
    },
    decimalNumber(num) {
      let initData = this.initData;
      let count = MathUtil.decimalNumber(num);
      let isPartV2 = initData.isSparepart2;

      if(!isPartV2 && count != 0) return 0;
      if(initData.precision >= count) return -1;
      return initData.precision;
    }
  }
}
</script>

<style lang="scss">
.el-form-item{
  margin-bottom: 0
}

.part-batchIn-form{
  td,th{
    padding: 5px 0;
  }
  .cell {
    padding: 0 5px;
  }
}

.part-batchIn-footer{
  padding-top: 10px;
  text-align: center;
}

.batch-in-part{
  width: 200px !important;

  li{
    padding: 5px;
    margin: 0 10px;
    border-bottom: 1px solid #f0f0f0;
    overflow: hidden;

    &:last-child{
      border-color: transparent;
    }
  }
}

.bacth-in-part-item{

  p{
    width:100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    line-height: 24px;
    margin: 0;
  }
}
.in-stock-remark{
  width:100%;
  display:flex;
  margin:10px 0 0;
  padding:0 5px;
  textarea{
    flex:1;
    height:40px;
    min-height:40px;
    padding:10px;
    border-color:#dadada;
    &:focus{
      outline: none;
      border-color: $color-primary;
    }  
  }   
}
</style>