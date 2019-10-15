<template>
  <div class="share-permission-invalid">
    <div>
      <img class="permission-invalid-img" src="../../../../../assets/img/empty.png">
    </div>
    <span class="permission-invalid-msg">非常抱歉，该文章对外查看权限已关闭，您无法查看</span>
  </div>
</template>

<style lang="scss">
.share-permission-invalid {
  background: #fff;
  text-align: center;
  padding-top: 150px;
  height: 100vh;

  .permission-invalid-img {
    width: 100px;
    height: 100px;
  }

  .permission-invalid-msg {
    display: block;
    padding-top: 10px;
    font-size: 14px;
  }
}
</style>