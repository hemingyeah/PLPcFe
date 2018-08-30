<template>
  <div class="customer-list-search-group-container">
    <div class="base-search">
      <div>
        <el-input v-model="params.keyword" placeholder="根据客户信息搜索"></el-input>
        <el-button type="primary" @click="search">搜索</el-button>
        <el-button type="primary" class="reset-btn" @click="resetParams">重置</el-button>
      </div>

      <el-button type="primary"  @click="advancedSearchPanelShow = !advancedSearchPanelShow" class="advanced-search-visible-btn">高级搜索</el-button>
    </div>

    <base-panel :show.sync="advancedSearchPanelShow" width="420px" class="advanced-search-form-wrap">
      <h4 class="panel-title">高级搜索</h4>
      <el-form ref="form" :model="form" label-width="100px" class="advanced-search-form">
        <el-form-item label="客户编号">
          <el-input type="text" v-model="form.serialNumber"></el-input>
        </el-form-item>
        <el-form-item label="联系人">
          <el-select
            v-model="form.linkmanId"
            filterable
            remote
            reserve-keyword
            placeholder="请输入关键词"
            :loading="searchLinkmanLoading"
            :remote-method="searchLinkman">
            <el-option
              v-for="item in linkmanOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="选择团队">
          <el-select
            v-model="form.tagId"
            filterable
            remote
            reserve-keyword
            placeholder="请输入关键词"
            :loading="searchTagLoading"
            :remote-method="searchTag">
            <el-option
              v-for="item in tagOptions"
              :key="item.id"
              :label="item.tagName"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="区域">
          <base-dist-picker field="address" v-on:city-selector-change="handleCitySelectorChange"></base-dist-picker>
        </el-form-item>
        <el-form-item label="详细地址">
          <el-input type="text" v-model="form.adAddress"></el-input>
        </el-form-item>
        <el-form-item label="有无提醒">
          <el-select v-model="form.hasRemind" placeholder="请选择">
            <el-option :value="null" label="全部"></el-option>
            <el-option :value="1" label="有"></el-option>
            <el-option :value="0" label="无"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" placeholder="请选择">
            <el-option :value="null" label="全部"></el-option>
            <el-option :value="1" label="启用"></el-option>
            <el-option :value="0" label="禁用"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="创建人">
          <el-select
            v-model="form.createUser"
            filterable
            remote
            reserve-keyword
            placeholder="请输入关键词"
            :loading="searchCreatorLoading"
            :remote-method="searchCreator">
            <el-option
              v-for="item in creatorOptions"
              :key="item.userId"
              :label="item.displayName"
              :value="item.userId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="客户负责人">
          <el-select
            v-model="form.customerManager"
            filterable
            remote
            reserve-keyword
            placeholder="请输入关键词"
            :loading="searchCustomerManagerLoading"
            :remote-method="searchCustomerManager">
            <el-option
              v-for="item in customerManagerOptions"
              :key="item.userId"
              :label="item.displayName"
              :value="item.userId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="form.createTime"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="createTimePickerOptions">
          </el-date-picker>
        </el-form-item>

        <!-- 动态搜索框 -->
        <el-form-item :label="field.displayName" v-for="field in searchFields" :key="field.fieldName">
          <template v-if="field.formType === 'text' || field.formType === 'code'">
            <el-input v-model="form[field.fieldName]" :placeholder="field.placeHolder" type="text"></el-input>
          </template>
          <template v-else-if="field.formType === 'select' || field.formType === 'selectMulti'">
            <el-select v-model="form[field.fieldName]" :placeholder="field.placeHolder">
              <el-option
                v-for="item in field.setting.dataSource"
                :key="item"
                :label="item"
                :value="item"
                :disabled="item.disabled">
              </el-option>
            </el-select>
          </template>
          <template v-else-if="field.formType === 'number'">
            <el-input v-model="form[field.fieldName]" :placeholder="field.placeHolder" type="number"></el-input>
          </template>
          <template v-else-if="field.formType === 'date' || field.formType === 'datetime'">
            <el-date-picker
              v-model="form[field.fieldName]"
              type="daterange"
              align="right"
              unlink-panels
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="createTimePickerOptions">
            </el-date-picker>
          </template>
          <template v-else-if="field.formType === 'user'">
            <el-select
              v-model="form[field.fieldName]"
              filterable
              remote
              reserve-keyword
              placeholder="请输入关键词"
              :loading="searchCreatorLoading"
              :remote-method="searchCreator">
              <el-option
                v-for="item in creatorOptions"
                :key="item.userId"
                :label="item.displayName"
                :value="item.userId">
              </el-option>
            </el-select>

          </template>
          <template v-else>
            <el-input v-model="form[field.fieldName]" :placeholder="field.placeHolder"></el-input>
          </template>
        </el-form-item>

        <div class="advanced-search-btn-group">
          <el-button type="primary" class="reset-btn" @click="resetParams">重置</el-button>
          <el-button type="primary" class="search-btn" @click="search">搜索</el-button>
        </div>
      </el-form>
    </base-panel>


  </div>
</template>

<script>
  import _ from 'lodash';
  import BaseDistPicker from '../../../component/common/BaseDistPicker';
  import BasePanel from '../../../component/common/BasePanel';

  export default {
    name: "search-group",
    data() {

      return {
        // searchFields: [],
        linkmanOptions: [],
        tagOptions: [],
        creatorOptions: [],
        customerManagerOptions: [],
        searchLinkmanLoading: false,
        searchTagLoading: false,
        searchCreatorLoading: false,
        searchCustomerManagerLoading: false,
        advancedSearchPanelShow: false,
        form: {
          serialNumber: null,
          linkmanId: null,
          tagId: null,
          address: [],
          customerAddress: {
            adProvince: '',
            adCity: '',
            adDist: '',
            adAddress: '',
          },
          hasRemind: null,
          status: null,
          createUser: null,
          createTime: null,
        },
        params: {
          linkmanName: '',
          createUserName: '',
          tagName: '',
          customerManagerName: '',
          keyword: '',
          isAdvanced: 0,
          viewId: '',
          serialNumber: '',
          linkmanId: '',
          customerAddress: {
            adProvince: '',
            adCity: '',
            adDist: '',
            adAddress: '',
          },
          hasRemind: '',
          status: '',
          createUser: '',
          customerManager: '',
          createTime: '',
          pageNum: 1,
          pageSize: 10,

        },
        createTimePickerOptions: {
          shortcuts: [{
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }]
        },
      };
    },
    props: {
      customerConfig: {
        type: Object,
        default: () => ({}),
      }
    },
    computed: {
      searchFields() {
        if (!this.customerConfig.fieldInfo) return [];
        return this.customerConfig.fieldInfo
          .filter(f => {
            if (f.isSearch) {
              // 需要搜索的字段
              this.$set(this.form, f.fieldName, null);
              return f;
            }
          });
      },
    },
    watch: {
      form: {
        handler: function (newValue) {
          console.log('newValue', newValue);
        },
        deep: true
      }
    },
    created () {
      let self = this;
      this.$eventBridge.$on('modifySearchParams', function (payload) {
        self.modifySearchParams(payload);
      })
    },
    mounted() {
      // init pageSize
      const dataStr = localStorage.getItem('customerListData') || '{}';
      const localStorageData = JSON.parse(dataStr);
      if (localStorageData.pageSize) {
        this.params.pageSize = Number(localStorageData.pageSize);
      }

      this.search();

    },
    methods: {
      modifySearchParams(params) {
        if (params && params.pageSize) {
          this.params.pageSize = params.pageSize;
          this.params.pageNum = 1;
        }
        if (params && params.pageNum) {
          this.params.pageNum = params.pageNum;
        }

        console.log('modify params', params);
        this.search();
      },
      handleChange(value) {
        console.log('handleChange value', value);

      },
      search() {
        const params = this.buildParams();

        this.$emit('search-list', params);
      },
      buildParams() {
        let params = _.cloneDeep(this.params);
        for(let key in params.customerAddress) {
          if (!params.customerAddress[key]) {
            delete params.customerAddress[key];
          }
        }
        for(let key in params) {
          if (!params[key] || (typeof params[key] === 'object' && !Object.keys(params[key]).length)) {
            delete params[key];
          }

        }
        return params;
      },
      resetParams() {
        this.params = {
          linkmanName: '',
          createUserName: '',
          tagName: '',
          customerManagerName: '',
          keyword: '',
          isAdvanced: 0,
          viewId: '',
          serialNumber: '',
          linkmanId: '',
          customerAddress: {
            adProvince: '',
            adCity: '',
            adDist: '',
            adAddress: '',
          },
          hasRemind: '',
          status: '',
          createUser: '',
          customerManager: '',
          createTime: '',
          pageNum: 1,
          pageSize: 10,

        }
        this.search();
      },
      handleCitySelectorChange(city) {
        this.form[city.field] = city.value;
      },
      // input search method
      searchCustomerManager(keyword) {
        this.searchCustomerManagerLoading = true;
        this.$http.get('/customer/userTag/list', { keyword: keyword, pageNum: 1, })
          .then(res => {
            this.customerManagerOptions = res.list;
            this.searchCustomerManagerLoading = false;
          })
      },
      searchCreator(keyword) {
        this.searchCreatorLoading = true;
        this.$http.get('/customer/userTag/list', { keyword: keyword, pageNum: 1, })
          .then(res => {
            this.creatorOptions = res.list;
            this.searchCreatorLoading = false;
          })
      },
      searchLinkman(keyword) {
        this.searchLinkmanLoading = true;
        this.$http.get('/linkman/getListAsyn', { keyword: keyword, pageNum: 1, })
          .then(res => {
            this.linkmanOptions = res.list;
            this.searchLinkmanLoading = false;
          })
      },
      searchTag(keyword) {
        this.searchTagLoading = true;
        this.$http.get('/task/tag/list', { keyword: keyword, pageNum: 1, })
          .then(res => {
            this.tagOptions = res.list;
            this.searchTagLoading = false;
          })
      },
    },
    components: {
      [BaseDistPicker.name]: BaseDistPicker,
      [BasePanel.name]: BasePanel,
    }
  }
</script>

<style lang="scss">
  .customer-list-search-group-container {

    .advanced-search-function, .base-search {
      background: #fff;
      border-radius: 3px;
    }

    .base-search {
      font-size: 14px;
      display: flex;
      justify-content: space-between;
      padding: 12px 24px;

      div {
        .el-input {
          width: 260px;
          margin-right: 10px;
        }
        .el-button {
          font-size: 14px;
          font-weight: lighter;
          height: 32px;
          line-height: 12px;
        }
        .reset-btn {
          color: #9398a0;
          border-color: #e0e1e2;
          background: #fff;
        }
      }

      .advanced-search-visible-btn {
        font-size: 14px;
        font-weight: lighter;
        height: 32px;
        line-height: 12px;
        color: #00ac97;
        border-color: #00ac97;
        background: #fff;
      }
    }

    .advanced-search-form-wrap {
      .panel-title {
        font-size: 18px;
        line-height: 60px;
        padding-left: 25px;
        color: rgb(132, 138, 147);
        border-bottom: 1px solid rgb(242, 248, 247);
        font-weight: normal;
      }
      .advanced-search-form {
        .el-form-item {
          .el-form-item__content,
          .el-select,
          .base-dist-picker,
          .el-cascader,
          .el-date-editor
          {
            width: 290px;
          }
        }

        .advanced-search-btn-group {
          display: flex;
          justify-content: space-between;
          width: 365px;
          height: 40px;
          margin: 0 auto 25px;

          .el-button {
            width: 160px;
            font-size: 18px;
            font-weight: lighter;
          }
          .reset-btn {
            background: #E5E8F0;
            color: #656B77;
            border: #656B77;
          }
        }
      }
    }

    .advanced-search-function {
      margin-top: 10px;
      padding-bottom: 10px;

      h4 {
        border-bottom: 1px solid #f4f4f4;
        padding: 10px;
      }

      .el-row {
        padding: 5px 0;
      }
      .input-label {
        text-align: right;
        line-height: 32px;
        padding-right: 0;
      }

    }

  }
</style>