const {
    GraphQLObjectType,
    GraphQLBoolean
} = require('graphql');

module.exports = ({baseField}) => {
    return new GraphQLObjectType({
        name: 'CheckboxField',
        interfaces: [baseField],
        fields: () => {
            const fieldConfig = baseField.toConfig();
            const fields = {
                boolValue: {
                    type: GraphQLBoolean,
                    resolve: (source) => {
                        return source.value == true;
                    }
                }
            };
            return {... fieldConfig.fields, ...fields};
        }
    });
}