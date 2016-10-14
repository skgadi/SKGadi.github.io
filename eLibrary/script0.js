var PageName = window.location.pathname.split("/").pop().toLowerCase();
var dbFileName;
if (PageName == "" || PageName == "index.html")
	dbFileName = "SKGadiReferenceManagerArticles";
else if (PageName == "viewbooks.html")
	dbFileName = "SKGadiReferenceManagerBooks";
else if (PageName == "viewmypublications.html")
	dbFileName = "SKGadiReferenceManagerMyPublications";

var TopicsFileName = "SKGadiReferenceManagerTopics";
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

function AuthIsLoaded() {
	$("#LoadMainHTMLHere").load('body0.html', LoadedMainHTML());
}
function LoadedMainHTML () {
	checkAuth();
}
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
		$(".Authrozed ").css('display', 'inline');
		loadSheetsApi();
	} else {
		authorizeDiv.style.display = 'inline';
		$(".Authrozed ").css('display', 'none');
	}
	$(".HideWhenLoaded").css("display", "none");
	$(".ShowWhenLoaded").css("display", "block");
	ApplyLayout();
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

function listFiles() {
	var request = gapi.client.drive.files.list({
			'q' : 'name=\'' + dbFileName + '\'',
			'pageSize' : 10,
			'fields' : "nextPageToken, files(id, name)"
		});

	request.execute(function (resp) {
		var files = resp.files;
		if (files && files.length > 0) {
			$.notify("Please wait while we process your database. If it is taking longer than usual, please refresh.", "success");
			GetBibTexString(files[0].id);
			VerifyTopicsDb();
		} else {
			//appendPre('No files found.');
			$.notify("No database file is found. Please wait while we create one for you.", "error");
			SpreadsheetCreate()
		}
	});
}

function VerifyTopicsDb() {
	var request = gapi.client.drive.files.list({
			'q' : 'name=\'' + TopicsFileName + '\'',
			'pageSize' : 10,
			'fields' : "nextPageToken, files(id, name)"
		});
	request.execute(function (resp) {
		var files = resp.files;
		if (files && files.length > 0) {
			GetTopicsFromDB(files[0].id);
		} else {
			$.notify("No topics database is found.", "error");
			CreateTopicsDatabase()
		}
	});
}

function GetBibTexString(id) {
	gapi.client.sheets.spreadsheets.values.get({
		spreadsheetId : id,
		range : 'db!A1:A',
	}).then(function (response) {
		var range = response.result;
		if (range.values.length > 0) {
			//if ((range.values.length) > 1)
			for (i = 0; i < ((range.values.length) - 1); i++) {
				/*var row = range.values[i];
				appendPre(row[0] + ', ' + row[3]);*/
				bibstring += '\n' + range.values[i + 1][0] + '\n';
			}
			(new BibtexDisplay()).displayBibtex(bibstring, $("#bibtex_display"));
			loadExtras();
			//appendPre(bibstring);
		} else {
			//appendPre('No data found.');
		}
	});
	reset();
}
function GetTopicsFromDB(id) {
	//Setting the topics
	gapi.client.sheets.spreadsheets.values.get({
		spreadsheetId : id,
		range : 'topics!A1:B',
	}).then(function (response) {
		var range = response.result;
		$('#topicselect').html("");
		if (range.values.length > 0) {
			$('#topicselect').append("<option value=''>All topics</option>");
			for (i = 0; i < ((range.values.length) - 1); i++) {
				var row = range.values[i + 1];
				$('#topicselect').append("<option value='" + row[1] + "'>" + row[0] + "</option>");
			}
			reset();
			//appendPre(bibstring);
		} else {
			$('#topicselect').append("<option value=''>Topics: NA</option>");
			//appendPre('No data found.');
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
			"title" : dbFileName
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
		wait(5000);
		listFiles();
		$.notify("a set of database files are created in your google drive.", "success");
	});
}

function CreateTopicsDatabase() {
	gapi.client.sheets.spreadsheets.create({
		"properties" : {
			"title" : TopicsFileName
		},
		sheets : [{
				"properties" : {
					"sheetId" : 0,
					"title" : "topics"
				},
				"data" : [{
						"startRow" : 0,
						"startColumn" : 0,
						"rowData" : [{
								"values" : [{
										"userEnteredValue" : {
											"stringValue" : "head"
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
											"stringValue" : "values"
										}
									}
								]
							}
						]
					}, {
						"startRow" : 1,
						"startColumn" : 0,
						"rowData" : [{
								"values" : [{
										"userEnteredValue" : {
											"stringValue" : "Mathematics"
										}
									}
								]
							}
						]
					}, {
						"startRow" : 1,
						"startColumn" : 1,
						"rowData" : [{
								"values" : [{
										"userEnteredValue" : {
											"stringValue" : "stability|mathematics|Statistics"
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
		wait(5000);
		VerifyTopicsDb();
		$.notify("The topics database is created in your google drive.", "success");
	}); ;
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

$(document).keyup(function(e) {
    if (e.keyCode == 27) {
        reset();
    }
    if ((e.keyCode == 115) || (e.keyCode == 83)) {
        $("#searchbar").focus();
    }
});