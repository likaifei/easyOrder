import {db, toast} from './utils'
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
	baseGetList(key){
		return db.get(key, [])
	}
	baseSave(key, clients){
		db.set(key, clients)
	}
	getClients(){
		return this.baseGetList('clients')
	}
	baseAddList(key, data){
		data.id = nextId()
		let list = this.baseGetList(key)
		list.push(data)
		this.baseSave(key, list)
		return list
	}
	baseUpdate(key, data){
		let list = this.baseGetList(key)
		let found = list.filter(i => i.id == data.id)
		if(found.length==0) return toast('更新失败')
		let index = list.indexOf(found[0])
		list[index] = data
		this.baseSave(key, list)
	}
	addClient(data){
		this.baseAddList('clients', data)
	}
	updateClient(data){
		this.baseUpdate('clients', data)
	}
	getGoods(){
		return this.baseGetList('goods')
	}
	addGoods(data){
		this.baseAddList('goods', data)
	}
	updateGoods(data){
		this.baseUpdate('goods', data)
	}
	getPriceBook(client){
		return db.get('priceBook' + client.id, {})
	}
	getPriceBookMap(){
		return db.get('priceBookMap', [])
	}
	saveOrder(order){
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
	getOrders(){
		return this.baseGetList('orders')
	}
	backup(){
		let priceBookMap = this.getPriceBookMap()
		let priceBooks = {}
		for(let id in priceBookMap){
			priceBooks[id] = this.getPriceBook({id})
		}
		let data = {
			goods: this.getGoods(),
			orders: this.getOrders(),
			clients: this.getClients(),
			priceBookMap,
			priceBooks
		}
		return request('e.php', data)
	}
	getBackups(){
		return request('g.php')
	}
	recover(url){
		console.log(url)
		request('backup/'+url).then(data=>{
			console.log(data)
			this.baseSave('orders', data.orders)
			this.baseSave('goods', data.goods)
			this.baseSave('clients', data.clients)
			this.baseSave('priceBookMap', data.priceBookMap)
			for(let id in data.priceBooks){
				this.baseSave('priceBook' + id, data.priceBooks[id])
			}
			toast('恢复成功')
		})
	}
}
export default function (method, data){
	return new methods()[method](data)
}