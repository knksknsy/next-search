const COS = require('ibm-cos-sdk');
const { config, bucketName } = require('../config/ibm.config')

const cosClient = new COS.S3(config);

// get results that are already cache in the object storage
async function getResult(pendingUrl) {
    try {
        let data = await cosClient.getObject({ Bucket: bucketName, Key: pendingUrl }).promise();
        if (data) {
            return Promise.resolve({ result: JSON.parse(Buffer.from(data.Body).toString()), pendingUrl: null });
        }
        return Promise.resolve({ result: null, pendingUrl: null });
    } catch (err) {
        console.error(err);
        return Promise.resolve({ result: null, pendingUrl: pendingUrl });
    }
}

module.exports.getResult = getResult;
