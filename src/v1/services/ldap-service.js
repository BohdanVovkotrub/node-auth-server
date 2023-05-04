const ActiveDirectory = require('activedirectory2');

const config = {
    url: process.env.LDAP_URL,
    tlsOptions: {
        rejectUnauthorized: false
    },
    baseDN: process.env.LDAP_BASE_DN,
    username: `${process.env.LDAP_SERVICE_ACCOUNT_LOGIN}@${process.env.LDAP_DOMAIN}`,
    password: process.env.LDAP_SERVICE_ACCOUNT_PASSWORD,
};
const ad = new ActiveDirectory(config);

const prettyLdapError = error => {
    let result = 'ERROR LDAP. Code unknown';
    const code = error.lde_message?.split(',')[2].split(' ');
    const knownCodes = ['525','52e', '530', '531', '532', '533', '701', '773', '775'];
    code.forEach(c => {
        if (knownCodes.includes(c)) {
            switch (c) {
                case '525':
                    result = 'ERROR LDAP 525: User not found'
                    break
                case '52e':
                    result = 'ERROR LDAP 52e: Invalid credentials.'
                    break
                case '530':
                    result = 'ERROR LDAP 530: Not permitted to logon at this time.'
                    break    
                case '531':
                    result = 'ERROR LDAP 531: Not permitted to logon from this workstation.'
                    break
                case '532':
                    result = 'ERROR LDAP 532: Password expired.'
                    break
                case '533':
                    result = 'ERROR LDAP 533: Account disabled.'
                    break
                case '701':
                    result = 'ERROR LDAP 701: Account expired.'
                    break
                case '773':
                    result = 'ERROR LDAP 773: User must reset password.'
                    break
                case '775':
                    return 'ERROR LDAP 775: Account locked out.'
                    break
                default :
                    result = 'ERROR LDAP. Code unknown'
                    break;
            };
        };
    });
    return result;
};



const authenticateUser = async (username, password) => {
    return new Promise((resolve, reject) => {
        ad.authenticate(`${username}@${process.env.LDAP_DOMAIN}`, password, (err, auth) => {
            if (err) {
                reject(new Error(prettyLdapError(err)));
            }
            resolve(true);
        });
    });
};



module.exports = {
    authenticateUser,
};