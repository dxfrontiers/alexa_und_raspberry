'use strict';

module.exports = {
    "endpointId": "sprechender_name_der_das_geraet_und_seinen_standort_beschreibt",
    "manufacturerName": "Es werde Licht GmbH",
    "friendlyName": "Testlicht",
    "description": "Unser erstes Alexa-Gerät",
    "displayCategories": [
        "LIGHT"
    ],
    "capabilities":
    [
        {
          "type": "AlexaInterface",
          "interface": "Alexa",
          "version": "3"
        },
        {
            "interface": "Alexa.PowerController",
            "version": "3",
            "type": "AlexaInterface",
            "properties": {
                "supported": [{
                    "name": "powerState"
                }],
                 "retrievable": false
            }
        },
        {
            "interface": "Alexa.BrightnessController",
            "version": "3",
            "type": "AlexaInterface",
            "properties": {
                "supported": [{
                    "name": "brightness"
                }],
                 "retrievable": false
            }
        },
        {
            "interface": "Alexa.ColorController",
            "version": "3",
            "type": "AlexaInterface",
            "properties": {
                "supported": [{
                    "name": "color"
                }],
                 "retrievable": false
            }
        },
        {
            "interface": "Alexa.ColorTemperatureController",
            "version": "3",
            "type": "AlexaInterface",
            "properties": {
                "supported": [{
                    "name": "colorTemperatureInKelvin"
                }],
                 "retrievable": false
            }
        },
    ]
};