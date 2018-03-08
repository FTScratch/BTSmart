
function getButtonState(state) {
	return Lang.get(state);
}

function getLightBarrierState(state) {
	return Lang.get(state);
}


var Lang = {
	
	// browser's language code
	langCode: (navigator.language || navigator.userLanguage).substr(0,2),
	
	trans: {
		
		// german translation
		de: {
			
			onOpenClose:				'Wenn %m.openCloseSensors %m.inputs %m.openClose',
			onInput:					'Wenn Wert von %m.inputSensors %m.inputs %m.compares %n',

			isClosed:					'%m.openCloseSensors %m.inputs geschlossen?',
			getSensor:					'Lese Wert von %m.inputSensors %m.inputs',
			getBattery:					'Lese Batteriestand',
	
			doSetLamp:					'Setze Lampe %m.outputs auf %n',
			doSetOutput:				'Setze Ausgang %m.outputs auf %n',
			
			doSetMotorSpeed:			'Setze Motor %m.motors auf %n',
			doSetMotorSpeedDir:			'Setze Motor %m.motors auf %n %m.motorDirections',
			doSetMotorDir:				'Setze Motor %m.motors auf %m.motorDirections',
			
			doStopMotor:				'Stoppe Motor %m.motors',
			doStopMotorAdv:				'Stoppe Verfahren %m.motors',

			doConfigureInput:			'Setze Eingang %m.inputs auf %m.inputModes',
			
			dir_forward:				'vorwärts',
			dir_backwards:				'rückwärts',
			
			sens_color:					'Farbsensor',
			sens_ntc:					'NTC-Widerstand',
			sens_photo:					'Fotowiderstand',
			sens_lightBarrier:			'Lichtschranke',
			sens_button:				'Schalter',
			sens_reed:					'Reed-Kontakt',
			
			openclose_opens:			'öffnet',
			openclose_closes:			'schließt',
			
			mode_ar:					'Widerstand analog',
			mode_av:					'Spannung analog',
			mode_dr:					'Widerstand digital',
			mode_dv:					'Spannung digital',
			
			reset:						'zurücksetzen',

		},
		
		en: {
			onOpenClose: 'If %m.openCloseSensors %m.inputs %m.openClose',
			onInput: 'If value of %m.inputSensors %m.inputs %m.compares %n',
			isClosed: 'Is %m.openCloseSensors %m.inputs closed?',
			getSensor: 'Read value of %m.inputSensors %m.inputs',
			getBattery: 'Read battery level',
			doSetLamp: 'Set lamp %m.outputs to %n',
			doSetOutput: 'Set output %m.outputs to %n',
			doSetMotorSpeed: 'Set motor %m.motors to %n',
			doSetMotorSpeedDir: 'Set motor %m.motors to %n %m.motorDirections',
			doSetMotorDir: 'Set motor %m.motors to %m.motorDirections',
			doStopMotor: 'Stop motor %m.motors',
			doConfigureInput: 'Set input %m.inputs to %m.inputModes',
			dir_forward: 'forward',
			dir_backwards: 'back',
			sens_color: 'Colour sensor',
			sens_ntc: 'NTC resistance',
			sens_photo: 'Photo resistance',
			sens_lightBarrier: 'Light barrier',
			sens_button: 'Switch',
			sens_reed: 'Reed contact',
			openclose_opens: 'opens',
			openclose_closes: 'closes',
			mode_ar: 'Analogue resistance',
			mode_av: 'Analogue voltage',
			mode_dr: 'Digital resistance',
			mode_dv: 'Digital voltage',
			reset: 'reset'
		},
				
	},	
	
	// get a translated version for the given constant
	get: function(what) {
		var codes = this.trans[this.langCode];		// requested language
		if (!codes) { codes = this.trans['en']; }	// fallback
		return codes[what];
	},
	
	getSensor: function(name) {
		return this.get('sens_' + name);
	},
	
	getMotorDir: function(dir) {
		return this.get('dir_' + dir);
	},
	
	getOpenClose: function(dir) {
		return this.get('openclose_' + dir);
	},
	
	getMode: function(mode) {
		return this.get('mode_' + mode);
	}
	
};

function ScratchConnection(url, ext) {
		
	var ws = null;
	
	// for access within methods
	var _this = this;
	var connected = false;
	var curDev = null;
	
	this.status = {status: 1, msg: 'Connecting'};
	
	// get the current time as string
	var getTimeString = function() {
		var d = new Date();
		var h = d.getHours();	h = (h<10) ? ('0'+h) : (h);
		var m = d.getMinutes();	m = (m<10) ? ('0'+m) : (m);
		var s = d.getSeconds();	s = (s<10) ? ('0'+s) : (s);
		return '(' + h + ':' + m + ':' + s + ') ';
	}
	
	this.connect = function() {
		ws = new WebSocket(url);
		if (ws == null) {
			alert('Your Browser does not support WebSockets. You need a recent Browser to use FTScratchBTSmart');
			return;
		}
		ws.onmessage = handleMessage;
		ws.onclose = handleClose;
		ws.onopen = handleOpen;
	}
	
	this.close = function() {
		ws.close();
	}
	
	// websocket connected. this == the websocket
	var handleOpen = function() {
		_this.connected = true;
		ext.onConnect();
	}
	
	// new websocket message. this == the websocket
	var handleMessage = function(message) {
		
		var messageType = message.data.substring(0, 4);
		var messageData = message.data.substring(4);
		var data = (messageData) ? (JSON.parse(messageData)) : null;
				
		if (messageType === "SENS") {
			ext.input.oldValues = ext.input.curValues;
			ext.input.curValues = data;
			ext.onNewInputs();
		} else if (messageType == "PONG") {
			ext.onPong();
			var dev = data[0];
			var devChanged = dev != _this.curDev;
			_this.curDev = dev;
			if (dev) {
				if (devChanged) {
					ext.onConnectTXT();
				}
				_this.status = {status: 2, msg: getTimeString() + ' connected to ' + dev };
			} else {
				_this.status = {status: 1, msg: getTimeString() + ' connected to application but not to BTSmart' };
			}
			
		}
		
	};

	// websocket closed. this == the websocket
	var handleClose = function() {
		_this.status = {status: 0, msg: getTimeString() + ' lost connection to application'};
		if (_this.connected) {
			alert('Lost connection to the BTSmart-Application. Please ensure FTScratchBTSmart.exe is running and reload the Website');
		} else {
			alert('Could not connect to the BTSmart-Application. Please ensure FTScratchBTSmart.exe is running and reload the Website');
		}
		_this.connected = false;
	};
	
	this.playSound = function(sndIdx) {
		this.send("PLAY", {idx: sndIdx});
	};
	

	
	this.ping = function() {
		ws.send("PING");
	}
	
	this.reset = function() {
		ws.send("RSET");
	}
	
	/** send CMD+json*/
	this.send = function(cmd, obj) {
		ws.send(cmd + JSON.stringify(obj));
	}
	
	
	
};

/*
var IO = {

	// the URL of the host application interfacing the ROBO-LT
	host: 'http://localhost:8000/',
	
	// the latest result of updateStatus()
	status: {status: 1, msg: 'Connecting'},
	
	// request timeout after x msec
	timeout: 500,


	// get the current time as string
	getTimeString: function() {
		var d = new Date();
		var h = d.getHours();	h = (h<10) ? ('0'+h) : (h);
		var m = d.getMinutes();	m = (m<10) ? ('0'+m) : (m);
		var s = d.getSeconds();	s = (s<10) ? ('0'+s) : (s);
		return '(' + h + ':' + m + ':' + s + ') ';
	},

	// ping the host application
	updateStatus: function() {
		try {
			var time = this.getTimeString();
			var self = this;
			this.doGet('status')
				.done( function(dev)	{self.status = {status: 2, msg: time + dev[0]};} )							// app responded
				.fail( function()		{self.status = {status: 0, msg: time + 'Application not responding'};} );	// app did not respond within timeout
		} catch (err) {return {status: 1, msg: 'Connecting'};}
		return this.status;
	},


	// POST the given command and corresponding values to the host application
	doPost: function(command, values) {
		var json = JSON.stringify(values);
		this.doPostJson(command, json);
	},
	doPostJson: function(command, json) {
		return $.ajax({
              async: false,					// seems a lot more stable in scratch
			  url: this.host + command,
              dataType: 'json',
			  method: 'POST',
			  data: json,
			  crossDomain: true,
        });
	},
	
	// GET the given command and return the response data from the host application
	doGet: function(command) {
		return $.ajax({
              async: true,
			  timeout: this.timeout,
			  url: this.host + command,
              dataType: 'json',
			  method: 'GET',
			  crossDomain: true,
        });
	},


	
};
	*/

(function(ext) {
	
	// the current sensor values from the device
	ext.currentValues = null;
	
	// the previous values from the device (for change detection)
	ext.oldValues = null;
		
	// Cleanup function when the extension is unloaded
	ext._shutdown = function() {
		connection.close();
	};
	
	// react to ScratchX stop button/event
	ext._stop = function () {
        ext.reset();
	};

	
	// Status reporting code
	// Use this to report missing hardware, plugin or unsupported browser
	ext._getStatus = function() {
	try {
		connection.ping();
	} catch (err) {
		;    // not yet connected. no problem
    }
		return connection.status;
	};
	
	// reset the device
	ext.reset = function() {
		connection.reset();
		ext.output.init();
	};
	
	// describes one output (value)
	function Output(_idx) {
		this.idx = _idx;
		this.value = 0;		// output value [0:8]
		this.dir = 1;		// direction [-1, +1]
		this.setSpeed =		function(val) {this.value = Math.abs(Math.round(val));}
		this.setLamp =		function(val) {this.value = Math.round(val); this.dir = 1;}
		this.setDir =		function(dir) {this.dir = dir;}
		this.init = 		function() {this.value = 0; this.dir = 1;}
	};
	
	// describes one input-configuration (mode)
	function Input(_idx) {
		this.idx = _idx;
		this.mode = -1;			// start with "unknown"
		this.setMode = function(newMode) {
			var changed = this.mode != newMode;
			this.mode = newMode;
			if (changed) {
				connection.send("CFGI", this);
			}
		}
		this.init =			function() {this.mode = -1;}
	};
	
	
	// describes the current state
	ext.output = {
		
		// outgoing state
		outputs:	[new Output(0), new Output(1)],
		inputs:		[new Input(0), new Input(1), new Input(2), new Input(3)],

		// reset to initial state
		init: function() {
			for (var i = 0; i < 2; ++i) {this.outputs[i].init();}
			for (var i = 0; i < 4; ++i) {this.inputs[i].init();}
		},
		
	};
	
	// received state
	ext.input = {
		curValues:	{},
		oldValues:	{},
	}
	
	// convert Output name to array index: '04' -> 3
	ext._outputNameToIdx = function(outputName) {
		return outputName[1] - 1;
	};
	
	// convert Input name to array index: 'I4' -> 3
	ext._inputNameToIdx = function(inputName) {
		return inputName[1] - 1;
	};
	
	// convert Motor name to array index: 'M4' -> 3
	ext._motorNameToIdx = function(motorName) {
		if (motorName === 'M1+M2') {return 2;}
		return motorName[1] - 1;
	};
	
	// convert direction-name to value 'backward' -> -100
	ext._dirNameToValue = function(dirName) {
		if (dirName == Lang.getMotorDir('forward'))		{return +1;}
		if (dirName == Lang.getMotorDir('backwards'))	{return -1;}
	};
	
	// convert input-mode to value 'd10v' -> 0
	ext._inputModeToIdx = function(inputMode) {
		//console.log(inputMode);
		if (inputMode == Lang.getMode('dv'))			{return 0;}
		if (inputMode == Lang.getMode('dr'))			{return 1;}
		if (inputMode == Lang.getMode('av'))			{return 2;}
		if (inputMode == Lang.getMode('ar'))			{return 3;}
		//console.log("err");
	};
	
	
	// set the given Output 'Ox' to the provided value [0:8];
	ext._setOutput08 = function(outputName, value) {
		var idx = ext._outputNameToIdx(outputName);
		ext.output.outputs[idx].setLamp(value);		// for lamps, only positive range
	};
	
	// set the given Motor 'Mx' speed [0:8]
	ext._setMotorSpeed08 = function(motorName, speed) {
		var idx = ext._motorNameToIdx(motorName);
		if (idx === 2) {
			ext.output.outputs[0].setSpeed(speed);
			ext.output.outputs[1].setSpeed(speed);
		} else {
			ext.output.outputs[idx].setSpeed(speed);
		}
	};
	
	// set the given Motor 'Mx' direction
	ext._setMotorDir = function(motorName, dirName) {
		var idx = ext._motorNameToIdx(motorName);
		var dir = ext._dirNameToValue(dirName);
		if (idx === 2) {
			ext.output.outputs[0].setDir(dir);
			ext.output.outputs[1].setDir(dir);
		} else {
			ext.output.outputs[idx].setDir(dir);
		}
	};
		
	// send current output config to the server
	ext._sendOutput = function(name) {
		var idx = ext._motorNameToIdx(name);
		if (idx === 2) {
			connection.send('SETO', ext.output.outputs[0]);
			connection.send('SETO', ext.output.outputs[1]);
		} else {
			connection.send('SETO', ext.output.outputs[idx]);
		}
	}
		
	// set the given Input's mode: 0=DIGITAL_10V, 1=DIGITAL_5KOHM, 2=ANALOG_10V, 3=ANALOG_5KOHM, 4=ULTRASONIC
	ext._setSensorMode = function(inputName, mode) {
		var idx = ext._inputNameToIdx(inputName);
		ext.output.inputs[idx].setMode(mode);
		//console.log("set input " + inputName + " to " + mode);
	};
	
	
	
	// set the given input's mode according to the given type
	ext._adjustInputModeAnalog = function(inputName, sensorType) {
		//console.log("configuring " + inputName + " for analog " + sensorType);
		if		(sensorType === Lang.getSensor('color'))		{ext._setSensorMode(inputName, 2);}		// ANALOG_10V
		//else if	(sensorType === Lang.getSensor('distance'))		{ext._setSensorMode(inputName, 4);}		// ultrasonic
		else if	(sensorType === Lang.getSensor('ntc'))			{ext._setSensorMode(inputName, 3);}		// ANALOG_5K
		else if	(sensorType === Lang.getSensor('photo'))		{ext._setSensorMode(inputName, 3);}		// ANALOG_5K
		else													{alert("unsupported sensor type");}
	};
	
	// set the given input's mode according to the given type
	ext._adjustInputModeDigital = function(inputName, sensorType) {
		//console.log("configuring " + inputName + " for digital " + sensorType);
		if		(sensorType === Lang.getSensor('button'))		{ext._setSensorMode(inputName, 1);}		// DIGITAL_5KOHM
		else if	(sensorType === Lang.getSensor('reed'))			{ext._setSensorMode(inputName, 1);}		// DIGITAL_5KOHM
		else if	(sensorType === Lang.getSensor('lightBarrier'))	{ext._setSensorMode(inputName, 1);}		// DIGITAL_5KOHM
		else													{alert("unsupported sensor type");}
	};
		
			
	/** input values have changed */
	ext.onNewInputs = function() {
		;
	};
	
	/** ping/pong between scratch and app */
	ext.onPong = function() {
		;
	}
	
		
	
	
	/** commands */
	

	
	/** set the lamp at the given output to the provided value [0:8] */
	ext.doSetLamp = function(outputName, value) {
		ext._setOutput08(outputName, value);
		ext._sendOutput(outputName);
	};
	
	/** set the given Output 'Ox' to the provided value [0:8] */
	ext.doSetOutput = function(outputName, value) {
		ext._setOutput08(outputName, value);
		ext._sendOutput(outputName);
	};
	
	
	/** adjust the given motor's speed */
	ext.doSetMotorSpeed = function(motorName, value) {
		ext._setMotorSpeed08(motorName, value);
		ext._sendOutput(motorName);
	};
	
	/** adjust the given motor's direction */
	ext.doSetMotorDir = function(motorName, dirName) {
		ext._setMotorDir(motorName, dirName);
		ext._sendOutput(motorName);
	};
	
	/** adjust the given motor's speed and direction */
	ext.doSetMotorSpeedDir = function(motorName, value, dirName) {
		ext._setMotorSpeed08(motorName, value);
		ext._setMotorDir(motorName, dirName);
		ext._sendOutput(motorName);
	};
				
	/** stop the given motor */
	ext.doStopMotor = function(motorName) {
		ext._setMotorSpeed08(motorName, 0);
		ext._sendOutput(motorName);
	};
			
			
			
			
			
	/** expert config: input -> mode */
	ext.doConfigureInput = function(inputName, inputMode) {
		var idx = ext._inputModeToIdx(inputMode);
		ext._setSensorMode(inputName, idx);
		//ext.updateIfNeeded();
	};
	
	
	

	
	/** get the current value for the given sensor-type connected to the provided input */
	ext.getSensor = function(sensorType, inputName) {
		
		// ensure correct (analog) working mode
		ext._adjustInputModeAnalog(inputName, sensorType);
		//ext.updateIfNeeded();
		
		// get value
		var idx = ext._inputNameToIdx(inputName);
		return ext.input.curValues.inputs[idx];
		
	};
	
	/** get the current value for the given sensor-type connected to the provided input */
	ext.getBattery = function() {
				
		// get value
		return ext.input.curValues.inputs[4];
		
	};
	
	/** button/lightBarrier/reed is closed */
	ext.isClosed = function(sensorType, inputName) {
		
		// ensure inputName uses the correct configuration
		ext._adjustInputModeDigital(inputName, sensorType);
		//ext.updateIfNeeded();
		
		// fetch
		var idx = ext._inputNameToIdx(inputName);
		return ext.input.curValues.inputs[idx] === 1;		// TODO light barrier?
		
	};
	
	
	/** sensor X on input 'Ix' >,<,= value */
	ext.onInput = function(sensorType, inputName, operator, value) {
				
		// ensure correct working mode
		ext._adjustInputModeAnalog(inputName, sensorType);
		//ext.updateIfNeeded();
		
		// get index
		var idx = ext._inputNameToIdx(inputName);
			
		// compare
		if (operator === '>') {
			return !(ext.input.oldValues.inputs[idx]  >  value) && (ext.input.curValues.inputs[idx]  >  value);
		} else if (operator === '<') {
			return !(ext.input.oldValues.inputs[idx]  <  value) && (ext.input.curValues.inputs[idx]  <  value);
		} else if (operator === '=') {
			return !(ext.input.oldValues.inputs[idx] === value) && (ext.input.curValues.inputs[idx] === value);
		}
		
	};
	
	/** button/light-barrier/reed opens/closes */
	ext.onOpenClose = function(sensorType, inputName, direction) {
		
		// TODO: if schalter/reed/lichtschranke all need DIGITAL_5KOHM and have the same direction effect
		// then there is no need to distinguish between those three sensor types!
		
		// ensure inputName uses the correct configuration
		//ext._setSensorMode(inputName, 1);		// DIGITAL_5KOHM
		ext._adjustInputModeDigital(inputName, sensorType);
		//ext.updateIfNeeded();
		
		// check both directions
		var idx = ext._inputNameToIdx(inputName);
		if (direction === Lang.getOpenClose('opens')) {
			return ext.input.oldValues.inputs[idx] === 1 && ext.input.curValues.inputs[idx] === 0;	// TODO light barrier?
		} else if (direction === Lang.getOpenClose('closes')) {
			return ext.input.oldValues.inputs[idx] === 0 && ext.input.curValues.inputs[idx] === 1;	// TODO light barrier?
		} else {
			alert('invalid open/close mode');
		}
		
	};
		
	// Block and block menu descriptions
	var descriptor = {
		
		blocks: [
			
			// events
			['h', Lang.get('onOpenClose'),					'onOpenClose',					Lang.getSensor('button'), 'I1', Lang.getOpenClose('opens')],
			['h', Lang.get('onInput'),						'onInput',						Lang.getSensor('color'), 'I1', '>', 0],
				
			// gets
			['r', Lang.get('getSensor'),					'getSensor',					Lang.getSensor('color'), 'I1'],
			['r', Lang.get('getBattery'),					'getBattery',					],

			['b', Lang.get('isClosed'),						'isClosed',						Lang.getSensor('button'), 'I1'],
						
			[' ', Lang.get('doSetLamp'),					'doSetLamp',					'M1', 0],
			[' ', Lang.get('doSetOutput'),					'doSetOutput',					'M1', 0],
			
			// simple motor
			[' ', Lang.get('doSetMotorSpeed'),				'doSetMotorSpeed',				'M1', 8],
			[' ', Lang.get('doSetMotorSpeedDir'),			'doSetMotorSpeedDir',			'M1', 8, Lang.getMotorDir('forward')],			
			[' ', Lang.get('doSetMotorDir'),				'doSetMotorDir',				'M1', Lang.getMotorDir('forward')],
			[' ', Lang.get('doStopMotor'),					'doStopMotor',					'M1'],
			
			[' ', Lang.get('doConfigureInput'),				'doConfigureInput',				'I1', Lang.getMode('dv')],

			[' ', Lang.get('reset'),						'reset'],
			
		],
		
		menus: {
			
			compares:			['<', '>'],
			
			inputSensors:		[Lang.getSensor('color'), Lang.getSensor('ntc'), Lang.getSensor('photo')],
			
			openCloseSensors:	[Lang.getSensor('button'), Lang.getSensor('reed'), Lang.getSensor('lightBarrier')],
			openClose:			[Lang.getOpenClose('opens'), Lang.getOpenClose('closes')],
			
			inputs:				['I1', 'I2', 'I3', 'I4'],
			motors:				['M1', 'M2', 'M1+M2'],
			motorDirections:	[Lang.getMotorDir('forward'), Lang.getMotorDir('backwards')],
						
			outputs:			['M1', 'M2'],
			outputValues:		[0, 1, 2, 3, 4, 5, 6, 7, 8],
			
			inputModes:			[Lang.getMode('dv'), Lang.getMode('dr'), Lang.getMode('av'), Lang.getMode('ar')],
	
		},
		
		url: 'https://www.fischertechnik.de/',
		
	};
	
	// connected to FTScratchBTSmart.exe
	ext.onConnect = function() {
		
		// ensure the ROBO LT is reset
		ext.reset();
	
	};
	
	// connected to a BTSmart
	ext.onConnectTXT = function() {
	
		// ensure the internal state is reset as the BTSmart's state is also reset!
		ext.output.init();
	
	};
	
	var connection = new ScratchConnection("ws://127.0.0.1:8001/api", ext);	// edge/ie need the IP here
	connection.connect();
 
  // Register the extension
	ScratchExtensions.register('fischertechnik BTSmart', descriptor, ext);

})({});

