<template>
  <ul class="task-nav-bar">
    <li>
      <a href="/setting/task/taskSet" :class="current === 'taskSet' && 'active'">
        <i class="icon-gongdanbiaodanshezhi iconfont" ></i>
        工单设置
      </a>
    </li>
    <li>
      <a href="/setting/taskType/manage" :class="current === 'taskType' && 'active'">
        <i class="icon-gongdanliuchengshezhi iconfont"></i>
        工单类型设置
      </a>
    </li>
    <li>
      <a href="/setting/task/cardManage" :class="current === 'cardManage' && 'active'">
        <i class="icon-add3 iconfont"></i>
        附加组件设置
      </a>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'task-nav-bar',
  props: {
    current: String
  }
}
</script>

<style lang="scss" scoped>
ul,.task-nav-bar{
  width: 194px;
  min-width: 194px;
  height: 100%;
  padding: 26px 38px;
  margin-bottom: 0;
  background: #FFFFFF;
  border-radius: 4px;
  list-style: none;
  li > a{
    display: inline-block;
    text-decoration: none;
    margin-bottom: 26px;
    font-size: 16px;
    color: #666666;
    &.active{
      font-weight: bold;
      color: $color-primary;
    }
  }
  .iconfont{
    font-size: 14px;

  }
}
</style>