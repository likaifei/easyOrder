import {toast, db} from '@/js/utils'
var sending = false
function callUni(api, obj = {}){
	return new Promise((resolve, reject) => {
		obj.success = resolve
		obj.fail = function(e){
			toast(e)
			console.log(e)
			reject(e)
		}
		uni[api](obj)
	})
}
function _sendSlow(deviceId, value){
	let size = 40
	uni.writeBLECharacteristicValue({
		// serviceId:'E7810A71-73AE-499D-8C15-FAA9AEF0C3F2', 
		// characteristicId:'BEF8D6C9-9C21-4C9E-B632-BD58C1009F9F', 
		serviceId:'000018F0-0000-1000-8000-00805F9B34FB', 
		characteristicId:'00002AF1-0000-1000-8000-00805F9B34FB', 
		deviceId,
		value: Buffer(value.substr(0, size), 'hex'),
		success(){
			value = value.substr(size)
			if(value.length > 0){
				_sendSlow(deviceId, value)
			}else{
				sending = false
			}
		},
		fail(e){
			toast(e)
			console.log(e)
			sending = false
		}
	})
}
export default {
	open(){
		return callUni('openBluetoothAdapter')
	},
	close(){
		return callUni('closeBluetoothAdapter')
	},
	scan(){
		return callUni('startBluetoothDevicesDiscovery')
	},
	stopScan(){
		console.log('stopSacn')
		return callUni('stopBluetoothDevicesDiscovery')
	},
	onScan(cb){
		return uni.onBluetoothDeviceFound(cb)
	},
	
	send(deviceId, hex){
		if(sending) return toast('上次蓝牙数据还没传完, 请等待')
		sending = true
		_sendSlow(deviceId, hex)
	},
	connect(deviceId){
		uni.createBLEConnection({deviceId})
	},
	disconnect(deviceId){
		uni.closeBLEConnection({deviceId})
	},
	connectChange(cb){
		uni.onBLEConnectionStateChange(cb)
		/*CALLBACK 返回参数
		deviceId	string	蓝牙设备ID
		connected	boolean	是否处于已连接状态
		*/
	}
	
}