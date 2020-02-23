const {
    GraphQLID,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
    GraphQLInterfaceType,
    GraphQLBoolean,
    GraphQLInputObjectType
} = require('graphql');
const SanitizeTemplateName = require('../helpers/SanitizeTemplateName');

const ItemUrlOptions = new GraphQLInputObjectType({
    name: 'ItemUrlOptions',
    fields: {
        alwaysIncludeServerUrl: { type: new GraphQLNonNull(GraphQLBoolean), defaultValue: null },
        siteName: { type: new GraphQLNonNull(GraphQLString), defaultValue: null },
        language: { type: new GraphQLNonNull(GraphQLString), defaultValue: null },
        disableLanguageEmbedding: { type: new GraphQLNonNull(GraphQLBoolean), defaultValue: null }
    }
});

const ItemType = (itemField) => {
    const itemType = new GraphQLInterfaceType({
        name: 'Item',
        fields: () => ({
            id: { type: GraphQLID },
            name: { type: GraphQLString },
            children: { type: new GraphQLList(itemType) },
            hasChildren: {
                type: GraphQLBoolean,
                resolve: (source) => {
                    return !!source.children;
                }
            },
            parent: { type: itemType },
            field: {
                type: itemField,
                args: {
                    name: { type: new GraphQLNonNull(GraphQLString) }
                },
                resolve: (source, { name }) => {
                    const field = source.fields.find(field => field.name === name);
                    return field;
                }
            },
            fields: { type: new GraphQLList(itemField) },
            url: {
                type: GraphQLString,
                args: {
                    options: { type: ItemUrlOptions, defaultValue: null }
                },
                resolve: (source) => {
                    return source.getUrl();
                }
            }
        }),
        resolveType: (value, context, info) => {
            const template = value.dataSourceTemplate || 'App Route';
            const sanitizedTemplate = SanitizeTemplateName(template);
            const templateType = info.schema.getType(sanitizedTemplate);
            return templateType;
        }
    })
    return itemType;
}

module.exports = ItemType;