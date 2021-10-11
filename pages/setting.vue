<template lang="pug">
	.p15
		confirm(ref="confirm")
		.item uuid: {{uuid}}
		.item(@tap="update") 更新
		.item(@tap="backup") 备份
		picker(@change="doRecover" :range="recoverList")
			.item 恢复
</template>

<script>
	import {toast, db, update, uuid} from '@/js/utils'
	import confirm from '@/components/popup/confirm'
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
				uuid: ''
			}
		},
		onLoad(){
			this.uuid = db.get('uuid', '')
			if(this.uuid == ''){
				db.set('uuid', uuid())
				this.uuid = db.get('uuid', '')
			}
			this.refreshRecoverList()
		},
		methods: {
			update(){
				var osname=plus.os.name;
				plus.runtime.getProperty(plus.runtime.appid, function(widgetInfo) {
					console.log(widgetInfo.version,'-------------', osname);
					update({hot:{url: 'http://easy.vccgnd.top/update/' + widgetInfo.version + '.wgt'}})
				});
			},
			backup(){
				this.$refs.confirm.open('请输入密码', '', this.doBackup)
			},
			doBackup(pass){
				this.api('backup', {pass, uuid: this.uuid}).then(() => {
					toast('备份成功')
					this.refreshRecoverList()
				})
			},
			refreshRecoverList(){
				this.api('getBackups', {uuid: this.uuid}).then(data=>{
					this.recoverList = data
				})
			},
			doRecover(event){
				this.url = this.recoverList[event.detail.value]
				if(!this.url) return;
				this.$refs.confirm.open('请输入密码', '', this.doRecover1)
			},
			doRecover1(pass){
				this.api('recover', {pass: pass, url: this.url, uuid: this.uuid})
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
</style>
