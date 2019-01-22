'use strict';

module.exports = {
    "endpointId": "speaker_id",
    "manufacturerName": "Es werde Ton GmbH",
    "friendlyName": "TestBox",
    "description": "Unser zweites Alexa-Gerät",
    "displayCategories": [
        "SPEAKER"
    ],
    "capabilities":
    [
        {
          "type": "AlexaInterface",
          "interface": "Alexa",
          "version": "3"
        },
        {
            "interface": "Alexa.Speaker",
            "version": "1.0", // wichtig
            "type": "AlexaInterface",
            "properties": {
                "supported": [{
                    "name": "volume",
                },
                {
                    "name": "muted",
                },
                ],
                 "retrievable": false
            }
        },
    ]
};