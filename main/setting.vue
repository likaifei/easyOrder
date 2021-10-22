<template lang="pug">
	.p15
		.item(@tap="go('/pages/setting')") 其他设置
		.flex.between.mt20
			view(@tap="scan" v-if="!scanning") 搜索蓝牙
			view(v-else @tap="stopScan") 停止搜索
			view(v-if="connected" @tap="disconnect") 断开
		.flex.between.p15(v-for="item in devices" :key="item.deviceId" @tap="connect(item)" :class="item.deviceId==deviceId?'blue':''")
			view {{item.deviceId}}
			view {{item.name || item.localName}}
</template>

<script>
	import {toast, db, update} from '@/js/utils'
	import bl from '@/js/bluetooth.js'
	import str2hex from '@/js/str2hex'
	
	export default{
		data(){
			return {
				devices: [],
				connected: false,
				deviceId: '',
				scanning: false,
				lastPrinter: '',
				recoverList: []
			}
		},
		onLoad(){
			uni.$on('print', this.print)
			this.lastPrinter = db.get('lastPrinter')
			bl.open()
			bl.onScan(this.onScan)
			this.scan()
		},
		methods: {
			onScan(devices){
				this.devices = this.devices.concat(devices.devices)
				let oldDeviceId = this.lastPrinter
				let history = this.devices.filter(i=>i.deviceId==oldDeviceId)
				if(history.length > 0){
					this.connect(history[0])
				}
			},
			disconnect(){
				this.connected = false
				this.deviceId = ''
				bl.disconnect(this.deviceId)
				this.lastPrinter = ''
			},
			scan(){
				this.devices = []
				bl.scan()
				this.scanning = true
			},
			stopScan(){
				bl.stopScan()
				this.scanning = false
			},
			print(data){
				let maxLen = 25 // 比如这张纸最多放25个字符
				function getLen(text){
					let map = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.,+*!"\'0123456789$'
					let result = 0
					for(let i = 0; i < text.length; i++){
						if(map.indexOf(text.substr(i, 1)) == -1){
							result += 2
						}else{
							result += 1
						}
					}
					return result
				}
				function calcSpace(text1, text2, len){
					text1 = text1.toString()
					text2 = text2.toString()
					if(!len)
						len = maxLen
					
					let len1 = getLen(text1)
					let len2 = getLen(text2)
					console.log(len, len1, len2)
					let result = len - len1 - len2
					if(result < 1) result = 1
					return result
				}
				if(!this.connected) return toast('请先链接打印机')
				let ESC = String.fromCharCode(27)
				let C1 = String.fromCharCode(0x1c)
				let ch12 = String.fromCharCode(12)
				let line = '________________________________\n'
				//ESC! 是调字号  0的编码是48位最大 还可以是0,16,32,48
				let header = db.get('header')
				let footer = db.get('footer')
				let vip = db.get('vip')
				let str = ESC+'@'+C1+'!'+ch12+ header +C1+'!' + String.fromCharCode(0) + '\n'
				str += line
				str += '   名称        单价  个数  总价\n'
				let total = 0
				for(let goods of data.goods){
					let {number, name, price, money} = goods
					price = Number(price).toFixed(1).replace('.0', '')
					money = Number(money).toFixed(1).replace('.0', '')
					
					let len1 = Math.max(12 - getLen(name), 2)
					let len2 = Math.max(6 - getLen(price), 2)
					let len3 = Math.max(6 - getLen(number), 2)
					let space1 = new Array(len1).fill(' ').join('')
					let space2 = new Array(len2).fill(' ').join('')
					let space3 = new Array(len3).fill(' ').join('')
					
					str += `   ${name}${space1}${price}${space2}${number}${space3}${money}\n`
					total += Number(goods.money)
				}
				total = total.toFixed(2)
				let len4 = calcSpace('合计:元', total)
				let space4 = new Array(len4).fill(' ').join('')
				str += line
				str += `   ${space4}合计: ${total} 元\n`
				if(!vip) str += footer
				str += '软件开发:15637245500,15515141039\n'
				str += '\n\n\n\n'
				let hex = str2hex(str)
				bl.send(this.deviceId, hex)
				toast('打印指令发送完成')
			},
			connect(item){
				this.stopScan()
				this.deviceId = item.deviceId
				uni.onBLEConnectionStateChange(res => {
					if(this.deviceId == res.deviceId){
						this.connected = res.connected
						db.set('lastPrinter', res.deviceId)
					}
				})
				bl.connect(item.deviceId)
			},
			connectChange(obj){
				log('connectChange', obj)
				let {deviceId, connected} = obj
				if(this.deviceId != deviceId) return;
				this.connected = connected
			},
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
