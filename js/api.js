import {db, toast} from './utils'

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
	saveOrder(order){
		let priceBook = this.getPriceBook(order.client)
		for(let item of order.goods){
			priceBook[item.id] = item.price
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
	
}
export default function (method, data){
	return new methods()[method](data)
}