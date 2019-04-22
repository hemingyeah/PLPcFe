<template>
  <!-- start 产品模板列表 -->
  <div class="product-template-list-view" ref="productTemplateListPage" v-loading.fullscreen.lock="loadingListData">
    
    <!-- start 搜索 -->
    <div class="product-template-list-search-group">

      <!-- start  搜索header -->
      <form class="base-search" onsubmit="return false;">
        <div class="customer-list-base-search-group">
          <el-input v-model="paramsBackup.keyword" placeholder="请输入关键字">
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
          <base-button type="primary" @event="search({ pageNum: 1, }, true)" native-type="submit">搜索</base-button>
          <base-button type="ghost" @event="paramsReset">重置</base-button>
        </div>
        <span class="advanced-search-visible-btn" @click.self="searchAdvancedPanelShow = !searchAdvancedPanelShow">高级搜索</span>
      </form>
      <!-- end 搜索 header -->

      <!--  start 高级搜索 -->
      <base-panel :show.sync="searchAdvancedPanelShow" :width="panelWidth">
        <h3 slot="title">
          <span>高级搜索</span>
          <el-dropdown class="pull-right" trigger="click" @command="setAdvanceSearchColumn">
            <i class="iconfont icon-xitongguanli customer-panel-btn" style="float: none;"></i>

            <el-dropdown-menu slot="dropdown" class="customer-advance-setting">
              <el-dropdown-item command="1">一栏</el-dropdown-item>
              <el-dropdown-item command="2">两栏</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </h3>
        <el-form class="advanced-search-form" onsubmit="return false;">
          <div class="form-item-container" :class="{'two-columns': columnNum === 2, }">
            <el-form-item label-width="100px" label="客户编号">
              <el-input type="text" v-model="params.serialNumber"></el-input>
            </el-form-item>
            <el-form-item label-width="100px" label="联系人">
              <el-select
                popper-class="advanced-search-linkman"
                v-model="params.linkmanId"
                @change="modifyUser('linkman')"
                filterable
                clearable
                remote
                reserve-keyword
                placeholder="请输入关键词搜索"
                :loading="inputRemoteSearch.linkman.loading"
                :remote-method="searchLinkman">
                <el-option
                  v-for="item in inputRemoteSearch.linkman.options"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                  <p>{{item.name}}</p>
                  <p>电话：{{item.phone || ''}}</p>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label-width="100px" label="选择团队">
              <el-select
                v-model="params.tagId"
                @change="modifyUser('tags')"
                filterable
                clearable
                remote
                reserve-keyword
                placeholder="请输入关键词搜索"
                :loading="inputRemoteSearch.tag.loading"
                :remote-method="searchTag">

                <el-option
                  v-for="item in inputRemoteSearch.tag.options"
                  :key="item.id"
                  :label="item.tagName"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label-width="100px" label="区域">
              <base-dist-picker @input="handleCitySelectorChange" :value="params.specialSearchModel.addressSelector" ref="baseDistPicker"></base-dist-picker>
            </el-form-item>
            <el-form-item label-width="100px" label="详细地址">
              <el-input type="text" v-model="params.specialSearchModel.adAddress"></el-input>
            </el-form-item>
            <el-form-item label-width="100px" label="有无提醒">
              <el-select v-model="params.hasRemind" clearable placeholder="请选择">
                <el-option :value="null" label="全部"></el-option>
                <el-option :value="1" label="有"></el-option>
                <el-option :value="0" label="无"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label-width="100px" label="状态">
              <el-select v-model="params.status" clearable placeholder="请选择">
                <el-option :value="null" label="全部"></el-option>
                <el-option :value="1" label="启用"></el-option>
                <el-option :value="0" label="禁用"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label-width="100px" label="创建人">
              <el-select
                v-model="params.createUser"
                @change="modifyUser('createUser')"
                filterable
                clearable
                remote
                reserve-keyword
                placeholder="请输入关键词搜索"
                :loading="inputRemoteSearch.creator.loading"
                :remote-method="searchCreator">
                <el-option
                  v-for="item in inputRemoteSearch.creator.options"
                  :key="item.userId"
                  :label="item.displayName"
                  :value="item.userId">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label-width="100px" label="客户负责人">
              <el-select
                v-model="params.customerManager"
                @change="modifyUser('customerManager')"
                filterable
                clearable
                remote
                reserve-keyword
                placeholder="请输入关键词搜索"
                :loading="inputRemoteSearch.customerManager.loading"
                :remote-method="searchCustomerManager">
                <el-option
                  v-for="item in inputRemoteSearch.customerManager.options"
                  :key="item.userId"
                  :label="item.displayName"
                  :value="item.userId">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label-width="100px" label="创建时间">
              <el-date-picker
                v-model="params.createTime"
                type="daterange"
                align="right"
                unlink-panels
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :picker-options="createTimePickerOptions">
              </el-date-picker>
            </el-form-item>
            <el-form-item label-width="100px" label="更新时间">
              <el-date-picker
                v-model="params.updateTime"
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
            <el-form-item label-width="100px" :label="field.displayName" v-for="field in searchCustomizeFields"
                          :key="field.fieldName">

              <!-- start text || code -->
              <template v-if="field.formType === 'text' || field.formType === 'code'">
                <el-input v-model="params.customizedSearchModel[field.fieldName]['value']"
                          :placeholder="field.placeHolder" type="text"></el-input>
              </template>
              <!-- end text || code -->

              <!-- start select || selectMulti  -->
              <template v-else-if="field.formType === 'select' || field.formType === 'selectMulti'">
                <el-select 
                  v-model="params.customizedSearchModel[field.fieldName]['value']" 
                  clearable
                  :placeholder="field.placeHolder">
                  <el-option
                    v-for="item in field.setting.dataSource"
                    :key="item"
                    :label="item"
                    :value="item"
                    :disabled="item.disabled">
                  </el-option>
                </el-select>
              </template>
              <!-- end select || selectMulti  -->

              <!-- start number  -->
              <template v-else-if="field.formType === 'number'">
                <el-input v-model="params.customizedSearchModel[field.fieldName]['value']"
                          :placeholder="field.placeHolder" type="number"></el-input>
              </template>
              <!-- end number  -->

              <!-- start date || datetime  -->
              <template v-else-if="field.formType === 'date' || field.formType === 'datetime'">
                <el-date-picker
                  v-model="params.customizedSearchModel[field.fieldName]['value']"
                  type="daterange"
                  align="right"
                  unlink-panels
                  range-separator="-"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  :picker-options="createTimePickerOptions">
                </el-date-picker>
              </template>
              <!-- end date || datetime  -->

              <!-- start user -->
              <template v-else-if="field.formType === 'user'">
                <el-select
                  v-model="params.customizedSearchModel[field.fieldName]['value']"
                  @change="modifyUser('user', field.fieldName)"
                  filterable
                  clearable
                  remote
                  reserve-keyword
                  placeholder=""
                  :loading="inputRemoteSearch.creator.loading"
                  :remote-method="searchCreator">
                  <el-option
                    v-for="item in inputRemoteSearch.creator.options"
                    :key="item.userId"
                    :label="item.displayName"
                    :value="item.userId">
                  </el-option>
                </el-select>
              </template>
              <!-- end user -->

              <!-- start other -->
              <template v-else>
                <el-input v-model="params.customizedSearchModel[field.fieldName]['value']"
                          :placeholder="field.placeHolder"></el-input>
              </template>
              <!-- end other -->

            </el-form-item>
          </div>
          <div class="advanced-search-btn-group">
            <base-button type="ghost" @event="paramsReset">重置</base-button>
            <base-button type="primary" @event="search({ pageNum: 1, }, true)" native-type="submit">搜索</base-button>
          </div>
        </el-form>
      </base-panel>
      <!-- end 高级搜索 -->

    </div>
    <!-- end 搜索 -->

  </div>
  <!-- end 产品模板列表 -->
</template>

<script>
/* 高级搜索面板 列数 */
const PRODUCT_TEMPLATE_LIST_ADVANCE_SEARCH_COLUMN_NUMBER = 'product_template_list_advance_search_column_number';

export default {
  name: 'product-template-list-view',
  data() {
    return {
      columnNum: 1, // 高级搜索 列数
      loadingListData: false, // 加载列表数据
      searchAdvancedPanelShow: false, // 高级搜索面板显示
      searchCustomizeFields: [], // 搜索自定义字段
      paramsBackup: {
        keyword: '',
      },
      params: {
        keyword: '',
      }
    }
  },
  computed: {
    /* 高级搜索面板宽度 */
    panelWidth() {
      return `${420 * this.columnNum}px`
    }
  },
  mounted() {
    console.log('product--template-list mounted');
  },
  methods: {
    /* 搜索 */
    search(templateParams, fullSearch = false) {
      // 
    },
    /* 设置高级搜索面板 列 */
    setAdvanceSearchColumn(command){
      this.columnNum = Number(command);
      localStorage.setItem(PRODUCT_TEMPLATE_LIST_ADVANCE_SEARCH_COLUMN_NUMBER, command);
    },
    /* 参数重置 */
    paramsReset() {
      // 
    }
  },
}
</script>

<style lang="scss">

</style>