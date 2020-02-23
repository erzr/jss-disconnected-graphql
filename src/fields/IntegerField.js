const {
    GraphQLObjectType,
    GraphQLInt
} = require('graphql');

module.exports = ({baseField}) => {
    return new GraphQLObjectType({
        name: 'IntegerField',
        interfaces: [baseField],
        fields: () => {
            const fieldConfig = baseField.toConfig();
            const fields = {
                intValue: {
                    type: GraphQLInt,
                    resolve: (source) => {
                        if (source.value) {
                            return parseInt(source.value);
                        }
                        return 0;
                    }
                }
            };
            return {... fieldConfig.fields, ...fields};
        }
    });
}