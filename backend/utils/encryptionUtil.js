const crypto = require('crypto');

function encryptData(data) {
    const encryptionKey = process.env.ENCRYPTION_KEY; // Use environment variable for the encryption key
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { iv: iv.toString('hex'), encryptedData: encrypted };
}

function encryptRequestBody(req, res, next) {
    if (req.body && Object.keys(req.body).length !== 0) {
        const { iv, encryptedData } = encryptData(JSON.stringify(req.body));
        req.body = { iv, encryptedData };
    }
    next();
}

module.exports = { encryptRequestBody };