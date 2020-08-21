<template>
  <div class="stats-chart-empty"> 
    <img src="../../../assets/img/chart-empty.png"/>
    <h3><slot></slot></h3>
  </div>
</template>

<script>
export default {
  name: "stats-chart-empty"
}
</script>

<style lang="scss">
.stats-chart-empty{
  position: absolute;
  width: 200px;
  text-align: center;
  top: 120px;
  left: 50%;
  margin-left: -100px; 

  img{
    display: block;
    margin: 0 auto;
    width: 160px;
  }

  h3{
    font-size: 18px;
    margin: 20px 0 10px 0;
    font-weight: 500;
    color: #9a9a9a;
  }
}
</style>

