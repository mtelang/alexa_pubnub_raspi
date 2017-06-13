require('dotenv').load();	// This loads the environment from hidden file '.env'
var PubNub = require('pubnub'); // Use the Pubnub SDK
var gpio = require('rpi-gpio'); // Required for GPIO switching

//LEDs connected to these GPIO pins
BEDROOM_LIGHT = "17"

var leds = [BEDROOM_LIGHT];

try
{
	//Set mode for all GPIO used as output
	for (var i in leds){
		gpio.setup(leds[i], gpio.DIR_OUT, write);
	}
}
catch (err)
{
	console.log ("Exception occured while setting up GPIO ", err);
}
try
{
	// Instantiate a new Pubnub. Only Subscribe is needed. We will not publish.
	var pn = new PubNub({
		subscribeKey: process.env.PUB_NUB_SUBSCRIBE_KEY,
		ssl: true
	});
	
	// A listener event fired when a message is received on subscribed channel
	pn.addListener({
		message: function (m)
		{
			var msg = m.message;
			var cmd = msg['command'];
			var device = msg ['gadget'];
			// TODO: Add error checks if cmd and device exist
			
			//console.log ("Message recd: ", msg);
			console.log ("Command recd: ", cmd);
			console.log ("Device : ", device);
				
			if (cmd === 'TURN_ON')
			{
				if (device.includes("bedroom light"))
				{
					console.log (msg['message'] + ' ' + device);
					gpio_pin = BEDROOM_LIGHT;
					gpio.write(gpio_pin, true,function(err) {
						if (err) throw err;
						console.log('Written to pin');
					});
				}				
				else
				{
					console.log ("Invalid device:   " + device);
				}
			}
			else if (cmd === 'TURN_OFF')
			{
				if (device.includes("bedroom light"))
				{
					console.log (msg['message'] + ' ' + device);
					gpio_pin = BEDROOM_LIGHT;
					gpio.write(gpio_pin, true,function(err) {
						if (err) throw err;
						console.log('Written to pin');
					});	
				}
				else
				{
					console.log ("Invalid device:  " + device);
				}								
			}
		    else if (cmd === 'SET_VALUE') // TODO: process set value command
			{
				console.log ("Recd setting value command");
				console.log ("Not handled setting value");
			}
			else
			{
				console.log ("Invalid command:   " + cmd);
			}
		}
	});
	
	console.log ('Subscribing to channel: ', process.env.PUB_NUB_CHANNEL_KEY);
	
	// Subscribe to channel so the listener is fired on receiving message
	// Channel name picked up from .env file
	pn.subscribe({
		channels: [process.env.PUB_NUB_CHANNEL_KEY]
	});
}
catch (err)
{
	console.log ('Exception occured processing Pubnub ', err);
}
