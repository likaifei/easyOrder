<template lang="pug">
	.p15
		editGoods(ref="editGoods" @change="refreshList")
		confirm(ref="confirm")
		.flex.between
			input(:placeholder="$t('搜索')" v-model="search")
			view(@tap="addGoods") {{$t('添加')}}
		.flex.wrap.mt10
			.tag(v-for="item in groups" :key="item" 
			:class="group==item?'active':''" @tap="changeGroup(item)") {{item}}
		view.mt10.item(v-for="item in filtedGoods" :key="item.id" )
			.flex.between
				view(@tap="open(item)") {{item.name}}
				view ¥{{item.price}}
			.flex.between
				view {{item.group}}
				view.empty-btn.plr10.black(@tap="add(item)" v-if="!selected[item.id]") {{$t('选中')}}
				view.flex.alcenter(v-else)
					view.number-btn.flex.between
						view.number-dec.alcenter.jscenter.flex(@tap="dec(selected[item.id])")
							view.dec
						view.black(@tap="popup(selected[item.id])") {{selected[item.id].number}}
						view.number-inc.flex.alcenter(@tap="inc(selected[item.id])")
							view.inc1
							view.inc2
		view.bottom
		view.fix-bottom.flex.between
			view.ml15 {{$t('共')}} {{selectedCount}} {{$t('种商品')}}
			view.confirm-btn.white.tc(@tap="save") {{$t('确定')}}
</template>

<script>
	import editGoods from '@/components/popup/editGoods'
	import confirm from '@/components/popup/confirm'
	import {copy, toast, page} from '@/js/utils'
	
	export default {
		components: {editGoods, confirm},
		data(){
			return {
				goods: [],
				selected: {},
				currentItem: {},
				search: '',
				groups: [],
				group: '',
				clientPrice: '',
				title: '商品'
			}
		},
		onLoad(){
			let param = page.getData()
			this.refreshList()
			if(typeof param == 'object'){
				let map = {}
				for(let item of param.goods){
					map[item.id] = item
				}
				this.selected = map
				this.clientPrice = param.clientPrice
			}
		},
		computed: {
			selectedCount(){
				return Object.keys(this.selected).length
			},
			filtedGoods(){
				let group = this.group
				if(group == this.$t('仅选中'))
					return Object.values(this.selected)
				let search = this.search.trim()
				if(search.trim() == ''){
					if(group == '')
						return this.goods;
					if(group == this.$t('未分类'))
						group = ''
					return this.goods.filter(i=>i.group == group)
				}
				if(group == '')
					return this.goods.filter(i => i.name.indexOf(search) != -1);
				if(group == this.$t('未分类'))
					group = ''
				return this.goods.filter(i => i.name.indexOf(search) != -1 && i.group == group);
			}
		},
		methods: {
			async refreshList(){
				this.goods = await this.api('getGoods')
				this.groups = Array.from(new Set(this.goods.map(i=>i.group))).filter(i=>i!='')
				this.groups.push(this.$t('未分类'))
				this.groups.push(this.$t('仅选中'))
			},
			changeGroup(group){
				this.group = this.group == group?'':group
			},
			addGoods(){
				let item = {
					name: '',
					group: '',
					price: '',
					note: ''
				}
				this.$refs.editGoods.open(item)
			},
			open(item){
				this.$refs.editGoods.open(item)
			},
			popup(item){
				this.currentItem = item
				this.$refs.confirm.open(this.$t('请输入数量'), item.number, this.changeNumber)
			},
			inc(item){
				item.number ++
				this.refresh()
			},
			dec(item){
				item.number --
				if(item.number <= 0)
					this.$delete(this.selected, item.id)
				this.refresh()
			},
			add(item){
				item.number = 1
				this.$set(this.selected, item.id, copy(item))
				this.refresh()
			},
			refresh(){
				this.goods.splice(0, 0)
			},
			changeNumber(v){
				if(Number(v) != v)
					return toast(this.$t('请输入有效的数字'))
				this.currentItem.number = Number(v)
				this.refresh()
			},
			save(){
				this.closePage('goods', Object.values(this.selected))
			},
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
	.tag{
		margin: 4upx;
		border: 1px solid #fc0;
		padding: 4upx;
	}
	.active{
		
	}
	.tag.active{
		background: #ccc;
	}
	.tag.active::after{
		/* content: '1';
		position: absolute;
		margin-top: -15upx; */
	}
	.confirm-btn{
		background-color: rgb(41, 151, 253);
		width: 300upx;
		font-size: 40upx;
	}
	.bottom{
		width: 100%;
		height: 100upx;
	}
	.fix-bottom{
		background: #fff;
		position: fixed;
		bottom: 0;
		width: 100%;
		height: 100upx;
		line-height: 100upx;
	}
	.inc1{
		width: 25upx;
		height: 4upx;
		background-color: #fff;
		margin-left: 6upx;
	}
	.inc2{
		width: 4upx;
		height: 25upx;
		background-color: #fff;
		margin-left: -15upx;
	}
	.number-inc{
		width: 40upx;
		height: 40upx;
		line-height: 40upx;
		background-color: rgb(41, 151, 253);
		border: 1px solid rgb(41, 151, 253);
		border-radius: 40upx;
		border-right: none;
		margin-top: -1px;
	}
	.dec{
		width: 25upx;
		height: 4upx;
		background-color: rgb(41, 151, 253);
	}
	.number-dec{
		width: 40upx;
		height: 40upx;
		line-height: 40upx;
		color: rgb(41, 151, 253);
		border: 1px solid rgb(41, 151, 253);
		border-left: none;
		border-radius: 40upx;
		margin-top: -1px;
	}
	.number-btn{
		border: 1px solid rgb(41, 151, 253);
		border-radius: 40upx;
		height: 40upx;
		line-height: 40upx;
		width: 180upx;
		/* overflow: hidden; */
	}
	.empty-btn{
		border: 1px solid rgb(41, 151, 253);
		border-radius: 40upx;
		height: 40upx;
		line-height: 40upx;
	}
	.img-scan{
		background-image: url('@/static/image/new/scan.png');
		width: 44upx;
		height: 44upx;
	}
	.img-search{
		background-image: url('@/static/image/new/search.png');
		width: 32upx;
		height: 32upx;
	}
	.btn{
		width: 120upx;
	}
	.btn-long{
		width: 200upx;
	}
	.search{
		width: 230upx;
	}
	.img-printer{
		width: 50upx;
		height: 50upx;
		background-image: url('@/static/image/new/printer.png');
	}
</style>
