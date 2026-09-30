// 中国省份编码映射
export const PROVINCE_CODES = {
	beijing: { code: 110000, name: '北京市', center: [116.4, 39.9] },
	tianjin: { code: 120000, name: '天津市', center: [117.2, 39.1] },
	hebei: { code: 130000, name: '河北省', center: [114.5, 38.0] },
	shanxi: { code: 140000, name: '山西省', center: [112.5, 37.9] },
	neimenggu: { code: 150000, name: '内蒙古', center: [111.7, 40.8] },
	liaoning: { code: 210000, name: '辽宁省', center: [123.4, 41.8] },
	jilin: { code: 220000, name: '吉林省', center: [125.3, 43.9] },
	heilongjiang: { code: 230000, name: '黑龙江省', center: [126.6, 45.8] },
	shanghai: { code: 310000, name: '上海市', center: [121.5, 31.2] },
	jiangsu: { code: 320000, name: '江苏省', center: [118.8, 32.0] },
	zhejiang: { code: 330000, name: '浙江省', center: [120.2, 30.3] },
	anhui: { code: 340000, name: '安徽省', center: [117.3, 31.8] },
	fujian: { code: 350000, name: '福建省', center: [119.3, 26.1] },
	jiangxi: { code: 360000, name: '江西省', center: [115.9, 28.7] },
	shandong: { code: 370000, name: '山东省', center: [117.0, 36.7] },
	henan: { code: 410000, name: '河南省', center: [113.6, 34.7] },
	hubei: { code: 420000, name: '湖北省', center: [114.3, 30.6] },
	hunan: { code: 430000, name: '湖南省', center: [112.9, 28.2] },
	guangdong: { code: 440000, name: '广东省', center: [113.3, 23.1] },
	guangxi: { code: 450000, name: '广西', center: [108.4, 22.8] },
	hainan: { code: 460000, name: '海南省', center: [110.3, 20.0] },
	chongqing: { code: 500000, name: '重庆市', center: [106.5, 29.6] },
	sichuan: { code: 510000, name: '四川省', center: [104.1, 30.7] },
	guizhou: { code: 520000, name: '贵州省', center: [106.7, 26.6] },
	yunnan: { code: 530000, name: '云南省', center: [102.7, 25.0] },
	xizang: { code: 540000, name: '西藏', center: [91.1, 29.6] },
	shaanxi: { code: 610000, name: '陕西省', center: [108.9, 34.3] },
	gansu: { code: 620000, name: '甘肃省', center: [103.8, 36.1] },
	qinghai: { code: 630000, name: '青海省', center: [101.8, 36.6] },
	ningxia: { code: 640000, name: '宁夏', center: [106.3, 38.5] },
	xinjiang: { code: 650000, name: '新疆', center: [87.6, 43.8] },
	taiwan: { code: 710000, name: '台湾', center: [121.5, 25.0] },
	hongkong: { code: 810000, name: '香港', center: [114.2, 22.3] },
	aomen: { code: 820000, name: '澳门', center: [113.5, 22.2] },
}

// 按编码获取省份名称
export function getProvinceName(code) {
	for (const key in PROVINCE_CODES) {
		if (PROVINCE_CODES[key].code === code) {
			return PROVINCE_CODES[key].name
		}
	}
	return '未知'
}

// 加载省份 GeoJSON
export async function loadProvinceGeoJSON() {
	try {
		const response = await fetch('/data/china_provinces.json')
		return await response.json()
	} catch (error) {
		console.error('加载省份数据失败:', error)
		return null
	}
}

// 缓存已加载的数据
let provinceDataCache = null

// 根据省份code列表获取对应的GeoJSON Feature
export async function getProvinceFeatures(codes) {
	if (!provinceDataCache) {
		provinceDataCache = await loadProvinceGeoJSON()
	}
	if (!provinceDataCache) return []

	const features = []
	provinceDataCache.features.forEach((feature) => {
		if (codes.includes(feature.properties.adcode)) {
			features.push(feature)
		}
	})
	return features
}
