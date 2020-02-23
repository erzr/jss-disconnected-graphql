const ContextWrapper = function(options) {
    this.options = options;
    this.tree = null;
    this.schema = null;

    this.setTree = (tree) => {
        this.tree = tree;
    }

    this.setSchema = (schema) => {
        this.schema = schema;
    }

    this.getItemType = () => {
        return this.options.baseItemType;
    }

    this.getFieldType = (sitecoreFieldType) => {
        const mapping = this.options.fieldMapping[sitecoreFieldType];
        return mapping;
    }
};

module.exports = ContextWrapper;