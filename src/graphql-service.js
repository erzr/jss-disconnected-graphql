const graphqlHTTP = require('express-graphql');
const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql');

const BuildMockTree = require('./helpers/BuildMockTree');
const ResolveItem = require('./helpers/ResolveItem');
const ResolveItemsByTemplate = require('./helpers/ResolveItemsByTemplate');
const MergeOptions = require('./helpers/MergeOptions');
const BuildSchemaFromManifest = require('./helpers/BuildSchemaFromManifest');
const SanitizeTemplateName = require('./helpers/SanitizeTemplateName');
const BuildTemplateTypes = require('./helpers/BuildTemplateTypes');
const Context = require('./context');
const PaginationType = require('./objects/PaginationType');

const createGraphQLService = (options) => {
    const builtOptions = MergeOptions(options);
    const context = new Context(builtOptions);

    const fieldTypes = {
        datasource: {
            type: context.getItemType(),
            args: {
                value: { type: GraphQLNonNull(GraphQLString) }
            }
        },
        item: {
            type: context.getItemType(),
            args: {
                path: { type: GraphQLString, defaultValue: null },
                language: { type: GraphQLString, defaultValue: null },
                version: { type: GraphQLInt, defaultValue: null }
            }
        }
    };

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

    const queryType = new GraphQLObjectType({
        name: 'Query',
        fields: fieldTypes
    });

    const updateManifest = (manifest) => {
        const convertedManifest = BuildMockTree(manifest, manifest.appName);
        const mappedTemplates = BuildTemplateTypes(context, convertedManifest.templates);

        if (!options.doNotGenerateTemplateFields) {
            Object.keys(convertedManifest.templates).forEach(templateName => {
                const sanitizedTemplateName = SanitizeTemplateName(templateName);
                const pluralTemplateName = sanitizedTemplateName + 's';
                const pluralTemplateNameLowercase = pluralTemplateName.toLowerCase();
                const resolvedType = mappedTemplates.find(type => type.name === sanitizedTemplateName);
                const paginationType = PaginationType(resolvedType);
                
                fieldTypes[pluralTemplateNameLowercase] = {
                    type: paginationType,
                    args: {
                        start: { type: GraphQLInt, defaultValue: 0 },
                        count: { type: GraphQLInt, defaultValue: null }
                    }
                };

                root[pluralTemplateNameLowercase] = ((templateName) => {
                    return (args) => {
                        let foundNodes = ResolveItemsByTemplate(context.tree, templateName);

                        const total = foundNodes.length;

                        let end = foundNodes.length;

                        if (args.start) {
                            foundNodes = foundNodes.slice(args.start, total - args.start);
                        }

                        if (typeof args.count === 'number') {
                            end = args.start + args.count;
                            foundNodes = foundNodes.slice(0, args.count);
                        }

                        return {
                            items: foundNodes,
                            start: args.start,
                            total: total,
                            end: end
                        };
                    }
                })(templateName);
            });
        }

        const schema = BuildSchemaFromManifest(context, queryType, mappedTemplates);

        const tree = convertedManifest.tree;

        context.setSchema(schema);
        context.setTree(tree);
    }

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