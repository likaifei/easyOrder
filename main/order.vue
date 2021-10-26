<template lang="pug">
	.p15
		confirm(ref="confirm")
		view.tc {{orderNumber}}({{$t(status)}})
		.flex.between
			view(@tap="openClient") {{client.id?client.clientName:$t('选客户')}}
			view(@tap="openGoods") {{$t('选商品')}}
		view.mt15
			view.item(v-for="item in goods" :key="item.id" @tap="openItem(item)")
				.flex.between
					view {{item.name}}
					view x{{item.number}}
				.flex.between
					view ¥{{item.price}}
					view ¥{{item.money}}
		view.bottom
		view.fix-bottom.flex.between.alcenter
			view.flex.column.ml15
				view {{$t('共')}} {{count}} {{$t('种商品')}}
				view {{$t('¥')}}{{total}}
			view.flex
				view.confirm-btn2.white.tc(@tap="clear") {{$t('清空')}}
				view.confirm-btn1.white.tc(@tap="save('print')") {{$t('保存并打印')}}
				view.confirm-btn.white.tc(@tap="save") {{$t('保存')}}
</template>

<script>
	import {page, toast} from '@/js/utils'
	import confirm from '@/components/popup/confirm'
	export default {
		components: {confirm},
		data(){
			return {
				id: '',
				goods: [],
				client: {},
				priceBook: {},
				orderNumber: '',
				status: '未发货',
				title: '开单'
			}
		},
		async onShow(){
			let data = page.getCloseData()
			if(data.type == 'client'){
				this.client = data.data
				this.priceBook = await this.api('getPriceBook', this.client)
				this.refreshPrice(true)
				let time = new Date()
				this.orderNumber = ((time.getMonth() + 1) / 100).toFixed(2).substr(2) + (time.getDate() / 100).toFixed(2).substr(2) + ' ' + this.client.clientName
			}else if(data.type == 'goods'){
				this.goods = data.data
				this.refreshPrice()
			}
			let order = page.getData()
			if(order){
				this.id = order.id
				this.goods = order.goods
				this.client = order.client
				this.orderNumber = order.orderNumber
				this.status = order.status
				this.priceBook = await this.api('getPriceBook', this.client)
			}
		},
		computed: {
			count(){
				return this.goods.length
			},
			total(){
				return this.goods.reduce((total, cur) => {
					return total + Number(cur.money)
				}, 0).toFixed(2)
			}
		},
		onLoad(){
			uni.setTabBarItem({
			  index: 0,
			  text: this.$t('开单'),
			})
			uni.setTabBarItem({
			  index: 1,
			  text: this.$t('订单'),
			})
			uni.setTabBarItem({
			  index: 2,
			  text: this.$t('设置'),
			})
		},
		methods: {
			openItem(item){
				this.currentItem = item
				this.$refs.confirm.open(this.$t('请输入单价'), item.price, this.changePrice)
			},
			changePrice(v){
				if(Number(v) != v)
					return toast(this.$t('请输入有效的数字'))
				this.currentItem.price = Number(v)
				this.currentItem.money = (this.currentItem.price * this.currentItem.number).toFixed(2)
			},
			openClient(){
				this.go('/pages/client')
			},
			openGoods(){
				this.openPage('/pages/goods', {goods: this.goods, client: this.client})
			},
			refreshPrice(focus = false){
				let book = this.priceBook
				for(let item of this.goods){
					if(!focus && item.money !== undefined) continue;
					if(book[item.id]){
						item.price = book[item.id]
					}
					item.money = (item.price * item.number).toFixed(2)
				}
			},
			async save(after){
				let {orderNumber, goods, client, status, id} = this
				if(this.goods.length == 0) return toast(this.$t('商品列表为空'))
				if(!this.client.id) return toast(this.$t('请选择客户'))
				await this.api('saveOrder', {orderNumber, goods, client, status, id})
				if(after == 'print'){
					uni.$emit('print', {orderNumber, goods, client, status, id})
				}
				this.clear()
			},
			clear(){
				this.orderNumber = ''
				this.client = {}
				this.priceBook = {}
				this.goods = []
				this.id = ''
				this.status = '未发货'
			}
		}
	}
</script>

<style scoped>
	.item{
		background: #fff;
		border-radius: 20upx;
		padding: 20upx;
		margin-bottom: 20upx;
	}
	.confirm-btn{
		background-color: rgb(41, 151, 253);
		width: 140upx;
		font-size: 30upx;
		line-height: 100upx;
	}
	.confirm-btn1{
		background-color: rgb(100, 151, 150);
		width: 200upx;
		font-size: 30upx;
		line-height: 100upx;
	}
	.confirm-btn2{
		background-color: rgb(155, 155, 155);
		width: 100upx;
		font-size: 30upx;
		line-height: 100upx;
	}
		
	.bottom{
		width: 100%;
		height: 100upx;
	}
	.fix-bottom{
		background: #fff;
		position: fixed;
		bottom: 0;
		/*#ifdef H5*/
		bottom: 100upx;
		/*#endif*/
		width: 100vw;
		left: 0;
		height: 100upx;
	}
</style>
