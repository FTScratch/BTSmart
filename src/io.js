
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
			//ext.input.oldValues = ext.input.curValues;
			//ext.input.curValues = data;
			ext.onNewInputs(data);
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
