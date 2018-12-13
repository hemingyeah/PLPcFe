<template>
  <section class="team-create-view">
    <!-- start 新建团队 内容 -->
    <div class="team-create-content">
      <!-- start 按钮 -->
      <div class="team-tool-bar">
        <div class="title">
          <base-button type="only-text" icon="icon-arrow-left" @event="goBack">返回</base-button>
          <span class="text">|</span>
          <span class="text">团队信息</span>
        </div>
        <el-button size="small" :disabled="pending" native-type="submit" type="primary"><i class="iconfont icon-commit1"></i> 提交</el-button>
      </div>
      <!-- end 按钮 -->
      <!-- start 新建团队 -->
      <div class="team-create-form form-builder">
        <!-- start form -->
        <el-form ref="form" :rules="rules" :model="form" label-width="120px">
          <el-form-item label="团队名称" prop="name">
            <el-input v-model="form.name"></el-input>
          </el-form-item>
          <el-form-item label="团队描述">
            <el-input v-model="form.description" maxlength="30"></el-input>
          </el-form-item>
          <el-form-item label="团队主管" prop="charge">
            <el-select multiple :value="form.charge" @input="teamChargeSelectChange" placeholder="请选择团队主管">
              <el-option 
                v-for="(user) in users"
                :key="user.userId"
                :label="user.displayName"
                :value="user.userId">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="主管权限" prop="chargeRole">
            <el-radio v-model="form.chargeRole" label="admin" :disabled="form.chargeRoleDisabled">团队管理员(团队主管将自动获得团队管理员角色权限)</el-radio>
          </el-form-item>
          <el-form-item label="联系方式" prop="phone">
            <el-input v-model="form.phone"></el-input>
          </el-form-item>
          <el-form-item label="团队位置">
            <div class="address-picker">
              <base-dist-picker @input="teamLocationSelectorChange" ref="baseDistPicker" :value="form.address.adAddress"></base-dist-picker>
              <el-button type="button" @click="chooseMap" style="margin-bottom: 10px">地图选址</el-button>
            </div>
            <el-input placeholder="请输入详细地址...[最多50字]" maxlength="50" @input="teamDetailAddressChange" :value="form.address.detail" type="text"/>
          </el-form-item>
          <el-form-item label="负责区域">
            <div class="form-region-view">
              <p class="form-region-text">
                设置团队的服务区域用于新建客户时自动分配客户所属服务团队
              </p>
              <base-button type="text" @event="regionAdd">添加</base-button>
            </div>
            <div class="address-picker" v-for="(region, index) in form.regions" :key="index">
              <base-dist-picker @input="teamRegionSelectorChange" ref="baseDistPicker" :value="region"></base-dist-picker>
              <base-button type="danger" @event="regionDelete(index)">删除</base-button>
            </div>
          </el-form-item>
          
        </el-form>
        <!-- end form -->
      </div>
      <!-- end 新建团队 -->
    </div>
    <!-- end  新建团队内容 -->
  </section>
</template>

<script>
import url from "url";

export default {
  name: 'team-create-view',
  data() {
    let checkPhone = (rule, value, callback) => {
      const reg = /^(((0\d{2,3}-{0,1})?\d{7,8})|(1[3578496]\d{9})|([+][0-9-]{1,30}))$/;
      if (!reg.test(value)) {
        callback(new Error('请输入正确的联系方式'));
      }
      callback();
    }
    return {
      auth: {},
      allowEdit: true, // TODO: 是否含有编辑的权限
      addContactDialog: false,
      addresses: [],
      defaultAddress: [],
      loadingPage: false,
      pending: false,
      products: [],
      form: {
        name: '',
        description: '',
        charge: '',
        chargeRole: null,
        chargeRoleDisabled: false,
        phone: '',
        address: {
          adAddress: []
        },
        regions: []
      },
      rules: {
        name: [
          { required: true, message: '请输入活团队名称', trigger: 'blur' },
          { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'change' }
        ],
        charge: [
          { required: true, message: '请选择团队主管', trigger: 'change' }
        ],
        chargeRole: [
          { required: true, message: '请选择主管权限', trigger: 'change' }
        ],
        phone:  [
          { validator: checkPhone, message: '请输入正确的联系方式', trigger: ['change', 'blur']}
        ]
        
      },
      loadData: false,
      teamId: '',
      users: []
    }
  },
  computed: {
    fields() {
      return [{
        formType: 'text',
        fieldName: 'name',
        displayName: "团队名称",
        placeholder: '团队名称[最多10字]',
        isNull: 0,
      }, {
        formType: 'text',
        fieldName: 'description',
        displayName: "团队描述",
        placeholder: '团队描述[最多30字]',
        isNull: 1,
      }, {
        formType: 'select',
        fieldName: 'charge',
        displayName: "团队主管",
        placeholder: '请选择团队主管',
        isNull: 0,
        setting: {
          isMulti: true,
          dataSource: ['黄', '宝'],
        }
      }, {
        formType: 'phone',
        fieldName: 'phone',
        displayName: "联系方式",
        placeholder: '',
        isNull: 1,
      }, {
        formType: 'address',
        fieldName: 'teamAddress',
        displayName: "团队位置",
        placeholder: '',
        isNull: 1,
      }, {
        formType: 'select',
        fieldName: 'address',
        displayName: "关联地址",
        placeholder: '请选择',
        isNull: 1,
        setting: {
          dataSource: this.addresses || [],
        }
      }]
    },
  },
  watch: {
    'form.chargeRole'(newVal) {
      if(newVal) {
        this.form.chargeRoleDisabled = true;
      }
    }
  },
  mounted() {
    let initData = JSON.parse(window._init) || {};
    let urlParams = url.parse(window.location.href, true);
    this.teamId = urlParams.query.id;

    this.teamConfig = {
      teamConfig: initData.teamConfig,
    };

    this.auth = initData.auth || {};

    // const {adProvince, adCity, adDist,} = this.teamConfig.teamConfig;

    // this.defaultAddress = [adProvince, adCity, adDist,];
    // this.form.address = this.defaultAddress.slice();

    this.fetchUsers();
  },
  methods: {
    fetchUsers() {
      let params = {
        pageSize: 0,
        tagId: this.teamId,
      }
      try {
        this.$http.post('/security/tag/userList', params, false)
          .then(res => {
            this.users = res.list;
          })
          .catch(err => console.error('fetchUsers err', err));
      } catch (e) {
        console.error('fetchUsers catch error', e);
      }
    },
    goBack() {
      window.parent.frameHistoryBack(window);
    },
    jump() {
      // 
    },
    async submit() {
      try {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            this.pending = false;
            this.goBack();
          } else {
            console.log('error submit!!');
            return false;
          }
        });

      } catch (e) {
        this.pending = false;
        console.error('team create submit catch e', e);
      }
    },
    update({field, newValue, oldValue}) {
      let {fieldName, displayName} = field;
      if (this.$appConfig.debug) {
        console.info(`[FormBuilder] => ${displayName}(${fieldName}) : ${JSON.stringify(newValue)}`);
      }
      this.$set(this.form, fieldName, newValue)
    },
    /** 地图选址 */
    chooseMap() {
      let defaultArea = this.form.address.adAddress.filter(a => a !== '郊县' && a !== '市辖区' && a.indexOf('其他') === -1);

      this.$fast.map.picker({}, { defaultArea: defaultArea[defaultArea.length - 1]}).then(result => {

        if (result.status === 1) return;

        const { province, city, dist, address, latitude, longitude} = result.data;

        const newVal = {
          adAddress: [ province, city, dist,],
          detail: address,
          latitude,
          longitude,
          addressType: 1,
        };
        this.form.address = newVal;
      })
        .catch(err => console.error(err));
    },
    teamChargeSelectChange(value) {
      this.form.charge = value;
      this.form.chargeRole = 'admin';
      this.form.chargeRoleDisabled = true;
    },
    /** 团队位置 */
    teamLocationSelectorChange() {
      // 
    },
    /** 团队详细位置 */ 
    teamDetailAddressChange() {
      // 
    },
    /** 团队负责区域地区 变更 */
    teamRegionSelectorChange() {
      // 
    },
    /** 添加 负责区域 */
    regionAdd() {
      this.form.regions.push([])
    },
    /** 删除 负责区域地区 */
    regionDelete(index) {
      if(this.form.regions.length == 1) {
        this.$set(this.form.regions, '0', []);
      } else {
        this.form.regions.splice(index, 1);
      }
    }
  }
}
</script>

<style lang="scss">
  html, body, .team-create-view{
    height: 100%;
  }
  .team-create-view {
    height: 100%;
    width: 100%;
    overflow: auto;
    padding: 10px;
  }

  .team-create-content {
    height: 100%;

    .team-tool-bar {
      color: $text-color-regular;
      border-bottom: 1px solid #f2f2f2;
      background-color: #fff;
      display: flex;
      justify-content: space-between;
      height: 54px;
      font-size: 14px;
      padding: 10px 15px 10px 0;
      
      .title {
        display: flex;
        justify-content: space-between;
      }
      .text-button,
      .el-button {
        padding: 7px 15px;
      }
      & > .el-button {
        line-height: 17px;
      }
      span.text {
        line-height: 33px;
        margin-right: 12px;
      }

    }
  }

  .team-create-form {
    background-color: #fff;
    padding: 20px 50px;
    width: 100%;
    height: calc(100% - 54px);
    overflow: auto;

    .base-button  {
      height: 32px;
      line-height: 18px;
    }

    .el-input,
    .base-dist-picker,
    .form-region-text {
      width: 600px;
      min-width: 500px;
      max-width: 610px;
      flex: 1;
    }

    .address-picker,
    .form-region-view {
      display: flex;
    }

    .form-region-view,
    .base-dist-picker {
      height: 32px;
      line-height: 32px;
      margin-bottom: 10px;

      .form-region-text {
        color: #9c9c9c;
        margin: 0;
      }
    }

  }
</style>
