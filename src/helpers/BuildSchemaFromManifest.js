const {
    GraphQLSchema
} = require('graphql');
const BuildTemplateTypes = require('./BuildTemplateTypes');

module.exports = (context, queryType, templates) => {
    const mappedTemplates = BuildTemplateTypes(context, templates);
    return new GraphQLSchema({
        query: queryType,
        types: [...mappedTemplates, ...context.options.fieldTypes]
    });
}