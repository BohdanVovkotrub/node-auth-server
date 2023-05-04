const ApiError = require('../exceptions/api-error');

module.exports = (err, req, res, next) => {
    // console.log(err)
    console.log(err.constructor.name);
    console.log(err)
    if (err instanceof ApiError) {
        return res.status(err.status).send({ message: err.message, errors: err.errors });
    };
    return res.status(500).send('Internal server error');
};