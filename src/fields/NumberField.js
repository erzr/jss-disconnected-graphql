const {
    GraphQLObjectType,
    GraphQLFloat
} = require('graphql');

module.exports = ({baseField}) => {
    return new GraphQLObjectType({
        name: 'NumberField',
        interfaces: [baseField],
        fields: () => {
            const fieldConfig = baseField.toConfig();
            const fields = {
                numberValue: { 
                    type: GraphQLFloat,
                    resolve: (source) => {
                        if (source.value) {
                            return parseFloat(source.value);
                        }
                        return 0;
                    }
                 }
            };
            return {... fieldConfig.fields, ...fields};
        }
    });
}