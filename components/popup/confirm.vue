<template lang="pug">
	uniPopup(ref="popup")
		view.p15.card
			view.title.w100.tc.bold {{title}}
			view.grey-container.alcenter.mt10
				input.ml10.tc.input(v-model="value" focus)
			view.flex.around.mt10
				view.btn.bggrey.black.bold.tc.h29.ft12(@tap="close") {{$t('取消')}}
				view.btn.bgblue.white.bold.tc.h29.ft12(@tap="confirm") {{$t('确定')}}
</template>

<script>
	import uniPopup from '@/components/uni-popup/uni-popup'
	export default{
		components: {uniPopup},
		data(){
			return {
				value: '',
				title: '',
				cb: null
			}
		},
		methods: {
			open(title, value = '', cb = null){
				this.title = title
				this.value = value
				this.cb = cb
				this.$refs.popup.open()
			},
			close(){
				this.$refs.popup.close()
			},
			confirm(){
				// this.$emit('confirm', this.value)
				if(this.cb)
					this.cb(this.value);
				this.close()
			}
		}
	}
</script>

<style scoped>
	.card{
		border-radius: 10upx;
		background-color: white;
	}
	.btn{
		width: 100upx;
		border-radius: 10upx;
	}
	.input{
		height: 58upx;
		line-height: 58upx;
	}
</style>
