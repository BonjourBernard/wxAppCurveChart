// page/common/signName/signName.js
// canvas内容实例
var ctx, canvasObj
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    chartData: {
      type: Array,
      value: [],
      observer: function (newVal, oldVal, changedPath) {
        if (newVal && newVal.length > 0 && newVal != oldVal) {
          if(this.data.chartData){
            this.setData({
              showChart: true
            }, () => {
              this.drawChart()
            })
          }
        }
      }
    },
    width:  {
      type: String,
      value: '600'
    },
    height:  {
      type: String,
      value: '400'
    },
    img: String,
    lineColor:  {
      type: String,
      value: '#5da3f9'
    },
    backColor:  {
      type: String,
      value: '#fff'
    },
    coordinateBackColor:{
      type: String,
      value: '#ccc'
    },
    coordinateColor:{
      type: String,
      value: '#333'
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    windowWidth: 375,
    touchValue: 0,
    currentChartIndex: 0,
    currentMoveIndex: 0,
  },

  lifetimes: {
    attached() {
      // 展示图表
      const {windowWidth} = wx.getSystemInfoSync()
      this.data.windowWidth = windowWidth
      if(this.data.chartData && this.data.chartData.length > 0){
        this.setData({
          showChart: true
        }, () => {
          this.drawChart()
        })
      }
    },
    ready() {
    },
    detached() {
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {

    drawChart() {
      let chartData = this.data.chartData, scope = this
      const query = wx.createSelectorQuery().in(this)
      query.select('#chartCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          const canvas = res[0].node
          const dpr = wx.getSystemInfoSync().pixelRatio
          let ctx = canvas.getContext('2d')
          let ctxWidth = res[0].width
          let ctxHeight = res[0].height
          canvas.width = res[0].width * dpr
          canvas.height = res[0].height * dpr
          ctx.scale(dpr, dpr)
          scope.drawLineChart(chartData, ctx, ctxWidth, ctxHeight, 56 * scope.data.windowWidth / 375);
        })
    },
    // 画曲线图
    drawLineChart: function (data, ctx, width, height, distance) {
      var that = this
      if (!ctx || !data) {
        console.warn('请传入必要数据')
        return;
      }
      that.ctx = ctx
      that.chartData = data
      that.max = 0
      that.min = 0
      that.width = width
      that.height = height
      that.ctx.clearRect(0, 0, that.width, that.height)
      that.distance = distance || (50 * that.data.windowWidth / 375)
      that.innerHeight = that.height - (64 * that.data.windowWidth / 375)
      that.innerWidth = that.width - (57 * that.data.windowWidth / 375)
      that.startPoint = { x: (57 * that.data.windowWidth / 375), y: that.height - (44 * that.data.windowWidth / 375) }    //原点位置
      that.findTerminal()
      that.drawCoordinate()
      that.drawLine()
    },
    // 重绘
    redrawLine(data) {
      this.chartData = data
      this.ctx.clearRect(0, 0, this.width, this.height)
      this.drawCoordinate()
      this.drawLine()
    },
    //找到最大值和最小值
    findTerminal: function () {
      var that = this
      this.chartData.map((item, index) => {
        that.max = item.val > that.max ? item.val : that.max
        // 纵坐标分割 获取坐标最大值
        that.min = (item.val < that.min && item.val != -1) ? item.val : that.min
      })
      that.max = Math.ceil(this.max / 4) * 4
      that.max = that.max || 4
    },
    //绘制坐标轴
    drawCoordinate: function () {
      //绘制坐标轴
      this.ctx.clearRect((57 * this.data.windowWidth / 375), (44 * this.data.windowWidth / 375), this.width - (57 * this.data.windowWidth / 375), this.height - (44 * this.data.windowWidth / 375))
      this.ctx.fillStyle = this.data.backColor
      this.ctx.fillRect(0, 0, this.data.width, this.data.height)
      this.ctx.beginPath()
      // 横向坐标
      this.ctx.strokeStyle = this.data.coordinateBackColor
      this.ctx.moveTo(this.startPoint.x, this.startPoint.y)
      this.ctx.lineTo(this.startPoint.x + this.innerWidth, this.startPoint.y)
      this.ctx.stroke()
      for (let i = 0; i < this.chartData.length; i++) {
        let curX = this.startPoint.x + this.distance * i
        this.ctx.font = "normal normal 14px sans-serif";
        this.ctx.fillStyle = this.data.coordinateColor
        this.ctx.textAlign = "center"
        this.ctx.fillText(this.chartData[i]['key'], curX, this.startPoint.y + 20)
      }
      // 纵向坐标以及分割线
      this.ctx.moveTo(this.startPoint.x, this.startPoint.y)
      this.ctx.lineTo(this.startPoint.x, this.startPoint.y - this.innerHeight)
      this.ctx.stroke()
      // 获取纵坐标分割数值 max已经换算过 不用取整
      let ordinate = this.max / 4,
        currentOrdinate = 0, curY = 0
      this.ctx.textAlign = "right"
      this.ctx.setLineDash([8, 8]);
      for (let i = 1; i <= 4; i++) {
        currentOrdinate = ordinate * i
        curY = this.startPoint.y - (((currentOrdinate - this.min) / (this.max - this.min)) * this.innerHeight)
        this.ctx.fillText(`￥${currentOrdinate}`, this.startPoint.x - 10, curY + 5)
        this.ctx.moveTo(this.startPoint.x, curY)
        this.ctx.lineTo(this.startPoint.x + this.innerWidth, curY)
      }
      this.ctx.stroke()
      this.ctx.setLineDash([]);
    },
    /*
    *根据已知点获取第i个控制点的坐标
    *param points	图表上所有的坐标点
    *param i	当前索引
    *param a,b 比例 默认为0.2（这个感觉最好，不太清楚这两个是什么意思）
    */
    getCtrlPoint: function (points, i, a, b) {
      if (!a || !b) {
        a = 0.2;
        b = 0.2;
      }
      var pointsLength = points.length
      //处理两种极端情形
      if (i == 0) {
        var ctrlPoint_1_x = points[0].x + (points[1].x - points[0].x) * a;
        var ctrlPoint_1_y = points[0].y + (points[1].y - points[0].y) * a;
      } else {
        var ctrlPoint_1_x = points[i].x + (points[i + 1].x - points[i - 1].x) * a;
        var ctrlPoint_1_y = points[i].y + (points[i + 1].y - points[i - 1].y) * a;
      }
      if (i > pointsLength - 3) {
        var ctrlPoint_2_x = points[pointsLength - 1].x - (points[pointsLength - 1].x - points[pointsLength - 2].x) * b;
        var ctrlPoint_2_y = points[pointsLength - 1].y - (points[pointsLength - 1].y - points[pointsLength - 2].y) * b;
      } else {
        var ctrlPoint_2_x = points[i + 1].x - (points[i + 2].x - points[i].x) * b;
        var ctrlPoint_2_y = points[i + 1].y - (points[i + 2].y - points[i].y) * b;
      }
      return {
        pA: { x: ctrlPoint_1_x, y: ctrlPoint_1_y },
        pB: { x: ctrlPoint_2_x, y: ctrlPoint_2_y }
      }
    },
    //绘制折线
    drawLine: function () {
      var that = this
      this.ctx.beginPath()
      var pointArr = []
      // var point = { x: 0, y: 0 }, lastPoint = { x: 0, y: 0 }, halfPoint = { x: 0, y: 0 }, ctrlPoint = { x: 0, y: 0 }
      // // 获取所有坐标
      for (let i = 0; i < this.chartData.length; i++) {
        if (this.chartData[i].val >= 0) {
          var point = {
            x: this.startPoint.x + i * this.distance,
            y: this.startPoint.y - (((this.chartData[i].val - this.min) / (this.max - this.min)) * this.innerHeight)
          }
          pointArr.push(point)
          that.ctx.font = "normal normal 10px sans-serif";
          that.ctx.fillStyle = that.data.lineColor
          that.ctx.textAlign = "center"
          that.ctx.fillText(`￥${that.chartData[i].val}`, point.x, point.y - 10)
          that.ctx.beginPath()
          that.ctx.arc(point.x, point.y, 3, 0, 4 * Math.PI);
          that.ctx.fill()
        }
      }
      var ctrlP = {}
      pointArr.forEach(function (item, index) {
        if (index == 0) {
          that.ctx.beginPath();
          that.ctx.moveTo(pointArr[index].x, pointArr[index].y);
        } else {
          if (that.chartData[index - 1].val == 0 && that.chartData[index].val == 0) {
            that.ctx.lineTo(pointArr[index].x, pointArr[index].y)
          } else {
            ctrlP = that.getCtrlPoint(pointArr, index - 1);
            that.ctx.bezierCurveTo(ctrlP.pA.x, ctrlP.pA.y, ctrlP.pB.x, ctrlP.pB.y, pointArr[index].x, pointArr[index].y);
          }
        }
        that.ctx.moveTo(item.x, item.y)
        // that.ctx.shadowOffsetX = 2; // 阴影Y轴偏移
        // that.ctx.shadowOffsetY = 2; // 阴影X轴偏移
        // that.ctx.shadowBlur = 10; // 模糊尺寸
        // that.ctx.shadowColor = 'rgba(93,163,249, 0.7)'; // 颜色
      });
      that.ctx.lineWidth = 2;
      that.ctx.strokeStyle = that.data.lineColor
      that.ctx.stroke()
    },
  
    canvasTouchStart(e) {
      this.data.touchValue = e.changedTouches[0].x
    },
  
    canvasTouchEnd(e) {
      this.data.currentChartIndex = this.data.currentMoveIndex
    },
    canvasMove(e) {
      let currentTouchValue = e.changedTouches[0].x,
        startTouchValue = this.data.touchValue,
        chartData = this.data.chartData,
        currentChartIndex = this.data.currentChartIndex,
        moveIndex = 0,
        currentMoveIndex = this.data.currentMoveIndex
  
      if (startTouchValue > currentTouchValue) {
        moveIndex = Math.floor((startTouchValue - currentTouchValue) / 50)
        if (currentChartIndex + moveIndex > 6 || this.data.currentMoveIndex == currentChartIndex + moveIndex) return
        currentMoveIndex = currentChartIndex + moveIndex
        if (typeof currentMoveIndex != 'number') return
        chartData = chartData.slice(currentMoveIndex)
      } else {
        moveIndex = Math.floor((currentTouchValue - startTouchValue) / 50)
        if (currentChartIndex - moveIndex < 0 || this.data.currentMoveIndex == currentChartIndex - moveIndex) return
        currentMoveIndex = currentChartIndex - moveIndex
        if (typeof currentMoveIndex != 'number') return
        chartData = chartData.slice(currentMoveIndex)
      }
      this.data.currentMoveIndex = currentMoveIndex
      this.redrawLine(chartData);
    },
    errorHandler(e) {
      console.error(e)
    },
  },
})
