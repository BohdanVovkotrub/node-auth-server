require('dotenv').config();
const path = require('path');
const express = require('express');

const cors = require('cors');
const helmet = require('helmet');
const nocache = require('nocache');
const cookieParser = require('cookie-parser');

const {log, logWait} = require(path.join(process.env.INIT_CWD, 'src/utils/logger'));
const DATABASE = require("./v1/db/sequelize");

const authRouterV1 = require('./v1/routes/auth-route');
const roleRouterV1 = require('./v1/routes/role-route');
const usergroupRouterV1 = require('./v1/routes/usergroup-route');
const userRouterV1 = require('./v1/routes/user-route');


const requestLogsMiddleware = require('./v1/middlewares/request-logs-middleware');
const authMiddleware = require('./v1/middlewares/auth-middleware');
const errorMiddleware = require('./v1/middlewares/error-middleware');

const ADDRESS = process.env.ADDRESS.split(';') || "localhost";
const PORT = process.env.PORT || 5000;

const app = express();

// ENABLE HELMET FOR SECURE HEADERS
app.use(helmet.contentSecurityPolicy({
    directives: { ...helmet.contentSecurityPolicy.getDefaultDirectives()}
}));


app.use(helmet.crossOriginEmbedderPolicy());
app.use(helmet.crossOriginOpenerPolicy());
app.use(helmet.crossOriginResourcePolicy());
app.use(helmet.dnsPrefetchControl());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts({
    maxAge: 15552000,   // 180 days
    includeSubDomains: true,
    preload: true
}));
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.originAgentCluster());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
// app.use(helmet.xssFilter());
app.use((req, res, next) => {
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
})
app.use(nocache())
app.use(cors({ exposedHeaders: 'Authorization' }));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());


app.use(requestLogsMiddleware);

app.use('/api/v1/auth', authRouterV1);
app.use('/api/v1/roles', [authMiddleware.checkAuthorization], roleRouterV1);
app.use('/api/v1/usergroups', [authMiddleware.checkAuthorization], usergroupRouterV1);
app.use('/api/v1/users', [authMiddleware.checkAuthorization], userRouterV1);


app.use(errorMiddleware); // Middleware ошибок всегда должно быть после роутов!!!

//// START SERVER

const startServer = async (app) => {
	try {
		const syncData = await DATABASE.syncModels();
		if (!syncData) throw new Error('Error DB sync.');
		app.listen(PORT, ADDRESS, () => log(['SERVER IS RUNNING ON ', {FgYellow: `http://${ADDRESS}:${PORT}`}], 'critical'));
	} catch (error) {
		log([{FgRed: ' Server cannot running.'}], 'critical');
		console.error(error);
	}
};

console.log('---');
logWait('SERVER STARTING')
    .then(() => startServer(app));

// Gracefull shutdown
process.on('SIGINT', () => {
    log([{FgGray: '\rGracefully shutting down server (Ctrl-C)'}], 'critical');
	return process.exit(0);
});