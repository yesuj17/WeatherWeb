var systemConfig = {};
systemConfig.db = {};
systemConfig.webServer = {};
systemConfig.passport = {};


//systemConfig.db.urls = 'mongodb://172.22.68.214:27017/mongodb_hipas';
systemConfig.db.urls = 'mongodb://127.0.0.1:27017/mongodb_hipas';
systemConfig.webServer.port = process.env.PORT || 3000;

module.exports = systemConfig;
