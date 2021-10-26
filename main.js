import Vue from 'vue'
import App from './App'
import mixin from '@/js/mixin'
import i18n from '@/js/lang'

Vue.config.productionTip = false
Vue.mixin(mixin)

App.mpType = 'app'

const app = new Vue({
    ...App,
		i18n
})
app.$mount()
