const {
    GraphQLObjectType,
    GraphQLList,
    GraphQLInt
} = require('graphql');

module.exports = (paginationType) => {
    const typeName = paginationType.name;

    return new GraphQLObjectType({
        name: typeName + 'Results',
        fields: {
            items: {type: GraphQLList(paginationType) },
            start: {type: GraphQLInt },
            end: {type: GraphQLInt },
            total: {type: GraphQLInt }
        }
    });
}