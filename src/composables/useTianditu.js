// 天地图集成模块
import { ref } from 'vue'

// 天地图 Token 池（按顺序轮换使用）
// 请通过 .env 文件配置：VITE_TIANDITU_TOKENS=token1,token2,token3
const envTokens = import.meta.env.VITE_TIANDITU_TOKENS
const TIANDITU_TK_POOL = envTokens
	? envTokens.split(',').map(t => t.trim()).filter(Boolean)
	: [
		// 占位符：您可以在 .env 文件中配置自己的 Token
		// 申请地址：https://console.tianditu.gov.cn/api/key
		'your-tianditu-token-here',
	]

if (TIANDITU_TK_POOL.length === 0 || TIANDITU_TK_POOL[0] === 'your-tianditu-token-here') {
	console.warn(
		'[天地图] 未配置 VITE_TIANDITU_TOKENS，将使用占位符 Token。\n' +
		'请在 .env 文件中添加：VITE_TIANDITU_TOKENS=token1,token2,...\n' +
		'项目会自动降级到 OpenStreetMap 底图。'
	)
}

// 使用普通变量而非 ref，避免循环依赖问题
let currentTokenIndex = 0
let currentTk = TIANDITU_TK_POOL[currentTokenIndex]
if (TIANDITU_TK_POOL.length > 0) {
	currentTokenIndex = (currentTokenIndex + 1) % TIANDITU_TK_POOL.length
}

// 获取下一个 Token（轮换）
function getNextToken() {
	if (TIANDITU_TK_POOL.length === 0) return ''
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
	if (currentTk && currentTk !== 'your-tianditu-token-here') {
		console.log('天地图 Token 已切换:', currentTk.substring(0, 8) + '...')
	}
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
			url: getTiandituImgUrl(tk, 'img'),
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