export const toast = function(text) {
	uni.showToast({
		title: text,
		icon: 'none'
	});
}
export const confirm = function(title, content) {
	return new Promise((success, fail) => {
		uni.showModal({
			title,
			content,
			success(res) {
				if (res.confirm)
					success()
				else if (res.cancel)
					fail()
			},
			fail
		});
	})
}

export const confirmCode = function(title, content) {
	return new Promise((success, fail) => {
		let arr = [content, '请谨慎操作', '确认删除']
		uni.showActionSheet({
		    itemList: arr,
		    success: function (res) {
		        if(res.tapIndex == 2)
							success()
						else
							fail()
		    },
		    fail: function (res) {
		        fail()
		    }
		});
		
	})
}


export const uuid = function() {
	function S4() {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	}
	return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

export const db = {
	get: function(k, def = '') {
		let result = uni.getStorageSync(k)
		if (result === '') result = def;
		return result
	},
	set: function(k, v) {
		return uni.setStorageSync(k, v)
	}
}

export const copy = function(v){
	return JSON.parse(JSON.stringify(v))
}

export const page = {
	open(url, data) {
		db.set('pageData', data)
		db.set('closeData', '')
		if (url.indexOf('main') != -1)
			return uni.switchTab({
				url
			})
		uni.navigateTo({
			url
		})
	},
	close(type, data) {
		db.set('closeData', {type, data})
		uni.navigateBack()
	},
	getData() {
		let result = db.get('pageData')
		db.set('pageData')
		return result;
	},
	getCloseData() {
		let result = db.get('closeData')
		db.set('closeData', '')
		return result;
	}
}

export const searchRefs = function(vm, ref) {
	let p = vm
	if (p.$refs[ref]) return p.$refs[ref]
	while (p = p.$parent) {
		if (p.$refs[ref]) return p.$refs[ref]
	}
}

export const isNumber = function(v) {
	if (v === '') return false;
	let obj = Number(v)
	return typeof obj === 'number' && !isNaN(obj)
}

export const update = function(data, showInfo) {
	uni.showLoading({
		title: '更新中',
		mask: true
	});
	if (data.hot) {
		uni.downloadFile({
			url: data.hot.url,
			success: (downloadResult) => {
				if (downloadResult.statusCode === 200) {
					plus.runtime.install(downloadResult.tempFilePath, {
						force: true
					}, function() {
						uni.hideLoading();
						plus.runtime.restart();
					}, function(e) {
						uni.hideLoading();
						toast('更新失败')
					});
				}
			}
		});
	} else if(data.url){
		plus.runtime.openURL(data.url);
	}else {
		uni.hideLoading()
		if(showInfo)toast('该版本为最新版本');
	}
}

export const getListSum = function(list, key){
	let t = 0
	for(let item of list){
		let n = Number(item[key])
		if(isNaN(n))
			n = 0;
		t += n;
	}
	return t
}