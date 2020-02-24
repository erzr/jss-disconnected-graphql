const {
    GraphQLString,
    GraphQLNonNull,
    GraphQLInterfaceType,
    GraphQLBoolean,
    GraphQLID,
    GraphQLInt,
    GraphQLObjectType
} = require('graphql');
const { GraphQLJSON, GraphQLJSONObject } = require('graphql-type-json');
const { CommonFieldTypes } = require('@sitecore-jss/sitecore-jss-manifest');

const getFieldMapping = () => {
    const mapping = {};
    mapping[CommonFieldTypes.SingleLineText] = 'TextField';
    mapping[CommonFieldTypes.MultiLineText] = 'TextField';
    mapping[CommonFieldTypes.RichText] = 'TextField';
    mapping[CommonFieldTypes.ContentList] = 'MultilistField';
    mapping[CommonFieldTypes.ItemLink] = 'ReferenceField';
    mapping[CommonFieldTypes.GeneralLink] = 'LinkField';
    mapping[CommonFieldTypes.Image] = 'ImageField';
    mapping[CommonFieldTypes.Number] = 'NumberField';
    mapping[CommonFieldTypes.Checkbox] = 'CheckboxField';
    mapping[CommonFieldTypes.Date] = 'DateField';
    mapping[CommonFieldTypes.DateTime] = 'DateField';
    mapping[CommonFieldTypes.File] = 'FileField';
    return mapping;
}

const ItemField = new GraphQLInterfaceType({
    name: 'ItemField',
    fields: () => AddItemFieldFields(),
    resolveType: (source, context, info) => {
        const { templateField } = source;
        const mapping = getFieldMapping();
        const mappedField = mapping[templateField.type];
        const mappedType = info.schema.getType(mappedField);
        return mappedType;
    }
});

const ItemTemplateField = new GraphQLObjectType({
    name: 'ItemTemplateField',
    fields: {
        id: {
            type: GraphQLID,
            args: {
                format: { type: GraphQLString, defaultValue: "N" }
            }
        },
        name: { type: new GraphQLNonNull(GraphQLString) },
        section: { type: new GraphQLNonNull(GraphQLString) },
        sectionSortOrder: { type: new GraphQLNonNull(GraphQLInt) },
        shared: { type: new GraphQLNonNull(GraphQLBoolean) },
        sortOrder: { type: new GraphQLNonNull(GraphQLInt) },
        source: { type: new GraphQLNonNull(GraphQLString) },
        title: { type: new GraphQLNonNull(GraphQLString) },
        type: { type: new GraphQLNonNull(GraphQLString) },
        unversioned: { type: new GraphQLNonNull(GraphQLBoolean) }
    }
});

const AddItemFieldFields = function (additionalFields) {
    const fields = {
        name: { type: new GraphQLNonNull(GraphQLString) },
        jss: { type: GraphQLJSON },
        definition: { type: ItemTemplateField },
        displayName: {
            type: new GraphQLNonNull(GraphQLString),
            resolve: (source) => {
                const { templateField } = source;
                return (templateField && templateField.displayName) || source.name;
            }
        },
        value: { type: GraphQLString },
        rendered: {
            type: GraphQLString,
            resolve: (source) => {
                return source.value;
            }
        },
        editable: {
            type: GraphQLString,
            resolve: (source) => {
                return source.value;
            }
        },
        canWrite: {
            type: GraphQLBoolean,
            resolve: () => {
                return false;
            }
        },
        containsStandardValue: {
            type: GraphQLBoolean,
            resolve: () => {
                return false;
            }
        },
        containsFallbackValue: {
            type: GraphQLBoolean,
            resolve: () => {
                return false;
            }
        },
        containsInheritedValue: {
            type: GraphQLBoolean,
            resolve: () => {
                return false;
            }
        }
    };

    if (additionalFields) {
        return { ...fields, ...additionalFields };
    }

    return fields;
}

module.exports = () => ItemField;