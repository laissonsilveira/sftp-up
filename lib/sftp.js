const LOGGER = require('./logger');
const SFTPServer = require('node-sftp-server');
const mkdirp = require('mkdirp');
const sftp = new SFTPServer({
    privateKeyFile: '/home/laissonsilveira/.ssh/id_rsa',
    debug: false
});
const { createWriteStream } = require('fs');

const start = () => {
    sftp.listen(8022);

    sftp.on('connect', function (auth, info) {
        LOGGER.warn(`Authentication attempted, client info: ${JSON.stringify(info)}`);
        if (auth.method !== 'password' || auth.username !== 'dc' || auth.password !== 'test') {
            return auth.reject(['password'], false);
        }
        const username = auth.username;

        return auth.accept(session => {
            LOGGER.info(`Welcome '${username}'`);

            mkdirp(`/tmp/${username}`);

            session.on('writefile', function (path, readstream) {
                LOGGER.warn('WRITE FILE HAS BEEN ATTEMPTED!');
                let something;
                something = createWriteStream(`/tmp/${username}`);
                readstream.on('end', function () { LOGGER.warn('Writefile request has come to an end!!!'); });
                return readstream.pipe(something);
            });

            return session.on('realpath', function (path, callback) {
                return callback(`/tmp/${username}`);
            });
        });
    });

    sftp.on('error', function (err) {
        return LOGGER.warn('Server encountered an error', err);
    });
    sftp.on('end', function () {
        return LOGGER.warn('User disconnected');
    });
};


module.exports = { start };