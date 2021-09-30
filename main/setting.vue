<template lang="pug">
	.p15
		.flex.between
			view(@tap="scan" v-if="!scanning") 搜索蓝牙
			view(v-else @tap="stopScan") 停止搜索
			view(v-if="connected" @tap="disconnect") 断开
		.flex.between.p15(v-for="item in devices" :key="item.deviceId" @tap="connect(item)" :class="item.deviceId==deviceId?'blue':''")
			view {{item.deviceId}}
			view {{item.name || item.localName}}
		view(@tap="test") 打印
</template>

<script>
	import {toast, db} from '@/js/utils'
	import bl from '@/js/bluetooth.js'
	import str2hex from '@/js/str2hex'
	
	export default{
		data(){
			return {
				devices: [],
				connected: false,
				deviceId: '',
				scanning: false,
				lastPrinter: ''
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
			test(){
				this.print({
					goods: [
						{name: '盘子', number: 5, price: '5.50', money: '27.50'}
					]
				})
			},
			print(data){
				let maxLen = 25 // 比如这张纸最多放50个字符
				function calcSpace(text1, text2, len){
					text1 = text1.toString()
					text2 = text2.toString()
					if(!len)
						len = maxLen
					let map = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.,+*!"\'0123456789$'
					function getLen(text){
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
				//ESC! 是调字号  0的编码是48位最大 还可以是0,16,32,48
				let str = ESC+'@'+C1+'!'+ch12+'     大寨欢迎你\n______________________________________\n'+C1+'!' + String.fromCharCode(0)
				for(let goods of data.goods){
					let space1 = '' 
					let len1 = calcSpace(goods.name, goods.number) - 1
					for(let i = 0; i < len1; i++){
						space1 += ' '
					}
					let space2 = ''
					let len2 = calcSpace(goods.price, goods.money) - 2
					console.log(len1, len2)
					for(let i = 0; i < len2; i++){
						space2 += ' '
					}
					str += `   ${goods.name}${space1}x${goods.number}\n   $${goods.price}${space2}$${goods.money}\n`
				}
				str += "\n\n\n\n"
				let hex = str2hex(str)
				console.log(hex)
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

<style>
</style>
