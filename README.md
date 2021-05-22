# wxAppSignName
微信小程序曲线图表组件

组件位于component目录的curveChart，page/index为页面事例
## 使用方法
配置文件
```
{
  "usingComponents": {
    "curve-chart": "/component/curveChart/curveChart"
  }
}
```
页面wxml引入组件
```
<curve-chart 
  chartData="{{chartData}}"
  lineColor="{{lineColor}}" 
  backColor="{{backColor}}" 
  coordinateFontColor="{{coordinateFontColor}}"
  coordinateColor="{{coordinateColor}}"
  width="{{canvasWidth}}" 
  height="{{canvasHeight}}">
</curve-chart>
```
属性|类型|必填|默认值|说明
--|:--:|:--:|:--:|:--
chartData|Array|是|[]|传入图标的数据 格式为[{key: '一月',val: 10000}]
lineColor|String|否|#5da3f9|线条颜色
backColor|String|否|#fff|画板背景颜色
coordinateFontColor|String|否|#333|坐标轴字体颜色
coordinateColor|String|否|#ccc|坐标轴颜色
width|String|否|600|画板宽度
height|String|否|400|画板长度

