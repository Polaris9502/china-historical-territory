// 天地图集成模块
import { ref } from 'vue'

// 天地图 Token 池
const TIANDITU_TK_POOL = [
	'0bd40ca92a8efe6560e3d6999c52557a',
	'5043b83cf417fb0ea7d26b5c8050af21',
	'c9a70dd1d69ebb0283c258e205aa8053',
	'f55f3d9dd8e0ce645a99b068725939d9',
	'ef0cdb6106f32cdb8587edda06148857',
]

// 使用普通变量而非 ref，避免循环依赖问题
let currentTokenIndex = 0
let currentTk = TIANDITU_TK_POOL[currentTokenIndex]
currentTokenIndex = (currentTokenIndex + 1) % TIANDITU_TK_POOL.length

// 获取下一个 Token（轮换）
function getNextToken() {
	const tk = TIANDITU_TK_POOL[currentTokenIndex]
	currentTokenIndex = (currentTokenIndex + 1) % TIANDITU_TK_POOL.length
	return tk
}

// 获取当前 Token
export function getCurrentToken() {
	return currentTk
}

// 切换到下一个 Token
export function switchToNextToken() {
	currentTk = getNextToken()
	console.log('天地图 Token 已切换:', currentTk.substring(0, 8) + '...')
	return currentTk
}

// 获取天地图底图 URL
export function getTiandituUrl(tk, layer = 'vec') {
	// 天地图墨卡托投影底图服务
	return `https://t0.tianditu.gov.cn/${layer}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${layer}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tk}`
}

// 获取天地图标注层 URL
export function getTiandituCvaUrl(tk) {
	return getTiandituUrl(tk, 'cva')
}

// 获取天地图影像底图 URL
export function getTiandituImgUrl(tk) {
	return getTiandituUrl(tk, 'img')
}

// 获取天地图影像标注 URL
export function getTiandituCiaUrl(tk) {
	return getTiandituUrl(tk, 'cia')
}

// 创建天地图图层配置
export function createTiandituLayers() {
	const tk = currentTk
	return {
		vec: {
			url: getTiandituUrl(tk, 'vec'),
			options: {
				maxZoom: 18,
				minZoom: 1,
				attribution: '&copy; 天地图',
			},
		},
		cva: {
			url: getTiandituCvaUrl(tk),
			options: {
				maxZoom: 18,
				minZoom: 1,
			},
		},
		img: {
			url: getTiandituImgUrl(tk),
			options: {
				maxZoom: 18,
				minZoom: 1,
				attribution: '&copy; 天地图影像',
			},
		},
		cia: {
			url: getTiandituCiaUrl(tk, 'cia'),
			options: {
				maxZoom: 18,
				minZoom: 1,
			},
		},
	}
}

// 中国区域范围
export const CHINA_BOUNDS = [
	[15, 73], // 西南角
	[54, 135], // 东北角
]

// 中国中心点
export const CHINA_CENTER = [35, 105]

// 默认缩放级别
export const DEFAULT_ZOOM = 4

// 组合式函数
export function useTianditu() {
	return {
		getCurrentToken,
		switchToNextToken,
		getTiandituUrl,
		getTiandituCvaUrl,
		getTiandituImgUrl,
		getTiandituCiaUrl,
		createTiandituLayers,
		CHINA_BOUNDS,
		CHINA_CENTER,
		DEFAULT_ZOOM,
	}
}
