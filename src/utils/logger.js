const colors = {
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",
    
    FgBlack: "\x1b[30m",
    FgRed: "\x1b[31m",
    FgGreen: "\x1b[32m",
    FgYellow: "\x1b[33m",
    FgBlue: "\x1b[34m",
    FgMagenta: "\x1b[35m",
    FgCyan: "\x1b[36m",
    FgWhite: "\x1b[37m",
    FgGray: "\x1b[90m",
    
    BgBlack: "\x1b[40m",
    BgRed: "\x1b[41m",
    BgGreen: "\x1b[42m",
    BgYellow: "\x1b[43m",
    BgBlue: "\x1b[44m",
    BgMagenta: "\x1b[45m",
    BgCyan: "\x1b[46m",
    BgWhite: "\x1b[47m",
    BgGray: "\x1b[100m",
};

const log = (arr, type) => {
    const levels = [0, 1, 2, 3];
    let LOG_LEVEL = process.env.LOG_LEVEL || 3;
    
    if (levels.includes(LOG_LEVEL) === "false") LOG_LEVEL = 3;
    if (type !== 'critical' && type !== 'warning' && type !== 'info') type = 'info';
    switch (type) {
        case 'critical':
            if (!(LOG_LEVEL >= 1)) return null;
            break;
        case 'warning':
            if (!(LOG_LEVEL >= 2)) return null;
            break;
        case 'info':
            if (!(LOG_LEVEL >= 3)) return null;
            break;
    };

    let message = [];
    if (process.env?.LOG_DATETIME === "true") {
        message.push(colors.FgGreen);
        message.push(`[${new Date().toISOString().replace('T', ' ').replace('Z', '')}]`);
        message.push(colors.Reset);
    };
    if (typeof arr !== "object") {
        message.push(arr);
    } else {
        arr.forEach(element => {
            if (typeof element !== 'object') return message.push(' ' + element + ' ');
            const keys = Object.keys(element);
            keys.forEach(key => {
                if (colors[key]) message.push(colors[key]);
                message.push(Object.values(element).toString());
                message.push(colors.Reset);
            });
        });
    };

    message.push(colors.Reset);
    message = message.join('').replace(/ +/g, ' ').split('\n').map(e => e.trim()).join('\n');
    console.log(`${message}`);
    return message;
};

const logWait = (str) => {
    if (process.env?.LOG_DATETIME === "true") {
        str = colors.FgGreen + `[${new Date().toISOString().replace('T', ' ').replace('Z', '')}] ` + colors.Reset + str ;
    };
    return new Promise((resolve, reject) => {
        process.stdout.write(`${colors.FgMagenta}${str}`);
        setTimeout(() => process.stdout.write(' .'), 150);
        setTimeout(() => process.stdout.write('.'), 300);
        setTimeout(() => process.stdout.write('.'), 400);
        setTimeout(() => resolve(process.stdout.write(`\n${colors.Reset}`)), 750);
    });
}; 

module.exports = {log, logWait};