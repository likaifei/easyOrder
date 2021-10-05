<template lang="pug">
	uniPopup(ref="popup")
		.container
			.flex.item.alcenter
				.label 商品名称
				input(v-model="item.name")
			.flex.item.alcenter
				.label 分组
				input(v-model="item.group")
			.flex.item.alcenter
				.label 默认价格
				input(v-model="item.price")
			.flex.item.alcenter
				.label 备注
				input(v-model="item.note")
			.flex.between.item.alcenter
				view
				view(@tap="save") 保存
</template>

<script>
	import uniPopup from '@/components/uni-popup/uni-popup.vue'
	import {copy, toast} from '@/js/utils'
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
				if(this.item.name == '') return toast('商品名称不能为空')
				let method = this.item.id?'updateGoods':'addGoods'
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
