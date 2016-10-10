var PageName = window.location.pathname.split("/").pop().toLowerCase();
var dbFileName;
if (PageName == "" || PageName == "frmbibtextoarticles.html")
	dbFileName = "SKGadiReferenceManagerArticles";
else if (PageName == "frmbibtextobooks.html")
	dbFileName = "SKGadiReferenceManagerBooks";
else if (PageName == "frmbibtextomypublications.html")
	dbFileName = "SKGadiReferenceManagerMyPublications";


function AuthIsLoaded() {
	$("#LoadMainHTMLHere").load('body1.html', LoadedMainHTML());
}
function LoadedMainHTML () {
	checkAuth();
}
var dbFileName = "SKGadiReferenceManagerArticles";
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
		$(".Authrozed ").css('display','inline');
		loadSheetsApi();
	} else {
		authorizeDiv.style.display = 'inline';
		$(".Authrozed ").css('display','none');
	}
	$(".HideWhenLoaded").css("display", "none");
	$(".ShowWhenLoaded").css("display", "block");
	$('#BibTeXCode').focus();
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
			'q' : 'name=\''+dbFileName+'\'',
			'pageSize' : 10,
			'fields' : "nextPageToken, files(id, name)"
		});

	request.execute(function (resp) {
		var files = resp.files;
		if (files && files.length > 0) {
		} else {
			$.notify("No database file is found. Please wait while we create one for you.", "error");
			SpreadsheetCreate(false)
		}
	});
}

function SpreadsheetCreate(AddItem) {
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
		$.notify("File created.", "success");
		if (AddItem)
			AddToSheet();
	});
}

function onSignIn(user) {
	var profile = user.getBasicProfile();
	$('#profile .name').text(profile.getName());
	$('#profile .email').text(profile.getEmail());
}

function AddToSheet (event) {
	//console.log($("#BibTeXCode").val());
	if ($("#BibTeXCode").val()=='')
		$.notify("BibTeX can not be empty", "alert");
	else {
		var request = gapi.client.drive.files.list({
				'q' : 'name=\''+dbFileName+'\'',
				'pageSize' : 10,
				'fields' : "nextPageToken, files(id, name)"
			});

		request.execute(function (resp) {
			var files = resp.files;
			if (files && files.length > 0) {
				gapi.client.sheets.spreadsheets.values.append({
					"spreadsheetId": files[0].id,
					"range": "db!A1",
					"valueInputOption": "USER_ENTERED",
					"insertDataOption": "INSERT_ROWS",
					"values": [[$("#BibTeXCode").val()]]
				}).then(function (response) {
					$.notify("The BibTeX is successfully added to your library.", "success");
					$("#BibTeXCode").val('');
					setTimeout(function() {
						$('#BibTeXCode').focus();
					}, 0);
				});
			} else {
				$.notify("No database file is found. Please wait while we create one for you.", "error");
				SpreadsheetCreate(true);
			}
		});
	}
}
