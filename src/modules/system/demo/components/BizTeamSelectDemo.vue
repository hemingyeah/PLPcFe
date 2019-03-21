<template>
  <div>
    <div style="height: 100px"></div>
    <div class="form-item" style="width: 60%;">
      <label for="team">服务团队</label>
      <div class="form-item-control">
        <input type="text" id="team" class="custom-class" placeholder="请选择服务团队"/>
      </div>
    </div>
    
    <div style="height: 1000px"></div>
  </div>
</template>

<script>

import * as TeamApi from '@src/api/TeamApi'


export default {
  name: 'biz-team-select-demo',
  data(){
    return {
      team: '',
      initVal: [
        {
          createTime: 1496241171000,
          description: null,
          id: '065976e8-460e-11e7-a318-00163e304a25',
          parent: null,
          phone: null,
          tagAddress: null,
          tagColor: null,
          tagName: '测试团队',
          tagPlaceList: [],
          tenantId: '7416b42a-25cc-11e7-a500-00163e12f748'
        }
      ]
    }
  },
  methods: {
    init(){
      let instance = this.$fast.biz.initTeamSelect({
        reference: '#team',
        multiple: true,
        value: this.initVal,
        fetchFunc: params => TeamApi.tagList(params),
      });

      instance.$on('input', value => {
        console.info(value);
        this.team = value
      })
    }
  },
  mounted(){
    this.init();
  }
}
</script>


<style lang="scss">
#choose-team{
  width: 100%;
  cursor: pointer;
}
.custom-class{
  width: 100%;
}
</style>