const {
    GraphQLObjectType
} = require('graphql');

module.exports = ({baseField}) => {
    return new GraphQLObjectType({
        name: 'TextField',
        interfaces: [baseField],
        fields: () => {
            const fieldConfig = baseField.toConfig();
            const fields = {};
            return {... fieldConfig.fields, ...fields};
        }
    });
}