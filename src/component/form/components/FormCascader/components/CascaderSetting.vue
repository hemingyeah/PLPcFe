<template>
  <transition 
    name="slide-down"
    @after-leave="destroyElement">
    <div class="cascader-setting-modal-mask" v-show="show">
      <div class="cascader-setting-modal transition-container">
        <div class="cascader-setting-modal-header">
          <h3>
            <span>配置选择项</span>
            <small>点击每个选项里的<i class="iconfont icon-check-fill"></i>按钮设置默认选项</small>
            <div class="cascader-setting-deep">
              <label>级数： </label>
              <select :value="maxDeep" @change="changeMaxDeep" >
                <option value="2">两级</option>
                <option value="3">三级</option>
                <option value="4">四级</option>
                <option value="5">五级</option>
              </select>
            </div>  
          </h3>
          
          <button type="button" class="cascader-setting-modal-header-close" @click="close">
            <i class="iconfont icon-fe-close"></i>
          </button>
        </div>

        <div class="cascader-setting-modal-body">
          <div class="cascader-setting-panel" :style="{width: `${100 / maxDeep}%`}" v-for="(option, index) in selectedOption" :key="option.id">
            <h3>{{deepZhChar[index]}}级选项</h3>        
              <div class="cascader-setting-option-list" ref="list" @keyup.enter="addChildrenOption(option)">
                <draggable tag="div" :list="option.children">
                  <cascader-setting-option 
                    v-for="item in option.children" 
                    :key="item.id" 
                    v-model="item.value" 
                    :option="item" 
                    :allow-remove="option.children.length > 1" 
                    :active="item.active"
                    @choose="chooseOption"
                    @remove="removeOption" 
                    @change-default="changeDefaultOption"/>
                  </draggable>
              </div>          
            <div class="cascader-setting-option cascader-setting-operation">
              <a @click="addChildrenOption(option)" href="javascript:;" class="cascader-setting-btn">增加选项</a>
              <a @click="showMultiBatchModal(option,index)" href="javascript:;" class="cascader-setting-btn">批量编辑</a>
            </div>
          </div>  
        </div>

        <div class="cascader-setting-modal-footer">
          <div class="cascader-setting-default-text">
            <span class="btn-text" @click="openImportDialog()">批量导入</span>
            <span>默认选项:</span> 
            <span>{{defaultValueText}}</span>
          </div>
          <button type="button" class="cascader-setting-close" @click="close">关闭</button>
          <button type="button" class="cascader-setting-choose" @click="submit">确定</button>
        </div>
      </div>  
      <!-- start 批量编辑 -->
      <base-modal 
        title="批量编辑选项" width="520px" class="form-select-setting-modal"
        :show.sync="batchModalShow" :mask-closeable="false">
        <div class="form-select-setting-batch">
          <textarea :value="optionText" @input="updateOptionText" rows="10"></textarea>
          <div class="form-select-setting-warn" v-if="errMessage">{{errMessage}}</div>
        </div>
        <template slot="footer">
          <span class="form-select-tips">每行对应一个选项</span>
          <button type="button" class="btn btn-primary" @click="batchEdit">保存</button>
        </template>
      </base-modal>
      <!-- end 批量编辑 -->

      <!-- start 批量导入 -->
      <base-import
        title="批量导入"
        ref="bulkImport"
        @success="importSucc"
        action="/api/trane/outside/import/elevenCategoryNumberExcel"
      >
        <div slot="tip">
          <div class="base-import-warn">
            <p style="margin: 0">
              在导入前，请先下载
              <a href="/resource/excelTemplate/11Num.xlsx">导入模板</a>，批量导入只做新增，请在编辑导入模板时确保数据不要重复。。
            </p>
          </div>
        </div>
      </base-import>
      <!-- 批量导入 -->




    </div>  
  </transition>
</template>

<script>
import _ from 'lodash';
import draggable from 'vuedraggable';
import platform from '@src/platform';
import Option from './Option.js';
import CascaderSettingOption from './CascaderSettingOption.vue';
import SettingMixin from '@src/component/form/mixin/setting';
import FormSelectMixin from '@src/component/form/mixin/form.select';
// TODO: 根据最大级数选择选项，保证每一级至少有一个选项
// TODO: 切换级数时，超出级数的选项删除，不满足的补全

export default {
  name: 'cascader-setting',
  mixins: [SettingMixin, FormSelectMixin],
  props: {
    show: {
      type: Boolean,
      default: false
    },
    data: {
      type: Array,
      default: () => []
    },
    defaultValue: {
      type: Array,
      default: () => []
    }
  },
  data(){
    return {
      defaultValueText: '--',
      deepZhChar: ['一', '二', '三', '四','五'],
      source: null,
      selectedOption: [],
      maxDeep: 2,
      batchModalShow: false, 
      optionText: '', // 批量编辑文本
      errMessage: null,
      currentLevel: null //当前级别下标
    }
  },
  methods: {
    //批量导入
    openImportDialog(){
      this.$refs.bulkImport.open();
    },
    importSucc(){

    },
    //批量编辑
    batchEdit(){
      let newValues = this.optionText.split('\n').filter(option => option);
      console.log(newValues)
      const parent = this.selectedOption[this.currentLevel]
      if(!newValues.length) {
        platform.alert("至少要有一个选项");
        return false;
      }

      this.errMessage = this.validateOptions(newValues);
      if(this.errMessage) return;
      let newOptions = newValues.map(item =>new Option(item, false, parent))
      // let newOptions = newValues.map((item,index) =>{
       
      //   let options = new Option(item, false, parent)
      //   if(options.deep < this.maxDeep){
      //     console.log(555555)
      //   } 
      //   options.children = this.selectedOption[this.currentLevel].children[index];
      //   return options;

      // } );
      //更新数据
      this.selectedOption[this.currentLevel].children = newOptions;

      // this.$emit('input', {value: newOptions, prop: 'setting'})
      this.batchModalShow = false;

    },
    addOption(parent,value){
      let option = new Option(value, false, parent);
        if(option.deep < this.maxDeep) this.addOption(option)
        console.log(value,parent,option)
        parent.children.push(option);
    },
    /** 修改默认值 */
    changeDefaultOption(option){
      this.chooseOption(option);
      if(option.isDefault){
        // 如果已经是默认值，则重置所有子选项的默认值
        this.resetDefaultValue(option.children);
        option.isDefault = false;
        return;
      }

      // 清空默认值
      this.resetDefaultValue(this.source.children)
      // 将当前选项和祖先选项设为默认值
      option.isDefault = true;
      let parent = option.parent();

      while(parent != null){
        parent.isDefault = true;
        parent = parent.parent();
      }
    },
    /** 重置默认值 */
    resetDefaultValue(children){
      for(let i = 0; i < children.length; i++){
        let item = children[i];
        item.isDefault = false;

        this.resetDefaultValue(this.toArray(item.children))
      }
    },
    /** 修改最大级数 */
    changeMaxDeep(event){
      this.maxDeep = event.target.value;
      // 重置数据
      this.source = this.initSource(null, false, this.source.children, null)
      this.initselectedOption();
    },
    /** 清除所有选择项 */
    clearActiveOption(children){
      for(let i = 0; i < children.length; i++){
        let item = children[i];
        item.active = false;

        this.clearActiveOption(this.toArray(item.children))
      }
    },
    activeOption(option){
      if(option == null || option.parent() == null) return;

      let parent = option.parent();
      let children = this.toArray(parent.children);

      for(let i = 0; i < children.length; i++) {
        children[i].active = false;
      }
      
      option.active = true;
      this.activeOption(parent)
    },
    /** 选中某一选项 */
    chooseOption(option, withSelect = false){
      this.activeOption(option);

      // 选中当前选项
      if(withSelect) this.$nextTick(() => this.selectOption(option.id));
      
      if(option.deep >= this.maxDeep) return;

      let selectedOption = [];
      if(this.selectedOption.length + 1 >= option.deep){
        selectedOption = this.selectedOption.slice(0, option.deep - 1);
      }

      let currOption = option;
      for(let i = option.deep; i <= this.maxDeep; i++){
        selectedOption.push(currOption.parent());
        currOption = currOption.children[0];
      }
      
      this.selectedOption = selectedOption;
    },
    /** 删除选项 */
    removeOption(option){
      platform.confirm('确定要删除该选项？').then(value => {
        if(!value) return Promise.reject('cancel')
      })
        .then(() => {
          let deep = option.deep;
          let parent = option.parent();
          let source = parent == null ? this.source : parent.children;

          let index = source.indexOf(option);
          source.splice(index, 1);

          this.chooseOption(source[index - 1])
        })
        .catch(err => console.log(err))
    },
    /** 添加选项 */
    addChildrenOption(parent){
      // 根据当前最大级数，补全数据
      let value = `${this.deepZhChar[parent.deep]}级选项 ${parent.children.length + 1}`;
      let option = new Option(value, false, parent);
      if(option.deep < this.maxDeep) this.addChildrenOption(option)
      parent.children.push(option);
     
      this.chooseOption(option, true)
    },
    /** 根据id选中对应的选项 */
    selectOption(id){
      let optionEl = this.$el.querySelector(`[data-option-id="${id}"]`)
      if(optionEl == null) return;

      let inputEl = optionEl.querySelector('input[type="text"]');
      if(inputEl == null) return;

      inputEl.focus();
      inputEl.select();
    },
    submit(){
      // TODO: 计算选项总数
      this.$emit('update:show', false);
      this.$emit('close');
      this.$emit('input', this.exportSetting(this.source));
    },
    close(){
      this.$emit('update:show', false);
      this.$emit('close');
      this.$emit('cancel');
    },
    destroyElement(){
      this.$emit('destroy');
    },
    /** 导出配置 */
    exportSetting(origin){ 
      let children = Array.isArray(origin.children) ? origin.children : [];

      let defaultValue = this.exportDefaultValue(children);
      let dataSource = this.exportSource(children);

      return {dataSource, defaultValue, maxDeep: this.maxDeep};
    },
    /** 导出选项 */
    exportSource(children){
      let source = [];
      if(children.length == 0) return source;

      for(let i = 0; i < children.length; i++){
        let item = children[i];
        let option = {};

        option.value = item.value;
        if(Array.isArray(item.children) && item.children.length > 0){
          option.children = this.exportSource(item.children);
        } 
        source.push(option);
      }

      return source;
    },
    /** 导出默认值 */
    exportDefaultValue(children){
      let defaultValue = [];
      let i = 0;

      while(i < children.length){
        let option = children[i];
        i++;

        if(option.isDefault){
          defaultValue.push(option.value);
          
          children = this.toArray(option.children);
          i = 0;
        }
      }

      return defaultValue;
    },
    /** 初始化选中的项 */
    initselectedOption(){
      this.selectedOption = [];
      let option = this.source;
      
      for(let i = 1; i <= this.maxDeep; i++){
        this.selectedOption.push(option);
        option = option.children[0];
      }


    },
    initSource(value, isDefault, children, parent){
      let source = new Option(value, isDefault, parent);
      if(source.deep >= this.maxDeep) return source;

      // 如果级数小于最大级数，且没有子选项，就添加一个默认值
      if(source.deep < this.maxDeep && children.length == 0) {
        children.push({value: `${this.deepZhChar[source.deep]}级选项 1`})
      }
      
      // 处理子选项
      for(let i = 0; i < children.length; i++){
        let item = children[i] || {};
        let _value = item.value || `${this.deepZhChar[source.deep]}级选项 ${i + 1}`;
        let _isDefault = item.isDefault === true; 
        let _children = this.toArray(item.children);

        let option = this.initSource(_value, _isDefault, _children, source);
        source.children.push(option);
      }

      return source;
    },
    toArray(arr){
      return Array.isArray(arr) ? arr : [];
    },
    initDefaultValue(origin, defaultValue){
      let defValue = defaultValue.shift();

      for(let i = 0; i < origin.length; i++){
        let option = origin[i];
        if(option.value === defValue){
          option.isDefault = true;
          this.initDefaultValue(this.toArray(option.children), defaultValue)
          break;
        }
      }
    }
  },
  created(){
    let defaultValue = _.cloneDeep(this.defaultValue);
    let origin = _.cloneDeep(this.data);
    
    this.initDefaultValue(origin, defaultValue);
    this.source = this.initSource(null, false, origin, null);
  },
  mounted(){
    this.initselectedOption();

    if(this.selectedOption.length > 0){
      let lastOption = this.selectedOption[this.selectedOption.length - 1];
      let children = this.toArray(lastOption.children);

      if(children.length > 0) this.chooseOption(children[0])
    }
  },
  watch: {
    source: {
      deep: true,
      handler(value, oldValue){
        let defaultValue = this.exportDefaultValue(this.toArray(value.children));
        let text = '--';
        if(defaultValue.length > 0){
          text = defaultValue.map(item => item.length >= 10 ? `${item.substring(0, 10) }...` : item).join(' / ')
        }
        this.defaultValueText = text;
      }
    }
  },
  components: {
    draggable,
    [CascaderSettingOption.name]: CascaderSettingOption
  }
}
</script>

<style lang="scss">
.cascader-setting-modal-mask{
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,.35);
  z-index: 9999;
  overflow: auto;
}

.cascader-setting-modal{
  position: relative;
  width: 800px;
  margin: 50px auto;
  background-color: #fff;
  border-radius: 1px;
  box-shadow: 1px 2px 4px rgba(0,0,0,0.15);
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Microsoft YaHei", Arial, sans-serif;
}

.cascader-setting-modal-header{
  position: relative;
  padding: 8px 40px 8px 8px;
  border-bottom: 1px solid #e9ecef;

  align-items: center;

  h3{
    flex: 1;
    margin: 0;
    height: 24px;
    line-height: 24px;
    font-size: 16px;
    font-weight: 400;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    small{
      font-size: 12px;
      color: #9a9a9a;

      i.iconfont{
        font-size: 13px;
        margin: 0 2px;
        color: #159E7E;
        width: 16px;
        text-align: center;
      }
    }
  }

  .cascader-setting-deep{
    float: right;
    font-size: 14px;

    select{
      font-size: 14px;
      height: 24px;
      width: 60px;
      line-height: 22px;
    }
  }

  &-close{
    position: absolute;
    right: 0;
    top: 0;
    height: 40px;
    width: 40px;
    padding: 8px;
    margin: 0;
    
    background-color: transparent;
    border: none;
    outline: none;

    font-size: 14px;
    color: #999;
    font-weight: bold;

    cursor: pointer;

    &:hover{
      color: #e84040;
    }
  }
}

.cascader-setting-modal-body{
  padding: 8px 0;
  font-size: 14px;

  display: flex;
  flex-flow: row nowrap;
}

.cascader-setting-panel{
  padding: 0 15px;
  border-left: 1px solid #ddd;

  h3{
    margin: 0;
    padding: 5px 0 8px;
    font-size: 14px;
  }

  &:first-child{
    border-left-color: transparent;
  }
}

.cascader-setting-modal-footer{
  padding: 8px;
  border-top: 1px solid #e9ecef;
  display: flex;
  flex-flow: row nowrap;
}

.cascader-setting-choose,
.cascader-setting-close{
  outline: none;
  border:none;
  height: 28px;
  padding: 0 10px;
  background-color: transparent;
  cursor: pointer;
  font-size: 13px;
  border-radius: 2px;
}


.cascader-setting-close{
  color: #333;
  background-color: #fff;
  height: 32px;
  line-height: 32px;
  min-width: 65px;

  transition: background-color ease .15s;

  &:hover{
    background-color: #f0f0f0;
  }
}

.cascader-setting-choose{
  background-color: #55b7b4;
  color: #fff;
  line-height: 32px;
  height: 32px;
  min-width: 65px;
}

.cascader-setting-btn{
  line-height: 24px;
  font-size: 14px;
  text-decoration: none;
  color: #55b7b4;
  user-select: none;
  display: block;
}

.cascader-setting-default-text{
  flex: 1;
  padding: 0 8px;
  font-size: 14px;
  line-height: 32px;
  color: #666;
  .btn-text{
    color: #13C2C2;
    padding: 0;
    margin-right: 5px;
    cursor: pointer;
  }
}
</style>

