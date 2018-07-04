# Solidmation - BGH Smart Plugin for Homebridge

A [Homebridge](https://github.com/nfarina/homebridge) plugin for "BGH Smart Control Kit" or BGH Smart Control AC's made by solidmation

It uses https://myhabeetatcloud-services.solidmation.com/1.0 API to interact with your registered devices

### Installation

```
npm install homebridge-solidmation-bgh-smart -g
```

Add to your configuration

```
{
  "accessory": "BGH-Smart",
  "name": "Accesory Name",
  "email": "email@domain.com",
  "password": "password",
  "deviceName": "Device name in Solidmation",
  "homeId": "12345",
  "deviceId": "12345"
}
```

You need the homeId and deviceId from the console while logged in at the [MyHabeetat](https://myhabeetat.solidmation.com/Panel.aspx) 

