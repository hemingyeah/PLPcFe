<template>
  <div class="nav-wrapper">
      <div class="nav">
        <h1>{{data.title}}</h1>
        <ul v-if="data.list && data.list.length">
          <li v-for="(item,index) in data.list" :key="index"><a :class="{active: current == item.title}">{{item.title}}</a></li>
        </ul>
      </div>
    </div>
</template>
<script>
export default {
  props: {
    data: {
      type: Object,
      default: () => {
        return {}
      }
    },
    current: {
      type: String,
      default: ''
    }
  }
}
</script>
<style lang="scss" scoped>
  .nav-wrapper {
    box-sizing: border-box;
    width: 25%;
    float: left;
    .nav {
      background-color: #FFF;
      border-radius: 4px;
      color: #444;
      h1 {
        margin: 0;
        padding: 10px;
        font-size: 18px;
        font-weight: 500;
        border-bottom: 1px solid #f4f4f4;
      }
      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        li {
          a {
            display: block;
            padding: 10px 15px;
            text-decoration: none;
            border-left: 3px solid transparent;
            color: #444;
            &.active {
              border-left-color: #3c8dbc;
              font-weight: 600;
            }
            &.hover {
              background-color: #76838f !important;
            }
          }
        }
      }
    }
  }
</style>


