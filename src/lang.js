
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
