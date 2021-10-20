import {db, toast} from './utils'
const CryptoJS = require('crypto-js')
const iv = CryptoJS.enc.Hex.parse('DEAD1151DEAD')
const aesOption = {iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7}
function request(url, data = null, showLoading = false){
	let method = (data)? 'POST': 'GET'
	let host = 'http://easy.vccgnd.top'
	let fullUrl = host+'/'+url
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
				var resdata=res.data;
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
function nextId(){
	let nextId = db.get('nextId', 1)
	db.set('nextId', Number(nextId) + 1)
	return nextId
}
class methods {
	async baseGetList(key){
		return db.get(key, [])
	}
	async baseSave(key, clients){
		db.set(key, clients)
	}
	async getClients(){
		return this.baseGetList('clients')
	}
	async baseAddList(key, data){
		data.id = nextId()
		let list = this.baseGetList(key)
		list.push(data)
		this.baseSave(key, list)
		return list
	}
	async baseUpdate(key, data){
		let list = this.baseGetList(key)
		let found = list.filter(i => i.id == data.id)
		if(found.length==0) return toast('更新失败')
		let index = list.indexOf(found[0])
		list[index] = data
		this.baseSave(key, list)
	}
	async addClient(data){
		return await this.baseAddList('clients', data)
	}
	async updateClient(data){
		return await this.baseUpdate('clients', data)
	}
	async getGoods(){
		return await  this.baseGetList('goods')
	}
	async addGoods(data){
		return await this.baseAddList('goods', data)
	}
	async updateGoods(data){
		return await this.baseUpdate('goods', data)
	}
	async getPriceBook(client){
		return await  db.get('priceBook' + client.id, {})
	}
	async getPriceBookMap(){
		return await  db.get('priceBookMap', [])
	}
	async saveOrder(order){
		let priceBook = this.getPriceBook(order.client)
		for(let item of order.goods){
			priceBook[item.id] = item.price
		}
		let bookMap = this.getPriceBookMap()
		if(bookMap.indexOf(order.client.id) == -1){
			bookMap.push(order.client.id)
			this.baseSave('priceBookMap', bookMap)
		}
		this.baseSave('priceBook' + order.client.id, priceBook)
		if(order.id)
			this.baseUpdate('orders', order)
		else{
			order.id = nextId()
			let list = this.baseGetList('orders')
			list.push(order)
			if(list.length > 1000){
				list.shift()
			}
			this.baseSave('orders', list)
		}
	}
	async getOrders(){
		return await this.baseGetList('orders')
	}
	async backup({pass, uuid}){
		pass = CryptoJS.enc.Utf8.parse(pass.padStart(8, '0'))
		let priceBookMap = this.getPriceBookMap()
		let priceBooks = {}
		let nextId = db.get('nextId', 1)
		for(let id of priceBookMap){
			priceBooks[id] = this.getPriceBook({id})
		}
		let data = {
			goods: this.getGoods(),
			orders: this.getOrders(),
			clients: this.getClients(),
			priceBookMap,
			priceBooks,
			nextId
		}
		data = JSON.stringify(data)
		let encryptoData = CryptoJS.AES.encrypt(data, pass, aesOption)
		return request('e.php?uuid='+uuid, encryptoData.ciphertext.toString(CryptoJS.enc.Base64))
	}
	async getBackups({uuid}){
		return request('g.php?uuid='+uuid)
	}
	async recover({pass, url, uuid}){
		pass = CryptoJS.enc.Utf8.parse(pass.padStart(8, '0'))
		console.log(url)
		request('backup/'+uuid+'/'+url).then(data=>{
			data = CryptoJS.AES.decrypt(data, pass, aesOption)
			try{
				data = CryptoJS.enc.Utf8.stringify(data)
				if(data == '') return toast('密码错误')
				data = JSON.parse(data)
			}catch(e){
				console.log(e.toString())
				return toast('密码错误')
			}
			this.baseSave('orders', data.orders)
			this.baseSave('goods', data.goods)
			this.baseSave('clients', data.clients)
			this.baseSave('priceBookMap', data.priceBookMap)
			for(let id in data.priceBooks){
				this.baseSave('priceBook' + id, data.priceBooks[id])
			}
			db.set('nextId', data.nextId)
			toast('恢复成功')
			// let ids = []
			// ids = ids.concat(data.orders.map(i=>i.id))
			// ids = ids.concat(data.goods.map(i=>i.id))
			// ids = ids.concat(data.clients.map(i=>i.id))
			// console.log(ids.length, [...new Set(ids)].length)
		})
	}
}
export default async function (method, data){
	return await new methods()[method](data)
}