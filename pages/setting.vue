<template lang="pug">
	.p15
		confirm(ref="confirm")
		.item uuid: {{uuid}}
		.item(@tap="update") {{$t('更新')}}
		.item {{$t('联系电话')}}: 15515141039
		.item {{$t('联系电话')}}: 15637245500
		.item {{$t('邮箱')}}: li0kaifei@126.com
		.item(@tap="removeFooter" v-if="!vip") {{$t('去打印底部广告')}}
		.item(@tap="getModel") {{$t('获取打印模板')}}
		.bb 
			view {{$t('打印头')}}
			textarea(v-model="header")
		.bb {{$t('打印尾')}}
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
				vip: '',
				title: '其他设置'
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
				this.$refs.confirm.open(this.$t('请输入去广告码'), '', v=>{
					let uuid = CryptoJS.enc.Utf8.parse(this.uuid.substr(4,8).padStart(8, '0'))
					let cryptoText = CryptoJS.AES.encrypt('vip', uuid, aesOption).ciphertext.toString(CryptoJS.enc.Base64)
					let data = CryptoJS.AES.decrypt(v, uuid, aesOption)
					try{
						data = CryptoJS.enc.Utf8.stringify(data)
						if(data == '') return toast(this.$t('此码无效'))
					}catch(e){
						console.log(e.toString())
						return toast(this.$t('此码无效'))
					}
					if(data == 'vip'){
						db.set('vip', 1)
						toast(this.$t('去广告成功'))
					}else{
						db.set('vip', '')
						toast(this.$t('此码无效'))
					}
				})
			},
			getModel(){
				this.$refs.confirm.open(this.$t('请输入模板码'), '', v=>{
					this.api('getModel', {model: v}).then(data=>{
						db.set('model', data)
						toast(this.$t('更换打印模板成功，重启App生效'))
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
