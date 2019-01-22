'use strict';

const AWS = require('aws-sdk');

var iotData = new AWS.IotData({
    endpoint: 'https://<your-endpoint>.iot.eu-west-1.amazonaws.com',
    region: 'eu-west-1',
});

function sendToIoT(data, context) {
    const params = {
        topic: 'topic_1',
        payload: JSON.stringify(data)
    };

    iotData.publish(params, (err, res) => {
        if (err) return context.fail(err);

        console.log(res);
        return context.succeed();
    });

}

exports.handler = (event, context) => {
//    sendToIoT("Hello from Lambda", context);
    sendToIoT(event.message, context);
};
