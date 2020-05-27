<template>
  <div id="doMyself-components-box">
    <div class="top-menu">
      <nav :class="nowPage==='customer'?'nav-checked':''" @click="nowPage='customer'">客户联系人</nav>
      <!--TO DO <nav :class="nowPage==='visitor'?'nav-checked':''" @click="nowPage='visitor'">访客</nav> -->
    </div>
    <customer-conctact-customer v-if="nowPage==='customer'"></customer-conctact-customer>
    <customer-conctact-visitor v-if="nowPage==='visitor'"></customer-conctact-visitor>
  </div>
</template>
<script>
import customer from "../components/customer";
import visitor from "../components/visitor";
export default {
  name: "customer-contact-home",
  data() {
    return {
      nowPage: "customer"
    };
  },
  components: {
    [customer.name]: customer,
    [visitor.name]: visitor
  }
};
</script>
<style lang="scss" scoped>
.top-menu {
  background: #fff;
  box-sizing: border-box;
  padding: 10px;
  display: flex;
  align-items: center;
  nav {
    width: 194px;
    height: 35px;
    text-align: center;
    line-height: 35px;
    font-size: 12px;
    border: 1px solid #d2d6de;
    overflow: hidden;
    cursor: pointer;
  }
  nav:nth-child(1) {
    border-right: none;
    border-top-left-radius: 2px;
    border-bottom-left-radius: 2px;
  }
  nav:last-child {
    border-top-right-radius: 2px;
    border-bottom-right-radius: 2px;
  }
  .nav-checked {
    background: #55b7b4;
    border-color: #55b7b4;
    color: #fff;
  }
}
</style>