<template>
  <canvas style="width: 100%; height: 100%;" :id="id"></canvas>
</template>

<script lang="ts" setup>
  import { isArray, isNumber } from 'lodash';
  import { computed, onMounted, ref } from "vue";

  interface Props {
    /**
     * 画布容器id
     */
    id: string;
    /**
     * 耳朵方向
     */
    earSide: string;
    /**
     * 气导数据
     */
    acData?: MaybeArray<Recordable>;
    /**
     * 骨导数据
     */
    bcData?: MaybeArray<Recordable>;
    /**
     * 是否为修正值
     */
    isModified?: Boolean;
  }
  const props = withDefaults(defineProps<Props>(), {
    id: '测试',
    earSide: 'right',
  });

  const width = ref(540)
  const height = ref(480)
  const margin = ref(30)
  const xPositions = {
        125: 0,
        250: 1,
        500: 2,
        1000: 3,
        2000: 4,
        3000: 5,
        4000: 6,
        6000: 7,
        8000: 8,
        10000: 9,
        12000: 10
  }
  const xAisString = ['125', '250', '500', '1k', '2k', '3k', '4k', '6k', '8k', '10k', '12k']
  const yPositions = computed(() => {
    const yObj = {}
    let yInitValue = 1

    for (let i = 0; i <= 120; i += 5) {
      Reflect.set(yObj,i,yInitValue)
      yInitValue += 0.5
    }
    return {
      [-10]: 0,
      [-5]: 0.5,
      ...yObj
    }
  })
  const lineColors = { right: '#ff3e14', left: '#1866ff' }
  const imageFiles = import.meta.glob('../../examples/assets/svg/*.svg')
  // const images = .map((path) => imageFiles[path].default);
  // console.log(), 111)
  const markersGroup = {
    '气导未遮蔽': '',
    '气导遮蔽': '',
    '气导无反应': '',
    '骨导未遮蔽': '',
    '骨导遮蔽': '',
    '骨导未遮蔽无反应': '',
    '骨导遮蔽无反应': '',
    '声场': '',
  }
  const rightIcons = Object.keys(imageFiles).filter(item => item.includes('r'));
  const leftIcons = Object.keys(imageFiles).filter(item => item.includes('l'));
  const rightMarkers = {}
  const leftMarkers = {}
  Object.keys(markersGroup).forEach((key, index) => {
    Reflect.set(rightMarkers, key, rightIcons[index])
    Reflect.set(leftMarkers, key, leftIcons[index])
  });
  console.log(rightMarkers, leftMarkers, '1fdsdfgd')

  const commonXYs = ref([])
  const currentMarkers = computed(() => {
    if (props.earSide === 'right') {
      return rightMarkers
    } else {
      return leftMarkers
    }
  })

  function computeXPosition (index:number) {
    return index * (height.value / 11) + (margin.value * 2.5)
  }
  function computeYPosition (index:number) {
    return index * margin.value + (margin.value * 2)
  }

  function init () {
    const canvas = document.getElementById(props.id) as HTMLCanvasElement
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    canvas.width = width.value
    canvas.height = height.value
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.font = '14px sans-serif'
    ctx.textAlign = 'right'
    ctx.fillStyle = 'gray'

    ctx.beginPath()
    ctx.moveTo(margin.value, margin.value)
    ctx.lineTo(margin.value, height.value)
    ctx.moveTo(margin.value, margin.value)
    ctx.lineTo(width.value, margin.value)
    ctx.moveTo(width.value, margin.value)
    ctx.lineTo(width.value, height.value)
    ctx.moveTo(width.value, height.value)
    ctx.lineTo(margin.value, height.value)
    ctx.stroke()

    ctx.beginPath()
    for (let i = 0; i <= 13; i++) {
      ctx.moveTo(margin.value, computeYPosition(i))
      ctx.lineTo(width.value, computeYPosition(i))
      ctx.fillStyle = '#000'
      if (i === 0) {
        ctx.fillText('-10', margin.value - 5, i * margin.value + (margin.value * 2.2))
      } else if (i === 1) {
        ctx.fillText('0', margin.value - 5, i * margin.value + (margin.value * 2.2))
      } else {
        ctx.fillText(`${(i - 1) * 10}`, margin.value - 5, i * margin.value + (margin.value * 2.2))
      }
    }
    for (let i = 0; i < 11; i++) {
      ctx.moveTo(computeXPosition(i), margin.value)
      ctx.lineTo(computeXPosition(i), height.value)
      ctx.fillStyle = '#000'
      ctx.fillText(xAisString[i], i * (height.value / 11) + (margin.value * 2.8), margin.value - 5)
    }
    ctx.lineWidth = 0.3
    ctx.stroke()
    // 绘制虚线
    ctx.beginPath()
    ctx.setLineDash([5, 10])
    ctx.moveTo(margin.value, margin.value * 5.5)
    ctx.lineTo(width.value, margin.value * 5.5)
    ctx.strokeStyle = '#000000'
    ctx.stroke()
  }
  function addMarker (markerName: String, callback: (img: HTMLImageElement) => void) {
    const img = new Image()
    img.src = Reflect.get(currentMarkers.value, markerName as PropertyKey)

    img.onload = () => callback(img)
  }
  function drawLine (data: MaybeArray<Recordable>, audioType: 'AC' | 'BC') {
    const canvas = document.getElementById(props.id) as HTMLCanvasElement
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    if (isArray(data) && data.length > 0) {
      ctx.beginPath()
      ctx.lineWidth = 2
      ctx.strokeStyle = Reflect.get(lineColors, props.earSide)
      if (audioType === 'BC') {
        ctx.setLineDash([5, 3])
      } else if (audioType === 'AC') {
        ctx.setLineDash([])
      }
      data.forEach((item:Recordable) => {
        if (isNumber(item.db)) {
          const x = computeXPosition(Reflect.get(xPositions, item.hz))
          const y = computeXPosition(Reflect.get(yPositions, item.db))
          // 修正值模式
          if (props.isModified) {
            // 根据db的值定位之后，再根据difference属性进行y轴的偏移
            ctx.lineTo(x, y - (item.difference * 2.5))
            addMarker(item.marker, (img) => {
              ctx.drawImage(img, x - 10, y - 10 - (item.difference * 2.5), 20, 20)
            })
          } else { // 原值模式
            ctx.lineTo(x, y)
            // const isOverlap = commonXYs.value.includes(item.id)
            addMarker(item.marker, (img) => {
              if (commonXYs.value.includes(item.id)) {
                ctx.drawImage(img, x - 10, y + 10, 20, 20)
              } else {
                ctx.drawImage(img, x - 10, y - 10, 20, 20)
              }
            })
          }
        }
      })
      ctx.stroke()
    }
  }

  onMounted(() => {
    init()
  })
</script>

<style scoped>
.tButton {
  background-color: #1188ff;
  color: white;
  border: none;
  padding: 6px 12px;
  cursor: pointer;
}
</style>
