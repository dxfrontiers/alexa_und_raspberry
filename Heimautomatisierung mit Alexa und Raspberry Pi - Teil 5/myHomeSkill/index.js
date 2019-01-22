'use strict';

const AWS = require('aws-sdk');

var iotData = new AWS.IotData({
    endpoint: 'https://<your-endpoint>.iot.eu-west-1.amazonaws.com',
    region: 'eu-west-1',
//    accessKeyId: '<KEY>',
//    secretAccessKey: '<SECRET>'
});

function log(level, info, details) {
    console.log(`${level}: ${info} - ${details}`);
}

exports.handler = function (request, context) {
    if (request.directive.header.namespace === 'Alexa.Discovery' && request.directive.header.name === 'Discover') {
        handleDiscovery(request, context);
    }
    else {
        handleControl(request, context);
    }
};

const endpoints = require("./endpoints/all.js");
function handleDiscovery(request, context) {
    var header = request.directive.header;
    header.name = "Discover.Response";
    //log("DEBUG", "Discovery Response", JSON.stringify({ header: header, payload: endpoints }));
    context.succeed({ event: { header: header, payload: endpoints } });
}

// Abbildung von Interface-Typ auf zugehörige Property
const nameSpaceMapping = {
    "Alexa.PowerController" : "powerState",
    "Alexa.BrightnessController" : "brightness",
    "Alexa.ColorTemperatureController" : "colorTemperatureInKelvin",
    "Alexa.ColorController" : "color",
};
// Abbildung von Requestmethode auf Rückgabewert.
// Wenn nicht enthalten, wird der Inhalt des Request-Payloads
// in den Value der Response kopiert.
const acceptableValues = {
    "TurnOff" : "OFF",
    "TurnOn" : "ON",
    "AdjustBrightness" : "50", // mittlerer Wert, wird nicht ausgewertet
    "DecreaseColorTemperature" : "4000", // mittlerer Wert, wird nicht ausgewertet
    "IncreaseColorTemperature" : "4000", // mittlerer Wert, wird nicht ausgewertet
};


function handleControl(request, context) {
    var endpointId = request.directive.endpoint.endpointId;
    var requestMethod = request.directive.header.name;
    var nameSpace = request.directive.header.namespace;
    var payload =request.directive.payload;
    var iotPayload = {
        'endpointId': endpointId, 
        'nameSpace': nameSpace, 
        'requestMethod': requestMethod, 
        'payload': payload
    };

    var iotParams = {
        topic: 'alexa',
        payload: JSON.stringify(iotPayload),
        qos: 0
    };

    var iotrequest = iotData.publish(iotParams);

    iotrequest.
    on('success', function(response) {

        var propertyName = nameSpaceMapping[nameSpace];

        var result = acceptableValues[requestMethod];
        if (result === undefined) {
            result = payload[propertyName];
        }

        var contextResult = {
            "properties": [{
                "namespace": nameSpace,
                "name": propertyName,
                "value": result,
                "timeOfSample": new Date().toJSON(),
                "uncertaintyInMilliseconds": 200
            }]
        };

        var alexaResponse = assembleAlexaResponse(request, contextResult);
        context.succeed(alexaResponse);
    }).
    on('error', function(response) {
        context.error(response.error);
    }).
    send();
}

function assembleAlexaResponse(request, contextResult){
    var responseHeader = request.directive.header;
    responseHeader.namespace = "Alexa";
    responseHeader.name = "Response";
    responseHeader.messageId = responseHeader.messageId + "-R";

    var response = {
        context: contextResult,
        event: {
            header: responseHeader,
            endpoint: request.directive.endpoint,
            payload: {}
        },
    };
    return response;
}