// let online = 'https://web.ahruanyi.com/glass';
let online = 'http://ry.ahruanyi.com';
export default {
	host: process.env.NODE_ENV == 'development'?'http://glass.127.com/':online,
	// host: online,
	apiPrefix: '/public/index.php/',
	imgPrefix: '/public/uploads/',
	defLogo: '/public/static/logo.png',
	imgHost: 'http://ry-img.nos-eastchina1.126.net/'
}