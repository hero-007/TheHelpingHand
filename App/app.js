

document.addEventListener(
	'deviceready',
	function() { evothings.scriptsLoaded(app.initialize) },
	false);

var app = {};

app.RBL_SERVICE_UUID = '713d0000-503e-4c75-ba94-3148f18d941e';
app.RBL_CHAR_TX_UUID = '713d0002-503e-4c75-ba94-3148f18d941e';
app.RBL_CHAR_RX_UUID = '713d0003-503e-4c75-ba94-3148f18d941e';
app.RBL_TX_UUID_DESCRIPTOR = '00002902-0000-1000-8000-00805f9b34fb';

app.initialize = function()
{
	app.connected = false;
};

app.sendMessage = function()
{
	if (app.connected)
	{
		function onMessageSendSucces()
		{
			console.log('Succeded to send message.');
		}

		function onMessageSendFailure(errorCode)
		{
			// Disconnect and show an error message to the user.
			app.disconnect('Disconnected');

			// Write debug information to console
			console.log('Error - No device connected.');
		};

		// Get message from input
		var message = document.getElementById('messageField').value;

		// Update conversation with message
		app.updateConversation(message, false);

		// Convert message
		var data = new Uint8Array(message.length);

		for (var i = 0, messageLength = message.length;
			i < messageLength;
			i++)
		{
			data[i] = message.charCodeAt(i);
		}

		app.device.writeCharacteristic(
			app.RBL_CHAR_RX_UUID,
			data,
			onMessageSendSucces,
			onMessageSendFailure
		);
	}
	else
	{
		// Disconnect and show an error message to the user.
		app.disconnect('Disconnected');

		// Write debug information to console
		console.log('Error - No device connected.');
	}
};

app.setLoadingLabel = function(message)
{
	console.log(message);
	$('#loadingStatus').text(message);
};

app.connectTo = function(address)
{
	device = app.devices[address];

	$('#loadingView').css('display', 'table');

	app.setLoadingLabel('Trying to connect to ' + device.name);

	function onConnectSuccess(device)
	{

		function onServiceSuccess(device)
		{
			// Application is now connected
			app.connected = true;
			app.device = device;

			console.log('Connected to ' + device.name);

			device.writeDescriptor(
				app.RBL_CHAR_TX_UUID, // Characteristic for accelerometer data
				app.RBL_TX_UUID_DESCRIPTOR, // Configuration descriptor
				new Uint8Array([1,0]),
				function()
				{
					console.log('Status: writeDescriptor ok.');

					$('#loadingView').hide();
					$('#scanResultView').hide();
					$('#conversationView').show();
				},
				function(errorCode)
				{
					// Disconnect and give user feedback.
					app.disconnect('Failed to set descriptor.');

					// Write debug information to console.
					console.log('Error: writeDescriptor: ' + errorCode + '.');
				}
			);

			function failedToEnableNotification(erroCode)
			{
				console.log('BLE enableNotification error: ' + errorCode);
			};

			device.enableNotification(
				app.RBL_CHAR_TX_UUID,
				app.receivedMessage,
				function(errorcode)
				{
					console.log('BLE enableNotification error: ' + errorCode);
				}
			);

			$('#scanResultView').hide();
			$('#conversationView').show();
		}

		function onServiceFailure(errorCode)
		{
			// Disconnect and show an error message to the user.
			app.disconnect('Device is not compatible');

			// Write debug information to console.
			console.log('Error reading services: ' + errorCode);
		}

		app.setLoadingLabel('Identifying services...');

		// Connect to the appropriate BLE service
		device.readServices(
			[app.RBL_SERVICE_UUID],
			onServiceSuccess,
			onServiceFailure
		);
	}

	function onConnectFailure(errorCode)
	{
		app.disconnect('Disconnected from device');

		// Show an error message to the user
		console.log('Error ' + errorCode);
	}

	// Stop scanning
	evothings.easyble.stopScan();

	// Connect to our device
	console.log('Identifying service for communication');
	device.connect(onConnectSuccess, onConnectFailure);
};

app.startScan = function()
{
	app.disconnect();

	console.log('Scanning started...');

	app.devices = {};

	var htmlString =
		'<img src="img/loader_small.gif" style="display:inline; vertical-align:middle">' +
		'<p style="display:inline">   Scanning...</p>';

	$('#scanResultView').append($(htmlString));

	$('#scanResultView').show();

	function onScanSuccess(device)
	{
		if (device.name != null)
		{
			app.devices[device.address] = device;

			console.log('Found: ' + device.name + ', ' + device.address + ', ' + device.rssi);

			var htmlString =
				'<div class="deviceContainer" onclick="app.connectTo(\'' +
					device.address + '\')">' +
				'<p class="deviceName">' + device.name + '</p>' +
				'<p class="deviceAddress">' + device.address + '</p>' +
				'</div>';

			$('#scanResultView').append($(htmlString));
		}
	};

	function onScanFailure(errorCode)
	{
		// Show an error message to the user
		app.disconnect('Failed to scan for devices.');

		// Write debug information to console.
		console.log('Error ' + errorCode);
	};

	evothings.easyble.reportDeviceOnce(true);
	evothings.easyble.startScan(onScanSuccess, onScanFailure);

	$('#startView').hide();
};

app.receivedMessage = function(data)
{
	if (app.connected)
	{
		// Convert data to String
		var message = String.fromCharCode.apply(null, new Uint8Array(data));

		// Update conversation
		app.updateConversation(message, true);

		console.log('Message received: ' + message);
	}
	else
	{
		// Disconnect and show an error message to the user.
		app.disconnect('Disconnected');

		// Write debug information to console
		console.log('Error - No device connected.');
	}
};

app.updateConversation = function(message, isRemoteMessage)
{
	// Insert message into DOM model.
	var timeStamp = new Date().toLocaleString();

	var htmlString =
		'<div class="messageContainer">' +
			'<div class="messageTimestamp">' +
				'<p class="messageTimestamp">' + timeStamp + '</p>' +
			'</div>' +
			'<div class="messageIcon">' +
				'<img class="messageIcon" src="img/' +
					(isRemoteMessage == true ? 'arduino.png' : 'apple.png') + '">' +
			'</div>' +
			'<div class="message">' +
				'<p class="message">' + message +'</p>'+
			'</div>' +
		'</div>';
		// $('#conversation').append($(htmlString));
		
	//	$('#conversation').append("cool");
		// $('#conversation').append($(htmlString).valueOf());

	console.log(htmlString);

	if(htmlString.indexOf("0000") !== -1){
	}
	else if(htmlString.indexOf("1000") !== -1){
		$('#conversation').append("A </br>");
	}
	else if(htmlString.indexOf("0100") !== -1){
		$('#conversation').append("B </br>");
	}
	else if(htmlString.indexOf("0010") !== -1){
		$('#conversation').append("C </br>");
	}
	else if(htmlString.indexOf("0001") !== -1){
		$('#conversation').append("Hi Everyone, ");
	}
	else if(htmlString.indexOf("1100") !== -1){
		$('#conversation').append("Unlike ");
	}
	else if(htmlString.indexOf("1010") !== -1){
		$('#conversation').append("normal people ");
	}
	else if(htmlString.indexOf("1001") !== -1){
		$('#conversation').append("I ");
	}
	else if(htmlString.indexOf("0110") !== -1){
		$('#conversation').append("do not ");
	}
	else if(htmlString.indexOf("0101") !== -1){
		$('#conversation').append("have the gift of speaking ");
	}
	else if(htmlString.indexOf("0011") !== -1){
		$('#conversation').append("felt uncomfortable ");
	}
	else if(htmlString.indexOf("1110") !== -1){
		$('#conversation').append("talking to ");
	}
	else if(htmlString.indexOf("1101") !== -1){
		$('#conversation').append("But now ");
	}
	else if(htmlString.indexOf("1011") !== -1){
		$('#conversation').append("can express myself to the world ");
	}
	else if(htmlString.indexOf("0111") !== -1){
		$('#conversation').append("All thanks to ");
	}
	else if(htmlString.indexOf("1111") !== -1){
		$('#conversation').append("this technology.");
	}
	else{

	}
	




		// 	$('html,body').animate(
		// 		{
		// 			scrollTop: $('#disconnectButton').offset().top
		// 		},
		// 		'slow'
		// 	);
		};



app.disconnect = function(errorMessage)
{
	if (errorMessage)
	{
		navigator.notification.alert(errorMessage, function() {});
	}

	app.connected = false;
	app.device = null;

	// Stop any ongoing scan and close devices.
	evothings.easyble.stopScan();
	evothings.easyble.closeConnectedDevices();

	console.log('Disconnected');

	$('#loadingView').hide();
	$('#scanResultView').hide();
	$('#scanResultView').empty();
	$('#conversation').empty();
	$('#conversationView').hide();

	$('#startView').show();
};
