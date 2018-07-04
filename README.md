# Solidmation - BGH Smart Plugin for Homebridge

A [Homebridge](https://github.com/nfarina/homebridge) plugin for "BGH Smart Control Kit" or BGH Smart Control AC's made by solidmation

Instead of using BGH's own api, I prefer to use solidmation's since it allows to match not only the AC controllers but many other devices from the same app. That's the main diference on this plugin and https://github.com/sbehrends/homebridge-bgh-smart

It's supposed to be used with https://github.com/gand0lfi/homebridge-solidmation-switch at least unti lI get enough time to make only one plugin with all the accesories.

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

