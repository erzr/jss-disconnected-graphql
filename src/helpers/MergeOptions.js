const { CommonFieldTypes } = require('@sitecore-jss/sitecore-jss-manifest');
const {fieldTypeInitializers} = require('../fields');
const {typeInitializers} = require('../objects');

const initializeBaseFieldType = (options) => {
    const itemFieldTypeInitializer = options.fieldTypeInitializers[options.itemFieldTypeName];

    if (!itemFieldTypeInitializer) {
        throw `Unable to locate field type: ${options.itemFieldTypeName}`;
    }

    const itemFieldType = itemFieldTypeInitializer();

    return itemFieldType;
}

const initializeFieldTypes = (options) => {
    const itemFieldTypes = [options.baseFieldType];

    Object.keys(fieldTypeInitializers).forEach(fieldName => {
        if (fieldName !== options.itemFieldTypeName) {
            const fieldInitializer = options.fieldTypeInitializers[fieldName];

            const fieldType = fieldInitializer({itemType: options.baseItemType, baseField: options.baseFieldType});

            if (fieldType) {
                itemFieldTypes.push(fieldType);
            }
        }
    });

    return itemFieldTypes;
}

const initializeItemType = (options) => {
    if (!options.baseFieldType) {
        throw 'baseFieldType expected.';
    }

    const typeInitializer = options.typeInitializers[options.itemTypeName];

    if (!typeInitializer) {
        throw `Unable to locate type: ${options.itemTypeName}`;
    }

    const itemType = typeInitializer(options.baseFieldType);

    return itemType;
};

const resolveFieldMapping = (options, mappingName) => {
    const mapping = options.fieldTypes.find(fieldType => fieldType.name === mappingName);
    return mapping;
};

const buildFieldMapping = (options) => {
    const mapping = {};
    mapping[CommonFieldTypes.SingleLineText] = resolveFieldMapping(options, 'TextField');
    mapping[CommonFieldTypes.MultiLineText] = resolveFieldMapping(options, 'TextField');
    mapping[CommonFieldTypes.RichText] = resolveFieldMapping(options, 'TextField');
    mapping[CommonFieldTypes.ContentList] = resolveFieldMapping(options, 'MultilistField');
    mapping[CommonFieldTypes.ItemLink] = resolveFieldMapping(options, 'ReferenceField');
    mapping[CommonFieldTypes.GeneralLink] = resolveFieldMapping(options, 'LinkField');
    mapping[CommonFieldTypes.Image] = resolveFieldMapping(options, 'ImageField');
    mapping[CommonFieldTypes.Number] = resolveFieldMapping(options, 'NumberField');
    mapping[CommonFieldTypes.Checkbox] = resolveFieldMapping(options, 'CheckboxField');
    mapping[CommonFieldTypes.Date] = resolveFieldMapping(options, 'DateField');
    mapping[CommonFieldTypes.DateTime] = resolveFieldMapping(options, 'DateField');
    mapping[CommonFieldTypes.File] = resolveFieldMapping(options, 'FileField');
    return mapping;
}

module.exports = (options) => {
    const mergedOptions = {
        itemTypeName: options.itemTypeName || 'ItemType',
        itemFieldTypeName: options.itemFieldTypeName || 'ItemField',
        fieldTypeInitializers: { ...fieldTypeInitializers, ...(options.fieldTypeInitializers || {}) },
        typeInitializers: { ...typeInitializers, ...(options.typeInitializers || {}) }
    };

    mergedOptions.baseFieldType = initializeBaseFieldType(mergedOptions);
    mergedOptions.baseItemType = initializeItemType(mergedOptions);
    mergedOptions.fieldTypes = initializeFieldTypes(mergedOptions);
    mergedOptions.fieldMapping = buildFieldMapping(mergedOptions);

    return mergedOptions;
};