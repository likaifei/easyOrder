<template lang="pug">
	.p15
		input(placeholder="搜索" v-model="search" @confirm="getData(1)")
		.mt15
			.flex.between.item(v-for="(item, index) in orders" :key="index"
			:class="item.status=='已发货'?'opacity':''")
				view.flex
					view.blue(@tap="changeStatus(item)") {{item.status?item.status:'?'}}
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
				search: '',
				page: 1,
				finished: false
			}
		},
		onShow(){
			this.getData(1)
		},
		methods: {
			async getData(pg){
				if(pg){
					this.page = pg
				}
				if(pg == 1){
					this.orders = []
					this.finished = false
				}
				if(this.finished) return;
				let result = await this.api('getOrders', {search: this.search, page: this.page})
				this.orders = this.orders.concat(result.data)
				if(!result.next_page_url)
					this.finished = true;
				this.page ++
			},
			async changeStatus(item){
				item.status = item.status == '未发货'? '已发货': '未发货'
				await this.api('saveOrder', item)
			},
			view(item){
				this.openPage('/main/order', item)
			},
			print(item){
				uni.$emit('print', item)
			},
			
			handlePullRefresh(){
				setTimeout(function () {
					uni.stopPullDownRefresh();
				}, 1000);
				this.getData(1);
			},
			handleReachBottom(){
				this.getData();
			}
		},
		onPullDownRefresh(){
			this.handlePullRefresh()
		},
		onReachBottom(){
			this.handleReachBottom()
		},
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
