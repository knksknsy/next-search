const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    config: {
        endpoint: process.env.IBM_OBJECT_STORAGE_ENDPOINT,
        apiKeyId: process.env.IBM_OBJECT_STORAGE_API_KEY_ID,
        ibmAuthEndpoint: process.env.IBM_OBJECT_STORAGE_AUTH_ENDPOINT,
        serviceInstanceId: process.env.IBM_OBJECT_STORAGE_SERVICE_INSTANCE_ID
    },
    bucketName: process.env.IBM_OBJECT_STORAGE_BUCKET_NAME
};
