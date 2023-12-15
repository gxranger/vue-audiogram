import AudiogramCanvas from './index.vue'

AudiogramCanvas.name = 'audiogram-canvas'

AudiogramCanvas.install = function(Vue: any) {
    // 注册组件
    Vue.component('audiogram-canvas', AudiogramCanvas)
}
export default AudiogramCanvas
