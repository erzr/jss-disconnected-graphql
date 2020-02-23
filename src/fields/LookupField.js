const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString
} = require('graphql');

module.exports = ({baseField}) => {
    return new GraphQLObjectType({
        name: 'LookupField',
        interfaces: [baseField],
        fields: () => {
            const fieldConfig = baseField.toConfig();
            const fields = {
                targetItem: { type: GraphQLString },
                targetId: {
                    type: GraphQLID,
                    args: {
                        format: { type: GraphQLString, defaultValue: 'N' }
                    },
                    resolve: (source) => {
                        if (source.value) {
                            return source.value.resolvedFromItemId;
                        }
                    }
                },
                value: {
                    type: GraphQLString,
                    resolve: (source) => {
                        if (source.value) {
                            return source.value.resolvedFromItemId;
                        }
                    }
                }
            };
            return {... fieldConfig.fields, ...fields};
        }
    });
}