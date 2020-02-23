module.exports = function(name) {
    let sanitizedName = name.replace(/[^a-z0-9]/gi, '');
    return sanitizedName;
}