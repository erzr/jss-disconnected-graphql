module.exports = function(name) {
    let sanitizedName = name.replace(' ', '').replace('-', '');
    return sanitizedName;
}