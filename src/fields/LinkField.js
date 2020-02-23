const {
    GraphQLObjectType,
    GraphQLString
} = require('graphql');

module.exports = ({baseField}) => {
    return new GraphQLObjectType({
        name: 'LinkField',
        interfaces: [baseField],
        fields: () => {
            const fieldConfig = baseField.toConfig();
            const fields = {
                url: {
                    type: GraphQLString,
                    resove: (source) => {
                        if (source.value) {
                            return source.value.href;
                        }
                    }
                },
                queryString: {
                    type: GraphQLString,
                    resove: (source) => {
                        if (source.value) {
                            return source.value.queryString;
                        }
                    }
                },
                className: {
                    type: GraphQLString,
                    resove: (source) => {
                        if (source.value) {
                            return source.value.className;
                        }
                    }
                },
                targetItem: { type: GraphQLString },
                text: {
                    type: GraphQLString,
                    resove: (source) => {
                        if (source.value) {
                            return source.value.text;
                        }
                    }
                },
                target: {
                    type: GraphQLString,
                    resove: (source) => {
                        if (source.value) {
                            return source.value.target;
                        }
                    }
                },
                linkType: { type: GraphQLString },
                url: {
                    type: GraphQLString,
                    resove: (source) => {
                        if (source.value) {
                            return source.value.href;
                        }
                    }
                },
                value: {
                    type: GraphQLString,
                    resolve: (source) => {
                        if (source.value) {
                            return source.value.href;
                        }
                    }
                }
            };
            return {... fieldConfig.fields, ...fields};
        }
    });
}