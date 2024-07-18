// pages/chat.js
// import { baseUrl, OPEN_API_KEY } from '~/config';
import Mock from '~/utils/mock-min';
const app = getApp();
let screenHeight = wx.getSystemInfoSync().screenHeight;
// 安全区域的高度
let safeAreaHeight = screenHeight - wx.getSystemInfoSync().safeArea.bottom;
// 导航栏高度
let navBarHeight = wx.getSystemInfoSync().statusBarHeight + 22;
let requestTask = null
let currentContent = ''; // 当前输入框的内容
const defaultPrompt = {
	title: 'default',
	name: 'ChatGPT',
	content: '',
	description: '一个 AI 语言模型，可以回答问题的人工智能程序。\n\n 【点击顶部可以切换不同角色哦～】',
	checked: true
}

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		inputValue: '',
		fixedTop: 0, // 安全区域34
		contentHeight: navBarHeight + safeAreaHeight + 70,
		currentItem: '',
		messageList: [], // 消息列表
		loading: false,
		thinking: false, // 是否联想
    currentPrompt: defaultPrompt,
    scrollTop: 0,
	},
	handleSwitchRole() {
		wx.navigateTo({
			url: '/pages/prompt/index',
		})
  },
  // 返回
	goBack() {
		wx.navigateBack();
  },
  // 请求消息列表
	handleClear() {
		if (this.data.loading || this.data.thinking) return
		this.setData({
			messageList: [],
		});
  },
  // 输入框内容发生改变
	handleValueChange(e) {
		this.setData({
			inputValue: e.detail.value
		})
  },
  // 处理键盘高度
	handleKeyboardHeightChange(e) {
    const isExpand = e.detail.height > 0
    let keyHeight = e.detail.height;
    if (keyHeight < 0) {
      keyHeight = 0;
    }
    // foot的frame
		const query = wx.createSelectorQuery();
		query.select('#footer').boundingClientRect((rect) => {
      const offsetBottom = keyHeight > 0 ? keyHeight - safeAreaHeight : 0;
			if (isExpand) {
				this.setData({
					fixedTop: offsetBottom,
					currentItem: 'bottom',
					contentHeight: rect.height + offsetBottom + navBarHeight + safeAreaHeight
				})
			} else {
				this.setData({
					fixedTop: offsetBottom,
					contentHeight: rect.height + offsetBottom + navBarHeight + safeAreaHeight
				})
			}
		}).exec()
	},
	async handleSendClick() {
		const userInput = this.data.inputValue.trim()
		if (userInput.trim() === '') return
		const messageList = this.data.messageList
		const timestamp = Date.now();
		const newMessage = {
			id: timestamp,
			role: 'user',
			content: userInput
		}
		this.setData({
			messageList: messageList.concat(newMessage),
			inputValue: '',
			loading: true,
			thinking: true
		})
		this.requestWithMessage(userInput)
	},
	requestWithMessage(content) {
		let messages = [{
			role: 'user',
			content
		}]
		const currentPrompt = this.data.currentPrompt
		if (currentPrompt.content) {
			messages.unshift({
				role: 'system',
				content: currentPrompt.content
			})
    }
    // mock
    this.mockData(content).then((res) => {
      const { content, type } = res.data;
      const timestamp = Date.now();
      const index = this.data.messageList.length;
      const newMessageList = `messageList[${index}]`
      if (type === 'markdown') { // markdown格式
        let result = app.towxml(content, 'markdown',{
          theme:'light',					// 主题，默认`light`
          events:{					// 为元素绑定的事件方法
            tap:(e)=>{
              const { target } = e;
              const { dataset } = target || {};
              const { data } = dataset || {};
              this.handleTapClick(data);
            }
          }
        });
        this.setData({
          loading: false,
          thinking: false,
          [newMessageList]: {
            id: timestamp,
            role: 'assistant',
            finished: true,
            md: result,
          }
        }, () => {
          this.setData({
            currentItem: 'bottom'
          });
        })
        currentContent = ''
        return;
      }
      // const timestamp = Date.now();
      // const index = this.data.messageList.length;
      // const newMessageList = `messageList[${index}]`
      const contentCharArr = content.trim().split("")
      const content_key = `messageList[${index}].content`
      const finished_key = `messageList[${index}].finished`
      this.setData({
        thinking: false,
        [newMessageList]: {
          id: timestamp,
          role: 'assistant',
          finished: true,
        }
      })
      currentContent = ''
      this.show_text(0, content_key, finished_key, contentCharArr);
    });
    return;

		requestTask = wx.request({
			url: `${baseUrl}/v1/chat/completions`,
			data: {
				model: "gpt-3.5-turbo",
				messages
			},
			method: 'POST',
			responseType: 'text',
			header: {
				'content-type': 'application/json',
				Authorization: `Bearer ${OPEN_API_KEY}`,
			},
			success: async (res) => {
				const result = res.data?.choices[0].message.content || "";
				if (result) {
					const timestamp = Date.now();
					const index = this.data.messageList.length
					const newMessageList = `messageList[${index}]`
					const contentCharArr = result.trim().split("")
					const content_key = `messageList[${index}].content`
					const finished_key = `messageList[${index}].finished`
					this.setData({
						thinking: false,
						[newMessageList]: {
							id: timestamp,
							role: 'assistant',
							finished: false
						}
					})
					currentContent = ''
					this.show_text(0, content_key, finished_key, contentCharArr);
				} else {
					this.setData({
						thinking: false,
						loading: false
					})
					wx.showToast({
						icon: 'none',
						title: '系统繁忙，请重试',
					})
				}
			},
			fail: (err) => {
				if (!baseUrl) {
					console.error('尚未配置有效的 baseUrl', baseUrl)
				}

				wx.showToast({
					icon: 'none',
					title: `服务请求错误`,
				})
				this.setData({
					thinking: false,
					loading: false
				})
			}
		});

  },
  // 打字效果
	show_text(key = 0, content_key, finished_key, value) {
		if (key >= value.length) {
			this.setData({
				loading: false,
        [finished_key]: true,
        currentItem: this.data.messageList.length - 1 
			});
			// wx.vibrateShort()
			return;
		}
		currentContent = currentContent + value[key]
		this.setData({
			[content_key]: currentContent,
    }, () => {
      this.handleScollTop().then(() => {
        setTimeout(() => {
          this.show_text(key + 1, content_key, finished_key, value);
        }, 50);
      });
    })
    
		// setTimeout(() => {
		// 	this.show_text(key + 1, content_key, finished_key, value);
		// }, 50);
  },
  // 消息点击
  handleTapClick(data) {
    console.log('-----', data);
    const { tag, attrs } = data || {};
    const { alt } = attrs || {};
    if (tag === 'img' && alt === 'hotel') {
      wx.navigateTo({
        url: `/pages/hotel/index?title=怡程酒店`,
      })
    }
  },
  // 处理自动滚动
  handleScollTop() {
    return new Promise((resolve) => {
      const query = wx.createSelectorQuery();
      query.select('.content').boundingClientRect();
      query.select('.scroll-view-content').boundingClientRect();
      query.exec((res) => {
        const scrollViewHeight = res[0].height;
        const scrollContentHeight = res[1].height;
        if (scrollContentHeight > scrollViewHeight) {
          const scrollTop = scrollContentHeight - scrollViewHeight;
          this.setData({
            scrollTop: scrollTop,
          }, () => {
            resolve();
          })
        } else {
          resolve();
        }
      })
    });
  },
	handleCancel() {
		if (!requestTask) return
		requestTask.abort()
		wx.showToast({
			icon: 'none',
			title: '已取消',
		})
  },
  testData() {
    const mkStr = `![cat](https://img1.baidu.com/it/u=3190249465,1668871348&fm=253&fmt=auto&app=120&f=JPEG?w=622&h=422)
> 好的，这是一张小猫的图片

> 下面为您提供了对应的markdown图片地址，可直接复制使用
<pre>![cat](https://img1.baidu.com/it/u=3190249465,1668871348&fm=253&fmt=auto&app=120&f=JPEG?w=622&h=422)
</pre>
    `;
    let result = app.towxml(mkStr, 'markdown',{
      theme:'light',					// 主题，默认`light`
      events:{					// 为元素绑定的事件方法
        tap:(e)=>{
          const { target } = e;
          const { dataset } = target || {};
          const { data } = dataset || {};
          this.handleTapClick(data);
        }
      }
    });
    const list = [
      {
        id: Date.now(),
        role: 'user',
        content: '你好',
        finished: true
      },
      {
        id: Date.now(),
        role: 'assistant',
        content: '你好',
        finished: true
      },
      {
        id: Date.now(),
        role: 'user',
        content: '帮我生成一张小猫的图片',
        finished: true
      },
      {
        id: Date.now(),
        role: 'assistant',
        md: result,
        finished: true
      },
    ];
    this.setData({
      messageList: this.data.messageList.concat(list),
    });
  },
  mockData(reqContent) {
    return new Promise((resolve) => {
      let content = '@ctitle(3,100)';
      let type = 'text';
      if (reqContent.includes('图片')) {
        content = `![cat](https://img1.baidu.com/it/u=3190249465,1668871348&fm=253&fmt=auto&app=120&f=JPEG?w=622&h=422)`;
        type = 'markdown';
      } else if (reqContent.includes('酒店')) {
        content = `# 酒店\n ![hotel](https://img1.baidu.com/it/u=244974803,2329719892&fm=253&fmt=auto&app=120&f=JPEG?w=570&h=380)`;
        type = 'markdown';
      }
      const res = Mock.mock({
        'code': '200',
        'msg': 'success',
        'data': {
          'id|+1': 1,
          type,
          'content': content,
          'timestamp': '@datetime()',
        }
      });
      setTimeout(() => {
        resolve(res);
      }, 1000);
    })

  },
	onShow() {
    // wx.hideHomeButton()
    // 从本地取出角色prompt
    const prompt = wx.getStorageSync('prompt');
		if (Object.keys(prompt).length === 0) {
      return;
    }
		this.setData({
      currentPrompt: prompt,
		});
    // this.handleClear()
  },
  onLoad() {
    // 添加测试数据
    this.testData();
  }
})