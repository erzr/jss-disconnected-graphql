const find = (tree, id) => {
    let foundNode = null;

    if (tree.id === id) {
        foundNode = tree;
    } else if (tree.children) {
        tree.children.some(child => {
            foundNode = find(child, id);
            return foundNode;
        });
    }
    
    return foundNode;
}

module.exports = find;