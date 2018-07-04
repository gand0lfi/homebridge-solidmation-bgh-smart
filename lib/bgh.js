const request = require('request')
const baseUrl = 'https://myhabeetat.solidmation.com'
const apiUrl = 'https://myhabeetatcloud-services.solidmation.com/1.0'

const enumHomes = function() {
  return new Promise((resolve, reject) => {
    authReq('/HomeCloudService.svc/EnumHomes', {})
      .then((data) => {
        const { Homes } = data.EnumHomesResult
        resolve(Homes)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

const FAN_MODE = {
  SLOW: 1,
  MID: 2,
  HIGH: 3,
  AUTO: 254,
  NO_CHANGE: 255
}

const MODE = {
  OFF: 0,
  COOL: 1,
  HEAT: 2,
  DRY: 3,
  FAN: 4,
  AUTO: 254,
  NO_CHANGE: 255
}

class Device {
  constructor() {
    this.token = ''
    this.homeId = ''
    this.deviceId = '' // On API it's called endpointID
    this.deviceModel = 'Unknown'
    this.deviceManufacturer = 'BGH'
    this.deviceSerialNumber = 'FFFFFFFFFFFF'
    this.status = {}
    this.lastStatus = 0
  }

  setHomeId(homeId) {
    this.homeId = homeId
  }

  setDeviceId(deviceId) {
    this.deviceId = deviceId
  }

  setDeviceModel(deviceModel) {
    this.deviceModel = deviceModel
  }

  setSerialNumber(serialNumber) {
    this.deviceSerialNumber = serialNumber
  }

  getDeviceModel() {
    return this.deviceModel
  }

  getSerialNumber() {
    return this.deviceSerialNumber
  }

  getDeviceManufacturer() {
    return this.deviceManufacturer
  }

  login(email, password) {
    var _this = this
    return new Promise((resolve, reject) => {
      request.post({
        url: `${baseUrl}/accounts/login.aspx`,
        json: true,
        body: {
          AccountEmail: email,
          Password: password
        }
      }, function(err, response) {
        if (err) {
          reject(err)
          return
        }

        if (response.body.AccessToken === "") {
          reject('Invalid Credentials')
          return
        }
        var token = response.body.AccessToken
        _this.token = token
        resolve(token)
      })
    })
  }

  authReq(endpoint, body) {

    body.token = {
      Token: this.token
    }

    return new Promise((resolve, reject) => {
      request.post({
        url: `${apiUrl}${endpoint}`,
        json: true,
        body: body
      }, function(err, response) {
        if (err) {
          reject(err);
          return;
        }
        //console.log('pedido --------------')
        //console.log(endpoint)
        //console.log('detalle --------------')
	/*//console.log(response.body)*/
        //console.log('fin --------------')
        resolve(response.body)
      });
    });
  }

  HVACSetModes(mode) {
    mode.endpointID = this.deviceId
    return new Promise((resolve, reject) => {
      this.lastStatus = 0
      this.authReq('/HomeCloudCommandService.svc/HVACSetModes', mode)
        .then((data) => {
          // TODO: When remote is off or no batteries Result: false
          resolve(data)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  GetDataPacket() {
    var _this = this
    return new Promise((resolve, reject) => {
      this.authReq('/HomeCloudService.svc/GetDataPacket', {
        homeID: _this.homeId,
        serials: {
          Home: 0,
          Groups: 0,
          Devices: 0,
          Endpoints: 0,
          EndpointValues: 0,
          Scenes: 0,
          Macros: 0,
          Alarms: 0
        },
        timeOut: 10000
      })
        .then((data) => {
          resolve(data.GetDataPacketResult)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  parseDevices(data) {
    //console.log('arranca parseo')
    const { Devices, EndpointValues, Endpoints, Groups, Home, Macros, NewSerials, ResponseStatus, Scenes } = data
    var devices = {}
    //console.log(EndpointValues.length)
    for (var i = 0;i < EndpointValues.length; i++) {
      //console.log('renglon '+i) 
      var device = {
        deviceId: Endpoints[i].EndpointID,
        deviceName: Endpoints[i].Description,
        //deviceData: Devices[i],
        rawData: EndpointValues[i].Values,
        data: this.parseRawData(EndpointValues[i].Values),
        endpointsData: Endpoints[i]
      }

      ////console.log(Endpoints[i].Description)
      /*//console.log(Devices[i].DeviceModel)
      if (Endpoints[i].Capabilities==='2555776') {
        device.data = this.parseRawData(EndpointValues[i].Values)
      }
     
      device.data.deviceModel = device.deviceData.DeviceModel
      device.data.deviceSerialNumber = device.deviceData.Address*/
      //console.log(device)
      
      devices[device.deviceId] = device
      
    }
    
    return devices
  }

  parseRawData(data) {
    //console.log ('temp');
    
    // Temperature comes up as -51 if the sensor is disconnected. Make it null.
    var temperature = data.find(s => s.ValueType === 13) || null
    if (temperature !==null ) {
      temperature = parseFloat(temperature.Value)
      if (temperature <= -50) {
        temperature = null
      }
    } else {
  	temperature = 1
   }

    //console.log('target')
    var targetTemperature = data.find(s => s.ValueType === 20) || null
    if (targetTemperature !== null) {
	targetTemperature = parseFloat(targetTemperature.Value)
	 //console.log('aaa'+targetTemperature)
	 if (targetTemperature === 255) {
	      targetTemperature = 20
	  }
   } else {
	targetTemperature = 20
   }

    //console.log('fan')
    var fanSpeed = data.find(s => s.ValueType === 15) || null;
    if (fanSpeed !== null) {
	fanSpeed =  parseInt(fanSpeed.Value)
    } else {
	fanSpeed = 255
    }

    for (var k in FAN_MODE){
      if (FAN_MODE.hasOwnProperty(k)) {
        if (FAN_MODE[k] === fanSpeed) {
          var fanName = k
        }
      }
    }

    //console.log('mode')
    var modeId = data.find(s => s.ValueType === 14) || null;
    if (modeId !== null) {
	modeId = parseInt(modeId.Value)
    } else {
	modeId = 0
    }

    var encendido = data.find(s => s.ValueType === 1) || null;
    if (encendido !== null) {
	encendido = parseInt(encendido.Value)
    } else {
	encendido = null
    }

    for (var k in MODE){
      if (MODE.hasOwnProperty(k)) {
        if (MODE[k] === modeId) {
          var modeName = k
        }
      }
    }

    //console.log('retorna')
    return {
      temperature,
      targetTemperature,
      fanSpeed,
      fanName,
      modeId,
      modeName,
      encendido
    }
  }

  refreshStatus() {
   //console.log('refresco')
    var _this = this
    return new Promise((resolve, reject) => {
      this.GetDataPacket()
        .then((data) => {
          //console.log('hay datos')
          // //console.log(data)
          //console.log('fin datos')
          var devices = _this.parseDevices(data)
          this.status = devices[_this.deviceId]
          // //console.log(_this.deviceId)
          // //console.log(this.status)
          this.lastStatus = Math.floor(Date.now() / 1000)
          resolve(devices[_this.deviceId])
        })
        .catch((err) => {
          reject(err)
        })
    });
  }

  getStatus() {
    var _this = this

    return new Promise((resolve, reject) => {

      if (this.token === '') {
        reject()
        return
      }

      var diff = Math.floor(Date.now() / 1000) - this.lastStatus;
      if (diff < 10) {
        resolve(_this.status.data)
        return
      }

      _this.refreshStatus()
        .then(status => {
          _this.deviceModel = _this.status.data.deviceModel
          _this.deviceSerialNumber = _this.status.data.deviceSerialNumber
          resolve(_this.status.data)
        })
        .catch(() => {
          reject()
        })

    })
  }

  turnOff() {
    var _this = this
    return new Promise((resolve, reject) => {
      this.lastStatus = 0
      this.HVACSetModes({
        desiredTempC: _this.status.data.targetTemperature,
        fanMode: FAN_MODE.NO_CHANGE,
        flags: 255,
        mode: MODE.OFF
      })
    })
  }

  setMode(temperature, mode) {
    return new Promise((resolve, reject) => {
      this.lastStatus = 0
      this.HVACSetModes({
        desiredTempC: temperature.toString(),
        fanMode: FAN_MODE.AUTO,
        flags: 255,
        mode: mode
      })
    })
  }

}

module.exports = {
  Device,
  MODE,
  FAN_MODE
}
