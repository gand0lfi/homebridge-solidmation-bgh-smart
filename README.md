# Solidmation - BGH Smart Plugin for Homebridge

A [Homebridge](https://github.com/nfarina/homebridge) plugin for "BGH Smart Control Kit" or BGH Smart Control AC's made by solidmation

Instead of using BGH's own api, I prefer to use solidmation's since it allows to match not only the AC controllers but many other devices from the same app. That's the main diference on this plugin and https://github.com/sbehrends/homebridge-bgh-smart

It's supposed to be used with https://github.com/gand0lfi/homebridge-solidmation-switch at least until I get enough time to make only one plugin with all the accesories.

It uses https://myhabeetatcloud-services.solidmation.com/1.0 API to interact with your registered devices

### Installation

```
npm install homebridge-solidmation-bgh-smart -g
```

Add to your configuration

```
{
  "accessory": "Solidmation-Smart",
  "name": "Accesory Name",
  "email": "email@domain.com",
  "password": "password",
  "deviceName": "Device name in Solidmation",
  "homeId": "12345",
  "deviceId": "12345"
}
```

You need the homeId and deviceId from the console while logged in at the [MyHabeetat](https://myhabeetat.solidmation.com/Panel.aspx) 

Someone asked on how to get homeId and deviceId so here's my version of the console script:

once logged in on my habeetat:

window.open($("#ifrContent").attr('src'));

in the new window that should open, on the console (replace email & password):

function getDevices(a){
	jQuery.ajax({type:"POST",url:"https://myhabeetatcloud-services.solidmation.com/1.0/HomeCloudService.svc/GetDataPacket",contentType:"application/json",data:JSON.stringify({token:HCData.AccessToken,homeID:a,serials:{Home:0,Groups:0,Devices:0,Endpoints:0,EndpointValues:0,Scenes:0,Macros:0,Alarms:0},timeOut:1e4}),success:function(a){
	if(a.GetDataPacketResult.Endpoints.length>0) 
		for(var b=0;b<a.GetDataPacketResult.Endpoints.length;b++){
var c=a.GetDataPacketResult.Endpoints[b],d={name:c.Description,email:"EMAILACCOUNT@gmail.com",password:"PASSWORD",deviceName:c.Description,homeId:c.HomeID,deviceId:c.EndpointID};
console.log(JSON.stringify(d))
	}
						}
	})

}

var c=$.cookie("HCData");

if(c){ var HCData=JSON.parse(c);
	HCData.AccessToken={Token:decodeURIComponent(HCData.AccessToken)},
	HCData.FirstName=decodeURIComponent(HCData.FirstName),
	HCData.LastName=decodeURIComponent(HCData.LastName),
	
	jQuery.ajax({type:"POST",url:"https://myhabeetatcloud-services.solidmation.com/1.0/HomeCloudService.svc/EnumHomes",contentType:"application/json",data:JSON.stringify({token:HCData.AccessToken}),success:function(a){
		if(a.EnumHomesResult&&a.EnumHomesResult.Homes)
			for(var b=0;b<a.EnumHomesResult.Homes.length;b++){
				var c=a.EnumHomesResult.Homes[b];
				getDevices(c.HomeID);
			}
		}
	})

}

