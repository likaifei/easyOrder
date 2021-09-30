<template lang="pug">
	.p15
		input(placeholder="搜索(只保留最近1000条订单)" v-model="search")
		.mt15
			.flex.between.item(v-for="(item, index) in filted" :key="index"
			:class="item.status=='已发货'?'opacity':''")
				view.flex
					view.blue(@tap="changeStatus(item)") {{item.status}}
					view.ml15 {{item.orderNumber}}
				.flex.blue
					view(@tap="print(item)") 打印
					view.ml15(@tap="view(item)") 查看
</template>

<script>
	export default {
		data(){
			return {
				orders: [],
				search: ''
			}
		},
		onShow(){
			this.refresh()
		},
		computed: {
			sorted(){
				return this.orders.reverse().sort((a, b) => a.status < b.status)
			},
			filted(){
				return this.sorted.filter(i=>i.orderNumber.indexOf(this.search) != -1)
			}
		},
		methods: {
			refresh(){
				this.orders = []
				this.orders = this.api('getOrders')
			},
			changeStatus(item){
				item.status = item.status == '未发货'? '已发货': '未发货'
				this.api('saveOrder', item)
			},
			view(item){
				this.openPage('/main/order', item)
			},
			print(item){
				uni.$emit('print', item)
			}
		}
	}
</script>

<style scoped>
	.opacity{
		opacity: 0.5;
	}
	.item{
		background: #fff;
		border-radius: 20upx;
		padding: 20upx;
		margin-bottom: 20upx;
	}
</style>
