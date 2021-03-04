export default {
  NEED_UPDATE_LEFT_TOP_EVENT: 'screen_data.need_update_left_top',
  NEED_UPDATE_RIGHT_TOP_EVENT: 'screen_data.need_update_right_top',
  NEED_UPDATE_RIGHT_HISTOGRAM: 'screen_data.need_update_right_histogram',
  NEED_UPDATE_RIGHT_PIECHART: 'screen_data.need_udpate_right_piechart',


  /**
   * 右侧报表(histogram)
   * 周期内
   * AT 工单数量与平均工单用时
   * GS 完成的工单与当前团队人数
   * EC 服务内容排名
   * ET 服务类型排名
   * 
   * todo 统一名字 ‘_RIGHT_’
   */
  NEED_REFRESH_RIGHT_SEARCH_AT: 'screen_data.need_refresh_right_search_at',
  NEED_REFRESH_RIGHT_SEARCH_GS: 'screen_data.need_refresh_right_search_gs',
  NEED_REFRESH_RIGHT_SEARCH_EC: 'screen_data.need_refresh_right_search_ec',
  NEED_REFRESH_RIGHT_SEARCH_ET: 'screen_data.need_refresh_right_search_et',

  /**
   * 右侧饼状图(pie, pieChart)
   * 周期内
   * TT 工单类型
   * TPT 工单按照产品类型
   * RTS 已评价工单的满意度
   */
  NEED_REFRESH_RIGHT_PIE_TT: 'screen_data.need_refresh_right_pit_tt',
  NEED_REFRESH_RIGHT_PIE_TPT: 'screen_data.need_refresh_right_pit_tpt',
  NEED_REFRESH_RIGHT_PIE_RTS: 'screen_data.need_refresh_right_pie_rts',

  /**
   * 左侧地图相关事件
   */
  NEED_REFRESH_MAP_TASK_PIE: 'screen_data.need_refresh_map_task_pie',
  NEED_REFRESH_MAP_PERSON_PIE: 'screen_data.need_refresh_map_person_pie',
  NEED_REFRESH_MAP: 'screen_data.need_refresh_map',
  MAP_CONFIG_CHANGE: 'screen_data.map_config.change',
  UPDATE_MAP_CONFIG: 'screen_data.update_map_config'

}