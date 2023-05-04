const bcrypt = require('bcrypt');

const compare = async (pass1, pass2) => {
    return await bcrypt.compare(pass1, pass2);
};

const hash = async (pass) => {
    return await bcrypt.hash(pass, 5);
};

module.exports = {compare, hash};