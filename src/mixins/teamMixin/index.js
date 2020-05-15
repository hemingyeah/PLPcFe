import * as TeamApi from '@src/api/TeamApi';

export default {
  name: 'team-mixin',
  data() {
    return {};
  },
  computed: {
    // 登录用户的团队列表
    teamsWithChildTag() {
      return this?.initData?.teamsWithChildTag || [];
    },
    // 用户id
    userId() {
      return this?.initData?.loginUser?.userId;
    }
  },
  methods: {
    // 获取团队列表哦
    getBizTeamList(params, filterTeams = [], isLoadAll = false) {
      let getTeamPromise = null;

      if(isLoadAll) {
        getTeamPromise = TeamApi.tagList(params).then(res => {
          return res
        }).catch(err => console.log(err))
      } else {
        getTeamPromise = new Promise((resolve, reject) => {
          let teams = filterTeams.slice();

          if(params.keyword) {
            teams = filterTeams.filter(list => {
              let listIndexOf = list.name.toLowerCase().indexOf(params.keyword.toLowerCase());
              let childHave = false;
              if(Array.isArray(list.children)) {
                childHave = list.children.some(child => {
                  return child.name.toLowerCase().indexOf(params.keyword.toLowerCase()) >= 0
                })
              }
              return listIndexOf >= 0 || childHave
            })
          }

          resolve({
            pageNum: 1,
            firstPage: 1,
            hasNextPage: false,
            hasPreviousPage: false,
            isFirstPage: true,
            isLastPage: true,
            lastPage: 1,
            pageSize: 0,
            list: teams,
          })
        })
      }
      return getTeamPromise
    },
    // 匹配团队
    matchTags(tags) {
      // 匹配子团队
      tags.forEach(item => {
        let isLeader = item.teamLeaders.some(leader => leader.userId == this.userId);
        if (!isLeader) {
          item.children = tags.filter(t => t.parent && t.parent.id == item.id);
        }
      });
      // 过滤子团队
      for (let j = 0; j < tags.length; j++) {
        let t = tags[j];
        if (t.parent && t.parent.id) {
          let parentId = t.parent.id;
          let some = tags.some(s => s.id == parentId);
          if (some) {
            tags.splice(j, 1);
            j--;
          }
        }
      }
      return tags.map(d => {
        d.children.forEach(c => {
          c.name = c.tagName;
        });
        d.name = d.tagName;
        return d;
      });
    },
  }
}