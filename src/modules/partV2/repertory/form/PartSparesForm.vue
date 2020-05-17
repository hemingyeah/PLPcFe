<template>
  <section class="part-spares-form-view">
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" label-position="right" class="demo-ruleForm">
      <!-- 备件名称 -->
      <el-form-item label="备件名称:" prop="name">
        <el-input v-model="ruleForm.name" readonly></el-input>
      </el-form-item>
      <!-- 备件编号 -->
      <el-form-item label="备件编号:" prop="serialNumber">
        <el-input v-model="ruleForm.serialNumber" readonly></el-input>
      </el-form-item>
      <!-- 备件类别 -->
      <el-form-item label="备件类别:" prop="type">
        <el-input v-model="ruleForm.type" readonly></el-input>
      </el-form-item>
      <!-- 备件规格 -->
      <el-form-item label="备件规格:" prop="standard">
        <el-input v-model="ruleForm.standard" readonly></el-input>
      </el-form-item>
      <!-- 现仓库 -->
      <el-form-item label="仓库:" prop="currentDepot">
        <el-input v-model="ruleForm.currentDepot" readonly></el-input>
      </el-form-item>
      <!-- 安全库存 -->
      <el-form-item label="安全库存:" prop="safetyStock">
        <el-input v-model="ruleForm.safetyStock" readonly></el-input>
      </el-form-item>
      <!-- 库存数 -->
      <el-form-item label="库存数:" prop="repertoryCount">
        <el-input v-model="ruleForm.repertoryCount" readonly>
        </el-input>
        <el-tooltip class="item" effect="dark" v-if="isSafetyStock" :content="`安全库存：${ruleForm.safetyStock}`" placement="top">
          <el-tag v-if="isSafetyStock" size="mini" type="danger" class="tag-position">库存提醒</el-tag>
        </el-tooltip>
      </el-form-item>
      <!-- 个人库 -->
      <el-form-item label="个人库:" prop="repertory">
        <el-select 
          v-model="ruleForm.repertory" 
          @change="chooseSelect"
          :remote-method="getFetchUsers"
          filterable
          clearable
          remote
          :loading="user.loading"
          placeholder="请选择个人库">

          <el-option v-for="option in repertorys" :key="option.userId" :label="option.displayName" :value="option.userId">
            <div class="srp-user-item">
                <img :src="option.head || '/resource/images/account_userhead.png'">
                <p>{{option.displayName}}</p>
            </div>
          </el-option>

        </el-select>
      </el-form-item>
      <!-- 个人库存数 -->
      <el-form-item label="个人库存数:" prop="personLibraryNum">
        <el-input :value="ruleForm.personLibraryNum" readonly></el-input>
      </el-form-item>
      <!-- 分配数 -->
      <el-form-item label="分配数:" prop="sparesNum">
        <el-input v-model="ruleForm.sparesNum" :min="0" :max="ruleForm.repertoryCount" type="number" step="any"></el-input>
      </el-form-item>
      <!-- 操作类型 -->
      <el-form-item label="操作类型:" prop="operationType">
        <el-input v-model="ruleForm.operationType" readonly></el-input>
      </el-form-item>
      <!-- 备注 -->
      <el-form-item label="备注:" prop="remarks">
        <el-input
          type="textarea"
          :rows="4"
          :maxlength="500"
          placeholder="请输入备注"
          v-model="ruleForm.remarks">
        </el-input>
      </el-form-item>
    </el-form>
  </section>
</template>

<script>
  import MathUtil from '@src/util/math';

  export default {
    name: 'part-spares-form',
    inject: ['initData'],
    props: {
      formdata: Object,
      repertory: Array,
      repertories: {
        type: Array,
        default: () => []
      }
    },
    data() {
      // TODO: 悬浮提示
      var validateCount = (rule, value, callback) => {
        const val = Number(value);
        const count = this.decimalNumber(val);
        let num = this.ruleForm.repertoryCount;
        if (value == '' || val < 0) {
          callback(new Error('数量不能为空且要大于0'))
        } else if (val > num) {
          callback(new Error('数量不能大于库存数'))
        } else if (count != -1 && count == 0) {
          callback(new Error('请填写大于0的正整数'));
        } else if (count != -1 && count != 0) {
          callback(new Error(`请填写大于0的${ count }位小数`))
        } else {
          callback();
        }
      };
      return {
        repertorys: [],
        userId: '',
        user: {
          loading: false,
        },
        ruleForm: {
          name: '',
          serialNumber: '',
          type: '',
          standard: '',
          currentDepot: '',
          safetyStock: '',
          repertoryCount: 0,
          repertory: [],
          personLibraryNum: '',
          sparesNum: 1,
          operationType: '',
          remarks: ''
        },
        rules: {
          repertory: [
            { required: true, message: '请选择个人库', trigger: 'change' }
          ],
          sparesNum: [
            { type: 'number', validator: validateCount, required: true, message: '', trigger: 'change' }
          ],

        }
      }
    },
    computed: {
      // TODO: 支持小数 提示
      minVariation () {
        let initData = this.initData;
        return !initData || !initData.precision ? 1 : (initData.precision == 1 ? 0.1 : 0.01);
      },
      isSafetyStock() {
        return this.ruleForm.safetyStock && (Number(this.ruleForm.safetyStock) > this.ruleForm.repertoryCount)
      }
    },
    created() {
      let initData = this.initData;
      this.userId = initData.userId || '';

      let data = this.formdata;
      // 赋值
      this.ruleForm.name = data.sparepart.name;
      this.ruleForm.serialNumber = data.sparepart.serialNumber;
      this.ruleForm.type = data.sparepart.type;
      this.ruleForm.standard = data.sparepart.standard;
      this.ruleForm.currentDepot = data.repertory.name;
      this.ruleForm.safetyStock = data.safetyStock;
      this.ruleForm.repertoryCount = data.repertoryCount || 0;
      this.ruleForm.sparesNum = data.repertoryCount > 0 ? 1 : 0;
      this.ruleForm.repertory = '';
      this.ruleForm.operationType = '分配出库';
      this.ruleForm.repertoryId = data.repertory.id;
      this.ruleForm.sparepartId = data.sparepart.id;

    },
    mounted() {
      this.getUserHoldPartCount();
      this.getFetchUsers();
    },
    methods: {
      chooseSelect(userId) {
        this.getUserHoldPartCount(userId);
      },
      getUserHoldPartCount(userId) {
        this.$http.get(`/partV2/repertory/user/stock/count?sparepartId=${this.ruleForm.sparepartId}&userId=${userId}`)
          .then(result => {
            this.ruleForm.personLibraryNum = result || 0;
          });
      },
      getFetchUsers(keyword) {
        let params = {
          pageSize: 50,
          tagIds: [],
          keyword: keyword
        }
        this.repertories.forEach(item => {
          
          if(item.name == this.ruleForm.currentDepot) {
              Array.isArray(item.teamIds) ? item.teamIds.forEach(id => {
                params.tagIds.push(id.id)
              }) : '';
          }
        })
        this.user.loading = true

        this.$http.get('/partV2/repertory/users', params)
        .then(result => {
          let repertorys = result;
          // 判断是当前库的 管理员
          let users = [];
          if(!this.ruleForm.repertory) {
            for(let i = 0; i < this.repertories.length; i++) {
              let repertory = this.repertories[i];
              
              if(repertory.name == this.ruleForm.currentDepot) {
                users = repertory.manager;
                users.forEach(user => {
                  let bool = repertorys.some(item => item.userId == user.userId);
                  if(!bool) {
                    if(keyword) {
                      if(user.displayName.indexOf(keyword) > -1) {
                        repertorys.push(user)
                      }
                    } else {
                      repertorys.push(user);
                    }
                  }
                })
              }
            }
            // this.repertorys = repertorys;
          }
          this.repertorys = repertorys;

        })
        .catch(err => console.error(err))
        .finally(() => this.user.loading = false);
      },
      pack() {
        let _this = this;
        try {
          let bool = false;
          this.$refs['ruleForm'].validate((valid) => {
            let num = this.ruleForm.repertoryCount;
            if (Number(this.ruleForm.sparesNum) > Number(num)) {
              this.$platform.alert('分配数不能大于库存数');
              return false
            }
            if (valid && (this.ruleForm.repertoryCount != '0')) {
              bool = valid;
              if(!this.ruleForm.repertory) {
                return false
              }

            } else {
              if((this.ruleForm.repertoryCount == '0')) {
                this.$platform.alert('库存数为0，暂时不能分配');
              }
              return false;
            }
          });
          if(bool) {
            return _this.ruleForm
          }
        } catch (e) {
          console.error('err', e);
        }
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
  .part-spares-form-view {

    .el-dialog .el-dialog__body {
        padding-right: 30px;
    }

    .el-form-item {
      margin: 0;
    }
    .el-form-item__error {
      position: relative;
    }
  }
</style>
