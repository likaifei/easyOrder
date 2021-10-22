const CryptoJS = require('crypto-js')
const iv = CryptoJS.enc.Hex.parse('DEAD1151DEAD')
const aesOption = {iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7}
let [uuid] = process.argv.slice(2);
uuid = CryptoJS.enc.Utf8.parse(uuid.substr(4,8).padStart(8, '0'))
let cryptoText = CryptoJS.AES.encrypt('vip', uuid, aesOption).ciphertext.toString(CryptoJS.enc.Base64)
console.log(cryptoText)