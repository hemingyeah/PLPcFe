export function genRows(){
  let base = [
    {
      id: Math.random() * 10000000 >> 0,
      name: '山东团队',
      manager: '张三',
      phone: '13895546633',
      area: '山东省青岛市李沧区',
      location: '山东省青岛市市北区万科中心C座山东省青岛市市北区万科中心C座山东省青岛市市北区万科中心C座',
      children: [
        {
          id: Math.random() * 10000000 >> 0,
          name: '济南团队',
          manager: '张三',
          phone: '13895546633',
          area: '山东省青岛市李沧区',
          location: '山东省青岛市市北区万科中心C座山东省青岛市市北区万科中心C座山东省青岛市市北区万科中心C座'
        },
        {
          id: Math.random() * 10000000 >> 0,
          name: '青岛团队',
          manager: '李四',
          phone: '13895546633',
          area: '山东省青岛市李沧区',
          location: '山东省青岛市市北区万科中心C座山东省青岛市市北区万科中心C座山东省青岛市市北区万科中心C座'
        },
        {
          id: Math.random() * 10000000 >> 0,
          name: '临沂团队',
          manager: '王五',
          phone: '13895546633',
          area: '山东省青岛市李沧区',
          location: '山东省青岛市市北区万科中心C座山东省青岛市市北区万科中心C座山东省青岛市市北区万科中心C座'
        }
      ],
    },
    {
      id: Math.random() * 10000000 >> 0,
      name: '山西团队',
      manager: '张三',
      phone: '13895546633',
      area: '山东省青岛市李沧区',
      location: '山东省青岛市市北区万科中心C座山东省青岛市市北区万科中心C座山东省青岛市市北区万科中心C座',
      children: [],
    },
    {
      id: Math.random() * 10000000 >> 0,
      name: '北京团队',
      manager: '张三',
      phone: '13895546633',
      area: '北京市',
      location: '山东省青岛市李沧区',
      children: [
        {
          id: Math.random() * 10000000 >> 0,
          name: '海淀团队',
          manager: '张三',
          phone: '13895546633',
          area: '山东省青岛市李沧区'
        },
        {
          id: Math.random() * 10000000 >> 0,
          name: '朝阳团队',
          manager: '张三',
          phone: '13895546633',
          area: '山东省青岛市李沧区'
        },
        {
          id: Math.random() * 10000000 >> 0,
          name: '中关村团队',
          manager: '张三',
          phone: '13895546633',
          area: '山东省青岛市李沧区'
        }
      ]
    }
  ]

  for(let i = 0; i < 50; i++){
    base.push({
      id: Math.random() * 10000000 >> 0,
      name: `测试团队 -- ${i}`,
      manager: `测试人员 -- ${i}`,
      phone: '13895546633',
      area: '山东省青岛市李沧区',
      location: '山东省青岛市李沧区'
    })
  }

  return base
}

export function genColumns(){
  let base = [
    {
      field: 'name',
      label: '团队名称',
      width: 250,
      expandProp: 'children',
      show: 'important',
      fixed: 'left',
      render(h, col, row){
        return (
          <a href="javscript:;">{row.name}</a>
        )
      },
    },
    {
      field: 'manager',
      label: '团队主管',
      width: 150,
      render(h, col, row) {
        return (
          <span> {row.manager} </span>
        )
      },
    },
    {
      field: 'phone',
      label: '电话',
      width: 200,
    },
    {
      field: 'area',
      label: '负责区域',
      width: 180,
      headRender(h, col){
        return [
          col.label,
          <i class="iconfont icon-address" style="font-size:14px;"></i>
        ]
      }
    }
  ]

  for(let i = 0; i < 1; i++){
    base.push({
      field: 'location',
      label: '所在位置',
      overflow: 'tooltip'
    })
  }

  return base;
}