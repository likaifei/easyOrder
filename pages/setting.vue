<template lang="pug">
	.p15
		confirm(ref="confirm")
		.item uuid: {{uuid}}
		.item(@tap="update") 更新
		.item 联系电话: 15515141039
		.item(@tap="removeFooter" v-if="!vip") 去打印底部广告
		.item 联系电话: 15637245500
		.item(@tap="getModel") 获取打印模板
		.bb 
			view 打印头
			textarea(v-model="header")
		.bb 打印尾
			textarea(v-model="footer")
</template>

<script>
	import {toast, db, update, uuid} from '@/js/utils'
	import confirm from '@/components/popup/confirm'
	const CryptoJS = require('crypto-js')
	const iv = CryptoJS.enc.Hex.parse('DEAD1151DEAD')
	const aesOption = {iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7}
	
	export default{
		components: {confirm},
		data(){
			return {
				devices: [],
				connected: false,
				deviceId: '',
				scanning: false,
				lastPrinter: '',
				recoverList: [],
				url: '',
				uuid: '',
				header: '',
				footer: '',
				vip: ''
			}
		},
		onLoad(){
			this.uuid = db.get('uuid', '').substr(0, 19)
			if(this.uuid == ''){
				db.set('uuid', uuid())
				this.uuid = db.get('uuid', '').substr(0, 19)
			}
			this.header = db.get('header')
			this.footer = db.get('footer')
			this.vip = db.get('vip', '')
		},
		methods: {
			update(){
				var osname=plus.os.name;
				plus.runtime.getProperty(plus.runtime.appid, (widgetInfo) => {
					console.log(widgetInfo.version,'-------------', osname);
					update({hot:{url: 'http://easy.vccgnd.top/update/' + this.uuid + '.wgt'}})
				});
			},
			removeFooter(){
				this.$refs.confirm.open('请输入去广告码', '', v=>{
					let uuid = CryptoJS.enc.Utf8.parse(this.uuid.substr(4,8).padStart(8, '0'))
					let cryptoText = CryptoJS.AES.encrypt('vip', uuid, aesOption).ciphertext.toString(CryptoJS.enc.Base64)
					let data = CryptoJS.AES.decrypt(v, uuid, aesOption)
					try{
						data = CryptoJS.enc.Utf8.stringify(data)
						if(data == '') return toast('此码无效')
					}catch(e){
						console.log(e.toString())
						return toast('此码无效')
					}
					if(data == 'vip'){
						db.set('vip', 1)
						toast('去广告成功')
					}else{
						db.set('vip', '')
						toast('此码无效')
					}
				})
			},
			getModel(){
				this.$refs.confirm.open('请输入去模板码', '', v=>{
					this.api('getModel', {model: v}).then(data=>{
						db.set('model', data)
						toast('更换打印模板成功, 重启App生效')
					})
				})
			}
		},
		watch: {
			footer: function(){
				db.set('footer', this.footer)
			},
			header: function(){
				db.set('header', this.header)
			}
		}
	}
	
</script>

<style scoped>
	.item{
		line-height: 80upx;
		height: 80upx;
		border-bottom: 1px solid #ccc;
	}
	.bb{
		border-bottom: 1px solid #ccc;
	}
</style>
