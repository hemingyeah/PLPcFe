const treeData = {
  id: 0,
  deep: 0,
  tasks: [{
    name: 1, // 目录名称
    id: 1, // 目录id
    routeName: '1/', // 路由名称
    showList: 1, // 是否是展开状态
    conData: 0, // 是否有内容
    routerIndex: '0|1', // 后端拼接
    deep: 1,
    tasks: [
      // 子目录
      {
        name: 1.1,
        id: 1.1,
        routeName: '1/1.1', // 路由名称
        showList: 1,
        deep: 2,
        tasks: [{
          name: 1.11,
          routeName: '1/1.1/1.11', // 路由名称
          id: 1.11,
          deep: 3,
          parentId: 1.1,
          showList: 1,
          tasks: [{
            name: 1.111,
            routeName: '1/1.1/1.11/1.111', // 路由名称
            id: 1.111,
            deep: 4,
            parentId: 1.11,
            showList: 1,
            tasks: [{
              name: 1.1111,
              routeName: '1/1.1/1.11/1.111', // 路由名称
              id: 1.1111,
              deep: 5,
              parentId: 1.111,
              showList: 1,
              tasks: [{
                name: 1.11111,
                routeName: '1/1.1/1.11/1.111/1.1111', // 路由名称
                id: 1.11111,
                deep: 6,
                parentId: 1.1111,
                showList: 1,
                tasks: [],
                conData: 0,
              },
              {
                name: 1.11112,
                routeName: '1/1.1/1.11/1.111/1.1112', // 路由名称
                id: 1.11112,
                deep: 6,
                parentId: 1.1111,
                showList: 1,
                tasks: [],
                conData: 0,
              },
              ],
              conData: 0,
            }, ],
            conData: 0,
          }, ],
          conData: 0,
        }, ],
        conData: 0,
      },
      {
        name: 1.2,
        routeName: '1/1.2', // 路由名称
        id: 1.2,
        deep: 2,
        tasks: [],
        showList: 1,
        conData: 1,
      },
    ],
  }, ],
}