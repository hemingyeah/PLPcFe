<template>
  <div class="contact-user-item" :class="{'contact-selected': user.selected}" @click="$emit('toggle', user)">
    <div class="contact-user-wrap">
      <div class="contact-user-avatar" :style="{backgroundImage: `url(${head})`}"></div>
      <div class="contact-user-info">
        <h3>{{user.displayName}}</h3>
        <p>{{user.cellPhone}}</p>
      </div>
    </div>
  </div>
</template>

<script>
import DefaultHead from '@src/assets/img/avatar.png';

export default {
  name: 'contact-user-item',
  props: {
    user: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    head(){
      return this.user.head || DefaultHead;
    }
  }
}
</script>

<style lang="scss">
.contact-user-item{
  padding: 0 10px;
  cursor: pointer;
  transition: background-color ease .15s;

  &.contact-selected,
  &:hover{
    background-color: $color-primary-hover;
  }

  &:last-child .contact-user-wrap{
    border-bottom-color: transparent;
  }
}

.contact-user-wrap{
  display: flex;
  flex-flow: row nowrap;
  padding: 5px 0;
  border-bottom: 1px dashed #e9ecef;
}

.contact-user-avatar{
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;

  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
}

.contact-user-info{
  flex: 1;
  padding-left: 10px;
  overflow: hidden;
  
  h3{
    margin: 0;
    line-height: 24px;
    font-size: 14px;
    font-weight: 400;
    @include text-ellipsis();
  }

  p{
    line-height: 20px;
    font-size: 12px;
    margin: 0;
    color: $text-color-second;
  }
}
</style>

