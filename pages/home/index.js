// pages/home.js
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
    roles:[
      {
        title: '模拟面试官',
        description: '程序员描述，包括前端、后端、大数据、人工智能等',
        image: 'https://s1.aigei.com/src/img/png/2c/2c1f2e9cc4db43b2a16a8b3588e364b9.png?imageMogr2/auto-orient/thumbnail/!282x282r/gravity/Center/crop/282x282/quality/85/%7CimageView2/2/w/282&e=1735488000&token=P7S2Xpzfz11vAkASLTkfHN7Fw-oOZBecqeJaxypL:FoD2DJ-bGpLTPEl_pVcMmFURz08='
      },
      {
        title: '知乎问答助手',
        description: '作为知乎顾问，写出知乎高赞回答',
        image: 'https://s1.aigei.com/src/img/png/5a/5a7a40a62b6f4383a2d3426a069b2893.png?e=1735488000&token=P7S2Xpzfz11vAkASLTkfHN7Fw-oOZBecqeJaxypL:GDysrSkBHKD7-QngE8rtGuipMKE='
      },
      {
        title: '小红书爆款标题',
        description: '作为小红书达人，写出爆款标题',
        image: 'https://s1.aigei.com/src/img/png/3e/3e3bda0ac48046b08e560e8764942bd8.png?imageMogr2/auto-orient/thumbnail/!282x282r/gravity/Center/crop/282x282/quality/85/%7CimageView2/2/w/282&e=1735488000&token=P7S2Xpzfz11vAkASLTkfHN7Fw-oOZBecqeJaxypL:JPuRl9bkD4UfIc8fGN4ApLuS_rE='
      },
      {
        title: '电影推荐',
        description: '作为电影爱好者，根据你的喜好推荐电影',
        image: 'https://s1.aigei.com/src/img/png/a3/a30a63a935d04ed6ae112c7301a0924d.png?imageMogr2/auto-orient/thumbnail/!282x282r/gravity/Center/crop/282x282/quality/85/%7CimageView2/2/w/282&e=1735488000&token=P7S2Xpzfz11vAkASLTkfHN7Fw-oOZBecqeJaxypL:F0nYzoqHXANQDfAwTcd5pnvLlis='
      },
    ],
	},
	// 智能助手点击
  tabClick(e) {
    wx.navigateTo({
			url: '/pages/chat/index',
		})
  },
})