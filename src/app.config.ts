export default defineAppConfig({
  pages: [
    'pages/plants/index',
    'pages/tasks/index',
    'pages/diagnose/index',
    'pages/album/index',
    'pages/knowledge/index',
    'pages/plant-add/index',
    'pages/plant-detail/index',
    'pages/diagnose-detail/index',
    'pages/knowledge-detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#2DB84D',
    navigationBarTitleText: '植物养护',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F6FFED'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#2DB84D',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/plants/index',
        text: '植物'
      },
      {
        pagePath: 'pages/tasks/index',
        text: '任务'
      },
      {
        pagePath: 'pages/diagnose/index',
        text: '诊断'
      },
      {
        pagePath: 'pages/album/index',
        text: '相册'
      },
      {
        pagePath: 'pages/knowledge/index',
        text: '知识'
      }
    ]
  }
})
