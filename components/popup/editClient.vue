<template lang="pug">
	uniPopup(ref="popup")
		.container
			.flex.item.alcenter
				.label 客户
				input(v-model="item.clientName")
			.flex.item.alcenter
				.label 地址
				input(v-model="item.clientAddr")
			.flex.item.alcenter
				.label 电话
				input(v-model="item.clientPhone")
			.flex.item.alcenter
				.label 备注
				input(v-model="item.note")
			.flex.between.item.alcenter
				view
				view(@tap="save") 保存
</template>

<script>
	import uniPopup from '@/components/uni-popup/uni-popup.vue'
	import {copy} from '@/js/utils'
	export default {
		components: {uniPopup},
		data(){
			return {
				item: {}
			}
		},
		methods: {
			open(data){				
				this.item = copy(data)
				this.$refs.popup.open()
			},
			close(){
				this.$refs.popup.close()
			},
			save(){
				let method = this.item.id?'updateClient':'addClient'
				this.api(method, this.item)
				this.close()
				this.$emit('change')
			}
		}
	}
</script>

<style scoped>
	.container{
		background: #fff;
		border-radius: 20upx;
		padding: 20upx;
	}
	.label{
		width: 200upx;
	}
	.item{
		border-bottom: 1px solid #ccc;
		height: 80upx;
	}
</style>
