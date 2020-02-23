const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt
} = require('graphql');

module.exports = ({baseField}) => {
    return new GraphQLObjectType({
        name: 'FileField',
        interfaces: [baseField],
        fields: () => {
            const fieldConfig = baseField.toConfig();
            const fields = {
                url: {
                    type: GraphQLString,
                    resolve: (source) => {
                        return source.value.src;
                    }
                },
                title: {
                    type: GraphQLString,
                    resolve: (source) => {
                        return source.value.title;
                    }
                },
                keywords: {
                    type: GraphQLString,
                    resolve: (source) => {
                        return source.value.keywords;
                    }
                },
                description: {
                    type: GraphQLString,
                    resolve: (source) => {
                        return source.value.description;
                    }
                },
                extension: {
                    type: GraphQLString,
                    resolve: (source) => {
                        return source.value.extension;
                    }
                },
                mimeType: {
                    type: GraphQLString,
                    resolve: (source) => {
                        return source.value.mimeType;
                    }
                },
                size: {
                    type: GraphQLInt,
                    resolve: () => {
                        return 42;
                    }
                },
                value: {
                    type: GraphQLString,
                    resolve: (source) => {
                        return source.value.src;
                    }
                }
            };
            return {... fieldConfig.fields, ...fields};
        }
    });
}