var systemConfig = {};
systemConfig.db = {};
systemConfig.webServer = {};
systemConfig.passport = {};


systemConfig.db.urls = 'mongodb://localhost:27017/mongodb_hipas';
systemConfig.webServer.port = process.env.PORT || 3000;

module.exports = systemConfig;
