<template>
  <base-modal  name="slide-down" :show.sync="show" :width="maxDeep>3?'1085px':'800px'" class="cascader-setting-modal">
    <div  slot="title" class="cascader-setting-modal-header">
      <div class="cascader-setting-msg">
        <span>配置选择项</span>
        <small>点击每个选项里的<i class="iconfont icon-check-fill"></i>按钮设置默认选项</small>
      </div>
        <div class="cascader-setting-deep">
          <label>级数： </label>
          <el-select v-model="maxDeep" placeholder="请选择" @change="changeMaxDeep">
            <el-option label="两级" :value="2"></el-option>
            <el-option label="三级" :value="3"></el-option>
            <el-option label="四级" :value="4"></el-option>
            <el-option label="五级" :value="5"></el-option>
          </el-select>
        </div>  
    </div>
    
    <!-- start 配置选项区域 -->
    <div class="cascader-setting-modal-body">
      <div class="cascader-setting-panel" :style="{width: `${100 / maxDeep}%`}" v-for="(option, index) in selectedOption" :key="index">
        <h3>{{deepZhChar[index]}}级选项</h3>        
          <div class="cascader-setting-option-list" ref="list" @keyup.enter="addChildrenOption(option)">
            <draggable tag="div" :list="option.children" v-bind="{ animation:380, handle:'.handle' }">
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
        <div class="cascader-setting-operation">
          <a @click="addChildrenOption(option,index)" href="javascript:;" class="cascader-setting-btn">增加选项</a>
          <a @click="showMultiBatchModal(option,index)" href="javascript:;" class="cascader-setting-btn">批量编辑</a>
        </div>
      </div>  
    </div>
    <!-- end 配置选项区域 -->

    <div class="cascader-setting-default-text">
      <span>默认选项:</span> 
      <span>{{defaultValueText}}</span>
    </div>

    <div class="cascader-setting-modal-footer dialog-footer" slot="footer">
      <div class="cascader-setting-import-btn">
        <span class="btn-text" @click="openImportDialog()">批量导入</span>
      </div>
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="submit">保 存</el-button>
    </div>

    <!-- start 批量编辑 -->
    <base-modal 
      title="批量编辑选项" width="520px" class="form-select-setting-modal"
      :show.sync="batchModalShow" :mask-closeable="false">
      <div class="form-select-setting-batch">
        <textarea :value="optionText" @input="updateOptionText" rows="10"></textarea>
        <div class="form-select-setting-warn" v-if="errMessage">{{errMessage}}</div>
      </div>
      <div slot="footer" class="dialog-footer">
        <span class="form-select-tips">每行对应一个选项</span>
        <el-button @click="batchModalShow = false">取 消</el-button>
        <el-button type="primary" @click="batchEdit">保 存</el-button>
      </div>
    </base-modal>
    <!-- end 批量编辑 -->

    <!-- start 批量导入 -->
    <base-import
      title="批量导入"
      ref="bulkImport"
      :is-import-now="isImportNow"
      @success="importSucc"
      @fail="importFail"
      :action="`/excels/multileve/menu/import?maxDeep=${maxDeep}`"
    >
      <div slot="tip">
        <div class="base-import-warn">
          <p style="margin: 0">
            在导入前，请先下载
            <a :href="`/excels/multileve/menu/import/template?maxDeep=${maxDeep}`">导入模板</a>，批量导入只能新增，请在编辑导入模板时确保数据不要重复。
          </p>
        </div>
      </div>
    </base-import>
    <!-- 批量导入 -->
  </base-modal>
</template>

<script>
import * as FormUtil from '@src/component/form/util';
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
      isImportNow: true, // 是否是导入立刻刷新
      defaultValueText: '--',
      deepZhChar: ['一', '二', '三', '四','五'],
      source: null,
      selectedOption: [],
      maxDeep: "2",
      batchModalShow: false, 
      optionText: '', // 批量编辑文本
      errMessage: null,
      currentLevel: null //当前级别下标
    }
  },
  methods: {
    //批量导入
    openImportDialog(){
      let repeat = this.checkTreeNodeRepeat(this.source);
      if(repeat.length){
        FormUtil.notification([{ message:repeat, title: '重复项'}], this.$createElement);
        return;
      }
      this.$refs.bulkImport.open();
    },
    importSucc(res){
      let { data } = res;
      // data.forEach(item=>{
      //   this.mergeTreeOption(this.source,item);
      // })
      let newOptions = this.mergeTreeOption(this.exportSetting(this.source).dataSource,data);

      this.source = this.initSource(null, false, newOptions, null);
      this.initselectedOption();

    },
    importFail(error) {
      this.$message.error(error);
    },
    //TODO:追加合并树节点
    mergeTreeOption(oldTree,newTree) {
      let objMap = {};
      let tree = [];
      if (!oldTree && !newTree) return []
      if(!oldTree) return newTree;
      if(!newTree) return oldTree;
      oldTree.forEach(item=>{
        objMap[item.value] =  item.children || []
      });
      newTree.forEach(item=>{
         if(objMap[item.value]){
            objMap[item.value] = this.mergeTreeOption(objMap[item.value],item.children)
         }else{
            objMap[item.value] = item.children || []
         }
      });
      for(let key in objMap){
        tree.push({
            value:key,
            children:objMap[key]
        })
      }
      return tree 
    },
    // mergeTreeOption(parent,item){
    //   // 递归合并树节点
    //   const { value ,children } = item;
    //   let name = value ?  value: `${this.deepZhChar[parent.deep]}级选项 ${parent.children.length + 1}`;
    //   let option = new Option(name, false, parent);
    //   if( Array.isArray(children) && children.length>0 ){
    //     children.forEach(element=>{
    //       this.mergeTreeOption(option,element);
    //     })
    //   } 
    //   parent.children.push(option);
    // },
    //批量编辑
    batchEdit(){
      let newValues = this.optionText.split('\n').filter(option => option);
      const parent = this.selectedOption[this.currentLevel];
      if(!newValues.length) {
        platform.alert("至少要有一个选项");
        return false;
      }
      this.errMessage = this.validateOptions(newValues);
      if(this.errMessage) return;
      let newOptions = newValues.map((item,index) =>{
        let optionSelect;
        let currentOption = parent.children[index]; //当前节点
        if(currentOption){ //如果原option列表有这个节点，只改名称
          currentOption.value = item;
          optionSelect = currentOption;
        } else {  //新增节点，递归插入数据
           optionSelect = this.addNewOption(parent,item);
        }
        return optionSelect
      });
      //更新数据
      this.selectedOption[this.currentLevel].children = newOptions;
      this.batchModalShow = false;

    },
    addNewOption(parent,name){ //递归创建新节点
       let value = name ? name:`${this.deepZhChar[parent.deep]}级选项 ${parent.children.length + 1}`;
       let optionSelect = new Option(value, false, parent);
        if(optionSelect.deep < this.maxDeep) this.addNewOption(optionSelect)
        parent.children.push(optionSelect);
        this.chooseOption(optionSelect, true); //将新生成节点记录选择项
        return optionSelect;
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
    changeMaxDeep(value){
      this.maxDeep = value;
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
      let newParent = {};
      for(let i = option.deep; i <= this.maxDeep; i++){
        if(currOption){
          selectedOption.push(currOption.parent());
          if(!currOption.children[0]) {
            newParent = currOption;
          }
          currOption = currOption.children[0];  
        }else{  
                      
          //创建新的空节点
          selectedOption.push(newParent);
        }
            
      }
      this.selectedOption = selectedOption;
    },
    /** 删除选项 */
    removeOption(option){
      let msg = option.children.length > 0 ?'确定要删除该选项以及对应子选项？':'确定要删除该选项吗？';
      platform.confirm(msg).then(value => {
        if(!value) return Promise.reject('cancel')
      })
        .then(() => {
          let deep = option.deep;
          let parent = option.parent();
          let source = parent == null ? this.source : parent.children;
          let selfIndex = source.indexOf(option);
          if(parent.deep == 0 && source.length == 1 ) return this.$message.warning('至少需要保留一个选项！');

          source.splice(selfIndex, 1);
          if(source.length){
            let activeIndex =  selfIndex == 0 ? selfIndex : selfIndex - 1;

            this.chooseOption(source[activeIndex]);      
          }else{      
            this.chooseOption(parent)
          }
        })
        .catch(err => console.log(err))
    },
    /** 添加选项 */
    addChildrenOption(parent,index){
      if(parent.children.length == 0 && index > parent.deep ) return this.$message.warning('请先补全上一级选项');

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

      let inputEl = optionEl.querySelector('.el-textarea__inner');
      if(inputEl == null) return;

      inputEl.focus();
      inputEl.select();
    },
    submit(){
      let repeat = this.checkTreeNodeRepeat(this.source);
      if(repeat.length){
        FormUtil.notification([{ message:repeat, title: '重复项'}], this.$createElement);
        return;
      }

      // TODO: 计算选项总数
      this.$emit('update:show', false);
      this.$emit('close');
      this.$emit('input', this.exportSetting(this.source));
    },
    //校验节点重复项
    checkTreeNodeRepeat(tree){
      let repeat = [];
      const loopTree = (tree,path='') =>{
        let map = new Map();
        for(let i=0;i<tree.length;i++){
            let node = tree[i];
            let key = path ? `${path}/${node.value}`:node.value;
            if(map.has(key)){
              repeat.push(map.get(key),key);
              map.delete(key);
            }else {
              map.set(key,key)
            }
            node.children&&node.children.length&&loopTree(node.children,key)
        }
      }
      loopTree(tree.children)
      return repeat;
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
      let newParent = {};
        
      for(let i = 1; i <= this.maxDeep; i++){
        if(option){
          this.selectedOption.push(option);
          if(!option.children[0]) {
            newParent = option;
          }
          option = option.children[0];
        }else{
          //创建新节点
          this.selectedOption.push(newParent);
        }
      }
    },
    initSource(value, isDefault, children, parent){
      let source = new Option(value, isDefault, parent);
      if(source.deep >= this.maxDeep) return source;

      // 如果级数小于最大级数，且没有子选项，就添加一个默认值
      // if(source.deep < this.maxDeep && children.length == 0) {
      //   children.push({value: `${this.deepZhChar[source.deep]}级选项 1`})
      // }
      
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
    initDataSource(data=[]){
      let defaultValue = _.cloneDeep(this.defaultValue);
      let origin = _.cloneDeep([...this.data,...data]);
      this.initDefaultValue(origin, defaultValue);
      this.source = this.initSource(null, false, origin, null);
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
    this.initDataSource();
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
.cascader-setting-modal-header{
  position: relative;
  align-items: center;
  flex: 1;
  .cascader-setting-msg{
    float: left;
    line-height: 33px;
    small{
      font-size: 12px;
      color: #9a9a9a;

      i.iconfont{
        font-size: 13px;
        margin: 0 2px;
        color: $color-primary;
        width: 16px;
        text-align: center;
      }
    }
  }
  .cascader-setting-deep{
    float: right;
    font-size: 14px;
    margin-right: 12px;
    .el-select{
      width: 80px;
      .el-input__inner{
        border-radius: 4px;
      }
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
  border-left: 1px solid #e5e5e5;

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
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  .cascader-setting-import-btn{
    flex: 1;
    .btn-text{
      width: 98px;
      height: 32px;
      line-height: 32px;
      color: $color-primary;
      padding: 0;
      display: inline-block;
      text-align: center;
      margin-right: 5px;
      cursor: pointer;
      background: #E9F9F9;
      border-radius: 4px;
      border: 1px solid #D0F3F4;
      background: #D0F3F4;
    }
  }

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
  color: $color-primary;
  user-select: none;
  display: block;
  margin-left: 8px;
}

.cascader-setting-default-text{
  flex: 1;
  padding: 0 20px;
  font-size: 14px;
  color: #666;
  margin: 32px 0;
}
.form-select-setting-modal {
  .dialog-footer{
    width: 100%;
  }
}
</style>

