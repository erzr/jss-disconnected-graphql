const {
    GraphQLObjectType
} = require('graphql');
const SanitizeTemplateName = require('../helpers/SanitizeTemplateName');

const buildTemplateType = (context, template) => {
    const itemType = context.getItemType();
    const itemTypeConfig = itemType.toConfig();
    const fieldMapping = itemTypeConfig.fields;

    if (template.fields) {
        template.fields.forEach(field => {
            const fieldType = context.getFieldType(field.type);
            if (fieldType) {
                fieldMapping[field.name] = {
                    type: fieldType,
                    resolve: (source) => {
                        const foundField = source.fields.find(f => f.name === field.name);
                        return foundField;
                    }
                }
            }
        });
    }

    const objectTypeName = SanitizeTemplateName(template.name);

    return new GraphQLObjectType({
        name: objectTypeName,
        interfaces: [itemType],
        fields: fieldMapping
    });
}

module.exports = (context, templates) => {
    const mappedTemplates = Object.keys(templates).map(templateName => {
        const template = templates[templateName];
        const mapped = buildTemplateType(context, template);
        return mapped;
    })
    return mappedTemplates;
}