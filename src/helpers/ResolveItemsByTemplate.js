const find = (tree, templateName) => {
    const matches = [];

    if (tree.templateName === templateName) {
        matches.push(tree);
    } 
    
    if (tree.children) {
        tree.children.forEach(child => {
            const childrenMatches = find(child, templateName);
            if (childrenMatches && childrenMatches.length) {
                matches.push(...childrenMatches);
            }
        });
    }
    
    return matches;
}

module.exports = find;