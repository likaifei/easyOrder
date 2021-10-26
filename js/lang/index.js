import Vue from 'vue'
import VueI18n from 'vue-i18n'
Vue.use(VueI18n)
import {zh, en} from './data'
let locale=uni.getStorageSync('lang') || '';
if(locale==''){
	locale='zh';
	uni.setStorageSync('lang',locale)
}
const i18n=new VueI18n({
	locale:locale,
	messages:{
		zh, en
	}
})
export default i18n