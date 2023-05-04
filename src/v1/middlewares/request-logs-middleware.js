const path = require('path');
const {log} = require(path.join(process.env.INIT_CWD, 'src/utils/logger'));

module.exports = (req, res, next) => {
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const {method, url, query, params, body} = req;
    const message = [
        {FgWhite: ` ${method.toUpperCase()}`}, 
        {FgGreen: ` ${url}`},
    ];
    if (query && query.length) message.push({FgYellow: ` ${JSON.stringify({query})}`});
    if (params && params.length) message.push({FgYellow: ` ${JSON.stringify({params})}`});
    if (body && body.length) message.push({FgYellow: ` ${JSON.stringify({body})}`});
    message.push({FgMagenta: ` ${req.headers['user-agent']}`});
    message.push({FgBlue:  ` ${clientIP}`})
    log(message);

    next();
};