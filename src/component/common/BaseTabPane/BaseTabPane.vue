<template>
  <div class="base-tab-pane-container">
    <ul class="tabs" ref="tabList">
      <li v-for="t in tabs" :key="t.componentName" :class="{'selected': t.componentName === tab.componentName }">
        <input type="radio" :value="t" v-model="tab" name="tab" :id="t.componentName" title=""/>
        <label :for="t.componentName" @click="selectTab(t, $event)" class="tab-card-for-pane">
          <template v-if="t.slotName">
            <slot :name="t.slotName"></slot>
          </template>
          <template v-else>{{t.displayName}}</template>
        </label>
      </li>
      <li class="border border-fade" :style="borderStyle"></li>
    </ul>
    <keep-alive>
      <component :is="tab.component" v-bind="tab.props"></component>
    </keep-alive>
  </div>
</template>

<script>
  export default {
    name: "base-tab-pane",
    props: {
      tabs: {
        type: Array,
        default: () => ([])
      }
    },
    data() {
      return {
        tab: {},
        domData: {},
        borderStyle: {
          left: 0,
          width: '0px',
        },
      }
    },
    mounted() {
      this.tab = this.tabs[0];
      console.log('base-tab-pane mounted');

      // 通过触发点击事件，主要为了设置宽度
      let tabs = document.querySelectorAll('.tab-card-for-pane');
      let firstTab = tabs[0];
      if (firstTab) {
        firstTab.click();
      }
    },
    methods: {
      // 设置底边的宽度和左偏移
      selectTab(tab, event) {
        let currentTabDomData = this.domData[tab.componentName];

        if (currentTabDomData) {
          this.borderStyle = {...currentTabDomData};
          return;
        }

        const {target,} = event;

        this.domData[tab.componentName] = {
          left: `${target.offsetLeft}px`,
          width: `${target.offsetWidth}px`,
        };
        this.borderStyle = {...this.domData[tab.componentName]};
      }
    },
  }
</script>

<style lang="scss">

  .base-tab-pane-container {

    .tabs {
      display: flex;
      padding: 0;
      position: relative;
      li {
        list-style: none;
        line-height: 58px;
        font-size: 16px;
        color: #333333;
        flex-grow: 1;
        flex-shrink: 0;
        text-align: center;

        input {
          display: none;
        }

        label {
          display: block;
          margin: 0;
          &:hover {
            cursor: pointer;
          }
        }

      }
      li.selected {
        color: #00AC97;
      }

      li.border {
        width: 100px;
        height: 2px;
        background: #00AC97;
        position: absolute;
        left: 0;
        bottom: 0;
      }

      .border-fade {
        transition: all .2s ease;
      }
    }
  }

</style>


