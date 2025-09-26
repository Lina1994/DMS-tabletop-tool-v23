const generateBackendId = (prefix = 'id') => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

module.exports = {
    generateBackendId,
};