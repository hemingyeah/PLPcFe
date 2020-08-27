import { 
	CommonMappingEnum,
  CustomerFieldNameMappingEnum, 
  FieldTypeMappingEnum, 
  ProductFieldNameMappingEnum,
  TagEntityMappingEnum
} from './../model/enum/MappingEnum';

// 有重复的代码，后续优化

/**
 * @description 获取data对象的某个字段的string形式
 * 照搬的后端 base -> TaskService getFieldValue2string 方法
 * @param {Object} data
 * @param {string} fieldName
 * @param {string} formType
 * @param {Array} fields 字段列表
 * @return
*/
export function getFieldValue2string(data: any, fieldName: string, formType: string, fields = [], isCustomerRelation: Boolean): string {
	// 判断字段名称是否存在
	if (!fieldName) return '';
	// 是否是客户模块，暂时先这么判断
	let isCustomerModule: Boolean = isCustomerRelation;

  return (
		isCustomerModule
		? getCustomerFieldValue2string(data, fieldName, formType, fields) 
		: getProductFieldValue2string(data, fieldName, formType, fields)
	)
}

/**
 * @description 获取客户的某个字段的string形式
 * @param {Object} data 数据
 * @param {string} fieldName 字段名称
 * @param {string} formType 字段类型
 * @param {Array} fields 字段列表
 * @return
*/
function getCustomerFieldValue2string(data: any, fieldName: string, formType: string, fields = []): string {
	// 客户数据
	const Customer: any = data || {};
	// 返回结果
	let result: string = '';
	// 团队
	if (fieldName == CustomerFieldNameMappingEnum.Tags) {
		let tags = Customer[CustomerFieldNameMappingEnum.Tags] || [];
		result = tags.map((tag: any) => tag[TagEntityMappingEnum.TagName]).join(',');
	}
	// 编号
	else if (fieldName == CustomerFieldNameMappingEnum.SerialNumber) {
		result = Customer[CustomerFieldNameMappingEnum.SerialNumber] || '';
	}
	// 客户负责人
	else if (fieldName == CustomerFieldNameMappingEnum.CustomerManager) {
		result = Customer[CustomerFieldNameMappingEnum.CustomerManagerName] || '';
	}
	// 其他字段
	else {
		const Attribute: any = Customer[CommonMappingEnum.Attribute] || {};
		// 地址类型
		if (formType == FieldTypeMappingEnum.Address) {
			let addressData = Attribute[fieldName];
			result = addressData.all || '';
		}
		// 说明信息类型
		else if (formType == FieldTypeMappingEnum.Info) {
			let infoField: any = fields.filter((field: any) => field.fieldName == fieldName);
			result = infoField?.[0]?.placeholder || '';
		}
		// 位置类型
		else if (formType == FieldTypeMappingEnum.Location) {
			let locationData = Attribute[fieldName];
			result = locationData.address || '';
		}
		// 其他自定义字段
		else {
			let attributeValue =  Attribute[fieldName];
			let isStringArray = Array.isArray(attributeValue) && attributeValue.every(item => typeof item === 'string');
			result = isStringArray ? attributeValue.join(',') : attributeValue || '';
		}
	}

	return result;
}

/**
 * @description 获取产品的某个字段的string形式
 * @param {Object} data 数据
 * @param {string} fieldName 字段名称
 * @param {string} formType 字段类型
 * @param {Array} fields 字段列表
 * @return
*/
function getProductFieldValue2string(data: any, fieldName: string, formType: string, fields = []): string {
		// 产品数据
	const Product: any = data || {};
	// 返回结果
	let result: string = '';
	
	// 编号
	if (fieldName == ProductFieldNameMappingEnum.SerialNumber) {
		result = Product[ProductFieldNameMappingEnum.SerialNumber] || '';
	}
	// 产品类型
	else if (fieldName == ProductFieldNameMappingEnum.Type) {
		result = Product[ProductFieldNameMappingEnum.Type] || '';
	}
	// 其他字段
	else {
		const Attribute: any = Product[CommonMappingEnum.Attribute] || {};
		// 地址类型
		if (formType == FieldTypeMappingEnum.Address) {
			let addressData = Attribute[fieldName];
			result = addressData.all || '';
		}
		// 说明信息类型
		else if (formType == FieldTypeMappingEnum.Info) {
			let infoField: any = fields.filter((field: any) => field.fieldName == fieldName);
			result = infoField?.[0]?.placeholder || '';
		}
		// 位置类型
		else if (formType == FieldTypeMappingEnum.Location) {
			let locationData = Attribute[fieldName];
			result = locationData.address || '';
		}
		// 其他自定义字段
		else {
			let attributeValue =  Attribute[fieldName];
			let isStringArray = Array.isArray(attributeValue) && attributeValue.every(item => typeof item === 'string');
			result = isStringArray ? attributeValue.join(',') : attributeValue || '';
		}
	}
	
	return result;
}