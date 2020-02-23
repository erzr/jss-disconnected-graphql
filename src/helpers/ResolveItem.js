const ResolveItemById = require('./ResolveItemById');
const ResolveItemByPath = require('./ResolveItemByPath');

module.exports = (context, pathOrId) => {
    const { tree } = context;

    let item = ResolveItemById(tree, pathOrId);

    if (!item) {
        item = ResolveItemByPath(tree, pathOrId);
    }

    return item;
}