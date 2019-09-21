<template>
  <div
    ref="reference"
    :class="['base-cascader']">
    <div 
      class="base-cascader-input"
      ref="input" 
      @click="toggleDropDownVisible()"
      @mouseenter="inputHover = true"
      @mouseleave="inputHover = false">
      <el-input
        v-model="isMultiple ? presentText : inputValue"
        :size="realSize"
        :readonly="readonly"
        :disabled="isDisabled"
        :validate-event="false"
        :placeholder="placeholder"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput">
        <template slot="suffix">
          <i
            v-if="clearBtnVisible"
            key="clear"
            class="el-input__icon el-icon-circle-close"
            @click.stop="handleClear"></i>
          <i
            v-else
            key="arrow-down"
            :class="[
              'el-input__icon',
              'el-icon-arrow-down',
              dropDownVisible && 'is-reverse'
            ]"
            @click.stop="toggleDropDownVisible()"></i>
        </template>
      </el-input>
    </div>

    <transition name="el-zoom-in-top" @after-leave="handleDropdownLeave">
      <div
        v-show="dropDownVisible"
        ref="popper"
        :class="['base-popper', popperClass]">
        <div class="popper__arrow"></div>
        <div class="base-cascader__dropdown" v-if="optionList.length > 0 && optionList[0].length > 0">
          <ul
            class="base-cascader-panel"
            v-for="(options, index) in optionList"
            :key="index"
            v-show="!filtering">
            <li
              class="base-cascader-menu"
              :class="{'is-active': typeValue.indexOf(item.value) != -1}"
              v-for="(item, index) in options"
              :key="index"
              @click="handleMenu(item)">
              <slot :data = 'item'></slot>
              <i
                key="clear"
                v-if="item.children"
                class="el-icon-arrow-right"
                @click="openChild(item)"></i>
            </li>
          </ul>

          <ul
            class="base-cascader-panel"
            v-show="filtering">
            <li
              class="base-cascader-menu"
              v-for="(item, index) in optionList"
              :key="index"
              @click="chooseFilterItem(item)">
              {{item}}
            </li>
          </ul>
        </div>
        <div class="base-cascader-empty" v-else>
          暂无数据
        </div>
        <div class="base-cascader-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import BaseCascaderPanel from './BaseCascaderPanel';
import _ from 'lodash';

/**
 * value: v-model绑定的值，所选的type value组成的数组
 * disable: 是否禁用
 * popperClass: 下拉框类名
 * options: type的数据结构（label value(必选), children(可选)）
 * filterable: 是否支持搜索
 * clearable: 是否可清空
 * placeholder: 提示语
 * checkStrictly: 是否支持每一级可选 
 * multiple: 是否支持多选
 * size: el-input的size参数
 */
// TODO: 多选
export default {
  name: 'BaseCascader',
  props: {
    value: {
      type: Array,
      default: () => ([])
    },

    disabled: {
      type: Boolean,
      default: false
    },

    popperClass: {
      type: String,
      default: ''
    },

    options: {
      type: Array,
      default: () => ([])
    },

    filterable: Boolean,
    clearable: Boolean,
    placeholder: {
      type: String,
      default: '请选择'
    },
    checkStrictly: Boolean,
    multiple: Boolean,
    size: String,
  },

  model: {
    prop: 'value', //绑定的值，通过父组件传递
    event: 'update' //自定义时间名
  },

  components: {
    [BaseCascaderPanel.name]: BaseCascaderPanel
  },

  data () {
    return {
      dropDownVisible: false, // 下拉框是否显示
      presentText: null, // 多选时input框的绑定值
      inputValue: null, // 单选或搜索时input框的绑定值
      inputValueArr: [], // 选中的级联分类组成的数组
      filtering: false, // 是否正在搜索
      optionList: null, // 循环时遍历的数组，存储每一级的数据
      typeValue: this.value, // 选中的type的value组成的数组
      inputHover: false, // 鼠标是否在input框内
    }
  },
  
  mounted () {
    document.addEventListener('click', this.handleClickOutside, false);
  },

  computed: {
    // input框的size，可选值：medium / small / mini
    realSize() {
      return this.size;
    },

    // TODO: 是否多选 
    isMultiple () {
      return false;
      // return this.multiple;
    },

    // input是否只读，目前在搜索时该值为false
    readonly() {
      return !this.filterable || this.isMultiple;
    },

    // 是否禁用
    isDisabled() {
      return this.disabled;
    },

    // 是否显示清除按钮，在可清楚且已选择type之后鼠标在input框内时显示
    clearBtnVisible() {
      if (!this.clearable || this.isDisabled || this.filtering || !this.inputValue || !this.inputHover) {
        return false;
      }
      return true;
    }
  },

  methods: {
    /** 监听文档的点击事件，如果点击组件外的元素，关闭组件 */
    handleClickOutside(e){
      this.$nextTick(() => {
        if(!this.$refs.input.contains(e.target) && !this.$refs.popper.contains(e.target)) {
          if(this.dropDownVisible) this.toggleDropDownVisible(false);
        }
      })
    },

    // 初始化input的绑定值
    initInputValue () {
      if(this.typeValue.length <= 0) return;
      if(this.checkStrictly) {
        if(this.typeValue.length == 1) {
          this.options.forEach(option => {
            if(option.value == this.typeValue[0]) {
              this.inputValue = option.label;
            }
          })
        }
      }
      
      if(this.typeValue.length > 1) {
        this.options.forEach(option => {
          if(option.value == this.typeValue[0]) {
            this.inputValue = option.label;
          }

          option.children.forEach(child => {
            if(child.value == this.typeValue[1]) {
              this.inputValue = `${ this.inputValue }/${ child.label }`;
            }
          })
        })
      }
    },

    // input获得焦点
    handleFocus (e) {
      this.$emit('focus', e);
    },

    // input失去焦点
    handleBlur(e) {
      this.$emit('blur', e);
    },

    // 搜索时val不为空时进行搜索操作
    handleInput(val, event) {
      this.dropDownVisible = true;
      if (val) {
        this.filterHandler();
      } else {
        this.filtering = false;
        this.optionList = [this.options];
      }
    },

    // 初始化搜索时的分类数据结构，即对父级和子级的分类做了一个拼接
    fileterTye () {
      let arr = [];
      this.options.forEach(parent => {
        if(this.checkStrictly) {
          arr.push({
            label: parent.label,
            value: [parent.value]})
        }
        parent.children.forEach(child => {
          arr.push({
            label: `${ parent.label }/${ child.label }`,
            value: [parent.value, child.value]})
        })
      })
      return arr;
    },

    // 搜索符合条件的类别，即包含关键词
    filterHandler: _.debounce(function () {
      let arr = this.fileterTye();
      let typeArr = [];
      arr.forEach(item => {
        typeArr.push(item.label);
      })
      if(!this.inputValue) return;
      let filter = typeArr.filter(item => {
        return item.indexOf(this.inputValue) != -1
      })
      this.filtering = true;
      this.optionList = filter;
    }, 300),

    // 清除操作
    handleClear() {
      this.inputValue = '';
      this.typeValue = [];
      this.$emit('update', this.typeValue);
    },
    
    // 下拉框的展开和关闭
    toggleDropDownVisible(visible) {
      if (this.isDisabled) return;
      this.dropDownVisible = visible || !this.dropDownVisible;
      if(this.dropDownVisible) {
        this.$refs.input.focus();
        this.initOptionList();
      }
      this.$emit('visible-change', visible);
    },

    // 动画结束时
    handleDropdownLeave() {
      this.filtering = false;
    },

    // 初始化展开板数据
    initOptionList () {
      if(!this.inputValue) {
        this.optionList = [this.options]; 
        return;
      }
      if(this.typeValue.length == 1) {
        this.optionList = [this.options];
        return;
      }
      this.optionList = [this.options];
      let arr = this.inputValue.split('/');
      this.options.forEach(item => {
        if(item.label == arr[0]) {
          this.optionList.push(item.children)
        }
      })
    },

    // 展开第二级
    openChild (info) {
      if(!info.children) return;
      if(this.optionList.length > 1) {
        this.optionList.splice(1);
      }
      this.$nextTick(() => {
        this.optionList.push(info.children);
      })
      
    },

    // 点击分类时
    handleMenu (item) {
      this.chooseItem(item);
      this.openChild(item);
    },

    // 平时选中
    chooseItem (item) {
      let { inputValueArr } = this;
      if(item.children) {
        this.typeValue.splice(0);
        inputValueArr.splice(0);
      } else {
        this.typeValue.splice(1);
        inputValueArr.splice(1);
      }
      this.typeValue.push(item.value);
      inputValueArr.push(item.label);
      if(!this.checkStrictly) {
        if(inputValueArr.length > 1) {
          this.inputValue = inputValueArr.join('/');
          this.toggleDropDownVisible(false);
        }
      } else {
        this.inputValue = inputValueArr.join('/');
      }
      this.$emit('update', this.typeValue);
      this.$emit('change', this.typeValue);
    },

    // 搜索时选中
    chooseFilterItem (item) {
      this.typeValue = [];
      this.inputValue = item;
      this.dropDownVisible = false;
      let arr = this.fileterTye();
      this.typeValue = arr.filter(type => {
        return item == type.label;
      })[0].value;
      this.$emit('update', this.typeValue);
      this.$emit('change', this.typeValue);
    }
  },

  watch: {
    options: {
      handler() {
        this.initOptionList();
      },
      deep: true,
      immediate: true,
    },

    typeValue: {
      handler(n) {
        this.initInputValue();
        if(n.length <= 0) this.initOptionList();
      },
      deep: true,
      immediate: true,
    }
  }
}
</script>

<style lang="scss">
.base-cascader {
  margin-bottom: 20px;
  position: relative;

  .base-cascader-input {
    width: 194px;
    cursor: pointer;

    .is-reverse {
      transform: rotateZ(180deg);
    }

    .el-input__inner {
      cursor: pointer;
    }
  }

  .base-popper {
    position: absolute;
    left: 8px;
    z-index: 9999;

    margin-top: 15px;

    color: #606266;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.2);

    .popper__arrow {
      position: absolute;
      top: -10px;
      left: 30px;
      border: 5px solid;
      border-color: transparent transparent #fff;
    }

    .base-cascader__dropdown {
      display: flex;
      min-height: 200px;
      max-height: 300px;
      overflow: hidden;
    }

    .base-cascader-panel {
      margin: 0;
      padding: 6px 0;
      border-right: 1px solid #E4E7ED;
      overflow: auto;
      min-width: 170px;

      .base-cascader-menu {
        position: relative;
        list-style: none;
        padding: 0 40px 0 20px;
        height: 34px;
        line-height: 34px;

        font-size: 14px;
        cursor: pointer;

        &:hover {
          background: #F5F7FA;
        }

        .el-icon-arrow-right {
          position: absolute;
          top: 2px;
          right: 8px;
          padding: 10px;
          cursor: pointer;
        }
      }

      .is-active {
        color: #55b7b4;
      }
    }

    .base-cascader-empty {
      width: 170px;
      height: 40px;
      line-height: 40px;
      text-align: center;
      color: #ccc;
    }

    .base-cascader-footer {
      height: 40px;
      border-top: 10px solid #f0f0f0;
      color: #55b7b4;
      cursor: pointer;
      line-height: 40px;
      text-align: center;
      font-size: 14px;
    }
  }
}
</style>