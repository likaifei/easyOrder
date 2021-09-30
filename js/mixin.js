import {page} from '@/js/utils'
import api from './api'

export default {
	methods: {
		go(url){
			if(url.indexOf('main') != -1)
				uni.switchTab({url})
			else
				uni.navigateTo({url});
		},
		back(){
			if(typeof this.closePage == 'function')
				return this.closePage()
			uni.navigateBack()
		},
		closePage(type, data){
			page.close(type, data)
		},
		openPage(url, params){
			page.open(url, params)
		},
		api
	}
}