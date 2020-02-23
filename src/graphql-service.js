const graphqlHTTP = require('express-graphql');
const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql');

const BuildMockTree = require('./helpers/BuildMockTree');
const ResolveItem = require('./helpers/ResolveItem');
const MergeOptions = require('./helpers/MergeOptions');
const BuildSchemaFromManifest = require('./helpers/BuildSchemaFromManifest');
const Context = require('./context');

const createGraphQLService = (options) => {
    const builtOptions = MergeOptions(options);
    const context = new Context(builtOptions);

    const queryType = new GraphQLObjectType({
        name: 'Query',
        fields: {
            datasource: {
                type: context.getItemType(),
                args: {
                    value: { type: GraphQLNonNull(GraphQLString) }
                },
            },
            item: {
                type: context.getItemType(),
                args: {
                    path: { type: GraphQLString, defaultValue: null },
                    language: { type: GraphQLString, defaultValue: null },
                    version: { type: GraphQLInt, defaultValue: null }
                },
            }
        },
    });

    const updateManifest = (manifest) => {
        const convertedManifest = BuildMockTree(manifest, manifest.appName);
        const schema = BuildSchemaFromManifest(context, queryType, convertedManifest.templates);
        const tree = convertedManifest.tree;

        context.setSchema(schema);
        context.setTree(tree);
    }

    var root = {
        datasource: (args) => {
            const foundNode = ResolveItem(context, args.value || '/');
            return foundNode;
        },
        item: (args) => {
            const foundNode = ResolveItem(context, args.path || '/');
            return foundNode;
        }
    };

    if (options && options.manifest) {
        updateManifest(options.manifest);
    }

    return {
        updateManifest,
        middleware: graphqlHTTP({
            schema: context.schema,
            rootValue: root,
            graphiql: true,
        })
    }

}

module.exports = {
    createGraphQLService
}