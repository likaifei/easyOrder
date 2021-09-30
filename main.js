import Vue from 'vue'
import App from './App'
import mixin from '@/js/mixin'

Vue.config.productionTip = false
Vue.mixin(mixin)

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
