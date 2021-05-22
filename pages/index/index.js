// index.js
// 获取应用实例
const app = getApp()

Page({
  data: {
    chartData: []
  },
  onLoad() {
    const scope = this
    setTimeout(() =>{
      scope.setData({
        chartData: [{
          key: '一月',
          val: 10000
        }, {
          key: '二月',
          val: 7000
        }, {
          key: '三月',
          val: 11000
        }, {
          key: '四月',
          val: 4000
        }, {
          key: '五月',
          val: 10000
        }, {
          key: '六月',
          val: 10000
        }, {
          key: '七月',
          val: 13000
        }, {
          key: '八月',
          val: 6000
        }, {
          key: '九月',
          val: 6000
        }, {
          key: '十月',
          val: 6000
        }, {
          key: '十一月',
          val: -1
        }, {
          key: '十二月',
          val: -1
        }]
      })
    },3000)
  },
})
