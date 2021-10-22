import {db, toast} from './utils'
const CryptoJS = require('crypto-js')
const iv = CryptoJS.enc.Hex.parse('DEAD1151DEAD')
const aesOption = {iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7}
function request(url, data = {}, showLoading = false){
	let method = 'POST'
	data.uid = db.get('uuid')
	let host = 'http://easy.vccgnd.top/api/public/index.php'
	let fullUrl = host+'/api/'+url
	let header = {}
	if(method == 'POST'){
			header['content-type'] = 'application/json'
	}
	if(showLoading)
		uni.showLoading({
			title: '加载中',
			mask: true
		});
	return new Promise((resolve, reject) => {
		uni.request({
			url: fullUrl,
			method,
			data:JSON.stringify(data),
			header,
			success: res => {
				if(showLoading)
					uni.hideLoading();
				if(res.data.code != 1){
					toast(res.data.msg)
					return reject(res.data.msg)
				}
				var resdata=res.data.data;
				resolve(resdata);
			},
			fail: (err)=>{
				if(showLoading)
					uni.hideLoading();
				reject(err)
			}
		});
	})
}
let methods = {
	getClients: async function(data){
		return await request('getClients', data)
	},
	addClient: async function(data){
		return await request('setClient', data)
	},
	updateClient: async function(data){
		return await request('setClient', data)
	},
	getGoods: async function(){
		return await request('getGoods')
	},
	addGoods: async function(data){
		return await request('setGoods', data)
	},
	updateGoods: async function(data){
		return await request('setGoods', data)
	},
	getPriceBook: async function(client){
		return await request('getPriceBook', client)
	},
	saveOrder: async function(order){
		return await request('setOrder', order)
	},
	getOrders: async function(params){
		return await request('getOrders', params)
	},
	setOrderStatus: async function(params){
		return await request('setOrderStatus', params)
	}
}
export default async function (method, data){
	return await methods[method](data)
}