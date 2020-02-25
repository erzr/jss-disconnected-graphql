
const MockNode = function ({ id, name, templateName, parent, fields, excludeFromUrl, layout }) {
    this.id = id;
    this.name = name;
    this.templateName = templateName;
    this.parent = parent;
    this.fields = fields || [];
    this.children = [];
    this.excludeFromUrl = excludeFromUrl;
    this.hasPresentation = layout && layout.renderings && layout.renderings.length;
    this.getUrl = () => {
        const pieces = [];
        let currentNode = this;

        while (currentNode) {
            if (!currentNode.excludeFromUrl &&
                currentNode.name !== 'home') {
                pieces.push(currentNode.name);
            }
            currentNode = currentNode.parent;
        }

        pieces.reverse();

        const joined = pieces.join('/');

        return joined ? '/' + joined : '/';
    }
};

const buildTemplateDictionary = (templates) => {
    const fallbackRouteName = 'App Route';
    let defaultRouteTemplate = null;
    const templateDictionary = {
        'Folder': { name: 'Folder', fields: [] }
    };

    templates.forEach(template => {
        if (template.defaultRoute) {
            defaultRouteTemplate = template;
        }
        templateDictionary[template.name] = template;
    })

    if (!defaultRouteTemplate) {
        console.warn(`Unable to find default route template, assuming ${fallbackRouteName}.`)
    }

    const defaultRouteTemplateName = defaultRouteTemplate ? defaultRouteTemplate.name : fallbackRouteName;

    return {
        defaultRouteTemplateName,
        templates: templateDictionary
    }
}

const processFields = (itemFields, templateFields) => {
    const processedFields = [];

    if (itemFields) {
        itemFields.forEach(fieldOnItem => {
            let templateField = null;
            if (templateFields) {
                templateField = templateFields.find(field => field.name === fieldOnItem.name);
            }
            processedFields.push({
                ...fieldOnItem,
                templateField,
                jss: {
                    value: fieldOnItem.value
                }
            })
        })
    }

    return processedFields;
}

const convertRoutes = (routes, parent, templateLookup) => {
    const mapped = routes.map(route => {
        const id = route.id || route.name;
        const templateName = route.template || templateLookup.defaultRouteTemplateName;
        let resolvedTemplate = templateLookup.templates[templateName];

        if (!resolvedTemplate) {
            // Looks like if a template has no fields, it does not end up in the manifest. Warn and mock one...
            resolvedTemplate = { name: templateName, fields: [] };
            console.warn(`Unable to locate template: ${templateName}`);
        }

        const processedFields = processFields(route.fields, resolvedTemplate.fields);

        const node = new MockNode({
            id,
            name: route.name,
            templateName,
            parent,
            fields: processedFields,
            layout: route.layout
        });

        // Renderings are in a folder when they get imported, let's recreate this structure.
        if (route.layout && route.layout.renderings && route.layout.renderings.length) {
            const pageComponentsId = `${id}PageComponents`;

            const pageComponentsFolder = new MockNode({
                id: pageComponentsId,
                name: 'Page Components',
                templateName: 'Folder',
                parent: node
            });

            const dataSources = route.layout.renderings.map(rendering => rendering.dataSource);

            const dataSourceConverted = convertRoutes(dataSources, pageComponentsFolder, templateLookup);

            if (dataSourceConverted) {
                pageComponentsFolder.children.push(...dataSourceConverted);
            }

            node.children.push(pageComponentsFolder);
        }

        if (route.children) {
            const convertedChildren = convertRoutes(route.children, node, templateLookup);

            if (convertedChildren) {
                node.children.push(...convertedChildren);
            }
        }

        return node;
    });

    return mapped;
};

module.exports = (manifest, appName) => {
    if (!manifest) {
        return;
    }

    // Fake it til you ... go connected.
    const sitecoreNode = new MockNode({
        id: 'sitecore',
        name: 'sitecore',
        templateName: 'Folder',
        excludeFromUrl: true
    });

    const contentNode = new MockNode({
        id: 'content',
        name: 'content',
        templateName: 'Folder',
        excludeFromUrl: true,
        parent: sitecoreNode
    });

    const siteHomeNode = new MockNode({
        id: appName,
        name: appName,
        templateName: 'Folder',
        excludeFromUrl: true,
        parent: contentNode
    });

    sitecoreNode.children.push(contentNode);
    contentNode.children.push(siteHomeNode);

    const defaultRouteTemplate = manifest.templates.find(template => template.defaultRoute);

    if (!defaultRouteTemplate) {
        console.warn("Unable to find default route template.")
    }

    const templateLookup = buildTemplateDictionary(manifest.templates);
    const convertedRoutes = convertRoutes(manifest.items.routes, siteHomeNode, templateLookup);
    const convertedNonRoutes = convertRoutes(manifest.items.nonRoutes, siteHomeNode, templateLookup);

    siteHomeNode.children.push(...convertedRoutes);
    siteHomeNode.children.push(...convertedNonRoutes);

    return {
        tree: sitecoreNode,
        templates: templateLookup.templates
    };
}