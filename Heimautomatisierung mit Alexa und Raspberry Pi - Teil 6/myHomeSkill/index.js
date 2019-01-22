'use strict';

const AWS = require('aws-sdk');

var iotData = new AWS.IotData({
    endpoint: 'https://<your-endpoint>.iot.eu-west-1.amazonaws.com',
    region: 'eu-west-1',
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

// Abbildung von Direktive auf Rückgabewert. Wenn kein Eintrag, wird 
// der Inhalt des Request-Payloads in den Value der Response kopiert.
const acceptableValues = {
    "TurnOff" : { powerState : "OFF" },
    "TurnOn" : { powerState : "ON" },
    "AdjustBrightness" : { brightness : "50" },
//    "SetBrightness" : {},
    "DecreaseColorTemperature" : { colorTemperatureInKelvin : "4000" },
    "IncreaseColorTemperature" : { colorTemperatureInKelvin : "4000" },
    "SetVolume" : { muted : false },
    "AdjustVolume" : { volume : 50, muted : false },
    "SetMute" : { volume : 50 },
};
const propertyDirectiveMapping = {
    "muted" : "mute",
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
        'payload': payload,
    };

    var iotParams = {
        topic: 'alexa',
        payload: JSON.stringify(iotPayload),
        qos: 0
    };

    var iotrequest = iotData.publish(iotParams);

    iotrequest.
    on('success', function(response) {
        var contextResult = { "properties": [ ] };
        
        function checkId(endpoint) { return endpoint.endpointId == endpointId; }
        endpoints.endpoints.find(checkId).capabilities.forEach(function(capability) {
            if(nameSpace == capability.interface) {
                capability.properties.supported.forEach(function(property) {
                    var result;
                    var payloadKey = propertyDirectiveMapping[property.name];
                    if(payloadKey === undefined) payloadKey = property.name;

                    if(acceptableValues[requestMethod] != undefined)
                        result = acceptableValues[requestMethod][property.name];
                    if (result === undefined)  result = payload[payloadKey];

                    if(result !== undefined) {
                        contextResult.properties.push({
                            "namespace": nameSpace,
                            "name": property.name,
                            "value": result,
                            "timeOfSample": new Date().toJSON(),
                            "uncertaintyInMilliseconds": 200
                    });
                    }
                });
            }
        });
        

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