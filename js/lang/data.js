let data = require('./formated.js')

let zhIndex = 0, enIndex = 1
function build(index){
	let r = {}
	for(let i in data){
		r[data[i][0]] = data[i][index]
	}
	return r
}

export const zh = build(zhIndex)
export const en = build(enIndex)