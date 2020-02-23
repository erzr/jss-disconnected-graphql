const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt
} = require('graphql');

module.exports = ({baseField}) => {
    return new GraphQLObjectType({
        name: 'ImageField',
        interfaces: [baseField],
        fields: () => {
            const fieldConfig = baseField.toConfig();
            const fields = {
                src: {
                    type: GraphQLString,
                    args: {
                        maxWidth: { type: GraphQLString },
                        maxHeight: { type: GraphQLInt }
                    },
                    resolve: (source) => {
                        return source.value.src;
                    }
                },
                alt: {
                    type: GraphQLString,
                    resolve: (source) => {
                        return source.value.alt;
                    }
                },
                width: {
                    type: GraphQLString,
                    resolve: (source) => {
                        return source.value.width;
                    }
                },
                height: {
                    type: GraphQLString,
                    resolve: (source) => {
                        return source.value.height;
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