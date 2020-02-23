const {
    GraphQLObjectType,
    GraphQLList,
    GraphQLInt,
    GraphQLString
} = require('graphql');

const resolveItemIds = (source) => {
    var resolved = [];
    if (source.value) {
        source.value.forEach(item => {
            resolved.push(item.resolvedFromItemId);
        });
    }
    return resolved;
}

module.exports = ({baseField, itemType}) => {
    return new GraphQLObjectType({
        name: 'MultilistField',
        interfaces: [baseField],
        fields: () => {
            const fieldConfig = baseField.toConfig();
            const fields = {
                targetIds: {
                    type: new GraphQLList(GraphQLString),
                    resolve: (source) => {
                        const resolved = resolveItemIds(source);
                        return resolved;
                    }
                },
                targetItems: {
                    type: new GraphQLList(itemType),
                    resolve: (source) => {
                        return source.value;
                    }
                },
                count: {
                    type: GraphQLInt,
                    resolve: (source) => {
                        const resolved = resolveItemIds(source);
                        return resolved.length;
                    }
                },
                value: {
                    type: GraphQLString,
                    resolve: (source) => {
                        const resolved = resolveItemIds(source);
                        const joined = resolved.join('|');
                        return joined;
                    }
                }
            };
            return {... fieldConfig.fields, ...fields};
        }
    });
}