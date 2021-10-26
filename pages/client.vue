<template lang="pug">
	view.p15
		editClient(ref="editClient" @change="refresh")
		.flex.between
			input(:placeholder="$t('搜索')" v-model="search")
			view(@tap="add") {{$t('添加')}}
		.mt15
			.flex.between.item(v-for="item in filted" :key="item.id"
				@longpress="open(item)" @tap="select(item)")
				view {{item.clientName}}
				view {{item.clientPhone}}
</template>

<script>
	import editClient from '@/components/popup/editClient'
	
	export default {
		components: {editClient},
		data(){
			return {
				clients: [],
				search: '',
				title: '客户'
			}
		},
		computed: {
			filted(){
				let search = this.search.trim()
				if(search == '') return this.clients.reverse()
				return this.clients.filter(i => i.clientName.indexOf(search) != -1 || i.clientPhone.indexOf(search) != -1)
			}
		},
		onLoad(){
			this.refresh()
		},
		methods: {
			async refresh(){
				this.clients = await this.api('getClients')
			},
			open(item){
				this.$refs.editClient.open(item)
			},
			add(){
				let item = {
					clientName: '',
					clientPhone: '',
					clientAddr: '',
					note: ''
				}
				this.$refs.editClient.open(item)
			},
			select(item){
				this.closePage('client', item)
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
</style>
