var clip = function (el) {
	var range = document.createRange();
	range.selectNodeContents(el);
	var sel = window.getSelection();
	sel.removeAllRanges();
	sel.addRange(range);
};

function copyToClipboard(elem) {
	// create hidden text element, if it doesn't already exist
	var targetId = "_hiddenCopyText_";
	var isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
	var origSelectionStart,
	origSelectionEnd;
	if (isInput) {
		// can just use the original source element for the selection and copy
		target = elem;
		origSelectionStart = elem.selectionStart;
		origSelectionEnd = elem.selectionEnd;
	} else {
		// must use a temporary form element for the selection and copy
		target = document.getElementById(targetId);
		if (!target) {
			var target = document.createElement("textarea");
			target.style.position = "absolute";
			target.style.left = "-9999px";
			target.style.top = "0";
			target.id = targetId;
			document.body.appendChild(target);
		}
		target.textContent = elem.textContent;
	}
	// select the content
	var currentFocus = document.activeElement;
	target.focus();
	target.setSelectionRange(0, target.value.length);

	// copy the selection
	var succeed;
	try {
		succeed = document.execCommand("copy");
	} catch (e) {
		succeed = false;
	}
	// restore original focus
	if (currentFocus && typeof currentFocus.focus === "function") {
		currentFocus.focus();
	}

	if (isInput) {
		// restore prior selection
		elem.setSelectionRange(origSelectionStart, origSelectionEnd);
	} else {
		// clear temporary content
		target.textContent = "";
	}
	return succeed;
}

function reset() {
	$("select").each(function () {
		localStorage.setItem($(this).attr("id"), "");
		$(this).val("");
	});
	$("#searchbar").val("");
	$("#searchbar").trigger('change');
}

$(document).ready(function () {
	// OUTER-LAYOUT
	$('body').layout({
		center__paneSelector : ".outer-center",
		west__paneSelector : ".outer-west",
		east__paneSelector : ".outer-east",
		west__size : 200,
		east__size : '50%',
		spacing_open : 5 // ALL panes
	,
		spacing_closed : 10 // ALL panes
		//,	north__spacing_open:	0
		//,	south__spacing_open:	0
	,
		north__maxSize : 200,
		south__maxSize : 200,
		north__size : 24,
		south__size : 22,
		north__resizable : false,
		south__resizable : false
	});
	
	$('#NavBarHere').load('nav.html');
});

function DisplayItem(id) {
	$('#PutHTMLHere').empty();
	$('#PutHTMLHere').html($('#' + id).html());
}

function OpenDOI(DOI) {
	window.open('http://dx.doi.org/' + $(DOI).text(), '_blank');
}

function OpenURL(URL) {
	window.open($(URL).text(), '_blank');
}

function OpenFile(BIBKey) {
	window.open("https://mega.nz/#fm/search/" + BIBKey, '_blank');
}

function SelectTheText(Code) {
	clip($(Code)[0]);
}

function CopyTheText(Code) {
	copyToClipboard(Code);
	$.notify("This BibTeX code is coppied to your clipboard", "success");
}

