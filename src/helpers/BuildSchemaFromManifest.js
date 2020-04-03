const {
    GraphQLSchema
} = require('graphql');

module.exports = (context, queryType, mappedTemplates) => {
    return new GraphQLSchema({
        query: queryType,
        types: [...mappedTemplates, ...context.options.fieldTypes]
    });
}