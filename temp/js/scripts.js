var CLIENT_ID = '283101023526-4o4jti8tl8cusebbogg2qlhpva45uon1.apps.googleusercontent.com';
var SCOPES = ["https://www.googleapis.com/auth/spreadsheets",
	"https://www.googleapis.com/auth/drive",
	"https://www.googleapis.com/auth/drive.appdata",
	"https://www.googleapis.com/auth/drive.file",
	"https://www.googleapis.com/auth/drive.metadata",
	//"https://www.googleapis.com/auth/drive.metadata.readonly",
	//"https://www.googleapis.com/auth/drive.photos.readonly",
	//"https://www.googleapis.com/auth/drive.readonly"
];
var bibstring = "";
function checkAuth() {
	gapi.auth.authorize({
		'client_id' : CLIENT_ID,
		'scope' : SCOPES.join(' '),
		'immediate' : true
	}, handleAuthResult);
}

function handleAuthResult(authResult) {
	var authorizeDiv = document.getElementById('authorize-div');
	if (authResult && !authResult.error) {
		authorizeDiv.style.display = 'none';
		loadSheetsApi();
	} else {
		authorizeDiv.style.display = 'inline';
	}
}

function handleAuthClick(event) {
	gapi.auth.authorize({
		client_id : CLIENT_ID,
		scope : SCOPES,
		immediate : false
	},
		handleAuthResult);
	return false;
}

function loadSheetsApi() {
	var discoveryUrl =
		'https://sheets.googleapis.com/$discovery/rest?version=v4';
	gapi.client.load(discoveryUrl).then(function () {
		gapi.client.load('drive', 'v3', listFiles);
	});
}

function listMajors() {
	gapi.client.sheets.spreadsheets.values.get({
		spreadsheetId : '1yM9CaM7MU78Nzgp52GpGIF5iqfiRgu4116xxsVmRXg8',
		range : 'Class Data!A2:E',
	}).then(function (response) {
		var range = response.result;
		if (range.values.length > 0) {
			appendPre('Name, Major:');
			for (i = 0; i < range.values.length; i++) {
				var row = range.values[i];
				// Print columns A and E, which correspond to indices 0 and 4.
				appendPre(row[0] + ', ' + row[4]);
			}
		} else {
			appendPre('No data found.');
		}
	}, function (response) {
		appendPre('Error: ' + response.result.error.message);
	});
}

function appendPre(message) {
	/*var pre = document.getElementById('output');
	var textContent = document.createTextNode(message + '\n');
	pre.appendChild(textContent);*/
}

function listFiles() {
	var request = gapi.client.drive.files.list({
			'q' : 'name=\'SKGadiReferenceManager\'',
			'pageSize' : 10,
			'fields' : "nextPageToken, files(id, name)"
		});

	request.execute(function (resp) {
		var files = resp.files;
		if (files && files.length > 0) {
			/*for (var i = 0; i < files.length; i++) {
			var file = files[i];
			appendPre(file.name + ' (' + file.id + ')');
			}*/
			GetBibTexString(files[0].id);
		} else {
			//appendPre('No files found.');
			SpreadsheetCreate()
		}
	});
}

function GetBibTexString(id) {
	gapi.client.sheets.spreadsheets.values.get({
		spreadsheetId : id,
		range : 'db!A1:D',
	}).then(function (response) {
		var range = response.result;
		if (range.values.length > 0) {
			//if ((range.values.length) > 1)
			for (i = 0; i < ((range.values.length)-1); i++) {
				/*var row = range.values[i];
				appendPre(row[0] + ', ' + row[3]);*/
				bibstring += '\n' + range.values[i+1][3];
			}
			(new BibtexDisplay()).displayBibtex(bibstring, $("#bibtex_display"));
			 loadExtras();
			appendPre(bibstring);
		} else {
			appendPre('No data found.');
		}
	});
}
function SpreadsheetCreate() {
	/*var URI = "https://www.googleapis.com/drive/v3/files?corpus=user&q=name%3D%22temp%22&key="+CLIENT_ID;
	$.post(URI, function (data) {

	alert(JSON.stringify(data, null, 4));
	});*/
	gapi.client.sheets.spreadsheets.create({
		"properties" : {
			"title" : "SKGadiReferenceManager"
		},
		sheets : [{
				"properties" : {
					"sheetId" : 0,
					"title" : "db"
				},
				"data" : [{
						"startRow" : 0,
						"startColumn" : 0,
						"rowData" : [{
								"values" : [{
										"userEnteredValue" : {
											"stringValue" : "title"
										}
									}
								]
							}
						]
					}, {
						"startRow" : 0,
						"startColumn" : 1,
						"rowData" : [{
								"values" : [{
										"userEnteredValue" : {
											"stringValue" : "authors"
										}
									}
								]
							}
						]
					}, {
						"startRow" : 0,
						"startColumn" : 2,
						"rowData" : [{
								"values" : [{
										"userEnteredValue" : {
											"stringValue" : "year"
										}
									}
								]
							}
						]
					}, {
						"startRow" : 0,
						"startColumn" : 3,
						"rowData" : [{
								"values" : [{
										"userEnteredValue" : {
											"stringValue" : "bibtex"
										}
									}
								]
							}
						]
					}
				]
			}
		]
	}).then(function (response) {
		listFiles();
		//console.log(JSON.parse(response.body).sheets[0].properties.title);
		//console.log(JSON.parse(response));

	});
}

/*$(document).ready(function () {
	//loadSheetsApi();
});
*/
function onSignIn(user) {
	var profile = user.getBasicProfile();
	$('#profile .name').text(profile.getName());
	$('#profile .email').text(profile.getEmail());
}
