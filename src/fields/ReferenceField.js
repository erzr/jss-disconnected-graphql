const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLID
} = require('graphql');

module.exports = ({baseField, itemType}) => {
    return new GraphQLObjectType({
        name: 'ReferenceField',
        interfaces: [baseField],
        fields: () => {
            const fieldConfig = baseField.toConfig();
            const fields = {
                targetItem: {
                    type: itemType,
                    resolve: (source) => {
                        return source.value;
                    }
                },
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