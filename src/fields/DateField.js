const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt
} = require('graphql');

module.exports = ({baseField}) => {
    return new GraphQLObjectType({
        name: 'DateField',
        interfaces: [baseField],
        fields: () => {
            const fieldConfig = baseField.toConfig();
            const fields = {
                formattedDateValue: {
                    type: GraphQLString,
                    args: {
                        format: { type: GraphQLString, defaultValue: 'g' },
                        offset: { type: GraphQLInt, defaultValue: 0 }
                    },
                    resolve: (source, { format }) => {
                        // formats aren't supported for now, just toString the date
                        // so we have something to show, consider formatting library in the futre. 
                        let formatted = null;
                        if (source.value) {
                            formatted = new Date(source.value).toString();
                        }
                        return formatted;
                    }
                },
                dateValue: {
                    type: GraphQLInt,
                    resolve: (source) => {
                        let val = 0;
                        if (source.value) {
                            val = new Date(source.value).valueOf() / 1000;
                        }
                        return val;
                    }
                }
            };
            return { ...fieldConfig.fields, ...fields };
        }
    });
}