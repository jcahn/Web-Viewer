var body = document.getElementsByTagName("body")[0];
var menuBar = document.getElementById("menuBar");
var displayCurrent = document.getElementsByName("currentPage")[0];
var displayScale = document.getElementsByName("scale")[0];
var toc = document.getElementById("toc");
var stage = document.getElementById("stage");
var page = document.getElementById("page");
var scrollX = document.getElementById("scrollX");
var scrollY = document.getElementById("scrollY");
var barX = document.getElementById("barX");
var barY = document.getElementById("barY");
var prev = document.getElementById("prev");
var next = document.getElementById("next");
var loading = document.getElementById("loading");

var showPrint = false;
var showTts = false;
var current;
var scale;
var image = new Image();
var imageWidth;
var imageHeight;
var retry;
var loaded;
var dragging = false;
var dragX = 0;
var dragY = 0;
var opacity;
var animation;
var clearImage = new Image();
var clearCurrent;
var clearScale;
var clearRetry;
var timer;

try {
	window.addEventListener("load", init);
	window.addEventListener("resize", resize);

	toc.addEventListener("DOMMouseScroll", function (event) {wheel('toc', event.detail * 40);});
	stage.addEventListener("DOMMouseScroll", function (event) {wheel('stage', event.detail * 40);});
}
catch (e) {
	window.attachEvent("onload", init);
	window.attachEvent("onresize", resize);
}

function init() {
	setTimeout(function() {
		var tocWidth = showToc == true ? toc.clientWidth + 1 : 0;
		var menuBarHeight = menuBar.clientHeight;

		toc.style.display = showToc == true ? "block" : "none";
		stage.style.top = toc.style.top = menuBarHeight + "px";
		stage.style.left = tocWidth + "px";
		stage.style.width = (body.clientWidth - tocWidth) + "px";
		stage.style.height = (body.clientHeight - menuBarHeight) + "px";

		if (showToc == true) {
			document.getElementById("tocButton").className = "click";
		}

		if (pageType == "1page") {
			document.getElementById("1pageButton").className = "click";
		}
		else if (pageType == "2pages") {
			document.getElementById("2pagesButton").className = "click";
		}
		else if (pageType == "continue") {
			document.getElementById("continueButton").className = "click";
		}

		if (fillType == "height") {
			document.getElementById("heightButton").className = "click";
		}
		else if (pageType == "width") {
			document.getElementById("widthButton").className = "click";
		}

		if (hq == true) {
			document.getElementById("hqButton").className = "click";
		}

		body.style.visibility = "visible";

		_load(1);
	}, 1);
}

function resize() {
	setTimeout(_resize, 1);
}

function _load(pageNo) {
	if (loaded == false) {
		return;
	}

	loaded = false;

	if (timer != undefined) {
		clearTimeout(timer);

		timer = undefined;
	}

	_loading();

	current = pageNo;

	_info();
}

function _info() {
	var request = new XMLHttpRequest();

	request.onload = function() {
		if (request.statusText != "OK") {
			var error;

			if (request.statusText == "Not Found") {
				error = "문서 정보 확인 중 오류가 발생하였습니다.\n\n- 열람하려는 문서가 존재하지 않거나, 문서 파일에 오류가 있습니다.\n\n관리자에게 문의하시기 바랍니다.\n\n02-788-4150";
			}
			else if (request.statusText == "Internal Server Error") {
				error = "문서 정보 확인 중 오류가 발생하였습니다.\n\n- 변환 서버에 장애가 발생하였습니다.\n\n관리자에게 문의하시기 바랍니다.\n\n02-788-4150";
			}

			// TODO: 닫기 버튼 없는 레이어드 경고창 띄우고 종료 처리

			alert(error);

			return;
		}

		var dimension = request.responseText.split("x");

		defaultWidth = parseInt(dimension[0]);
		defaultHeight = parseInt(dimension[1]);

		if (isNaN(defaultWidth) == true || isNaN(defaultHeight) == true || defaultWidth <= 0 || defaultWidth >=10000 || defaultHeight <= 0 || defaultHeight >= 10000) {
			// TODO: 닫기 버튼 없는 레이어드 경고창 띄우고 종료 처리

			alert("문서 정보 확인에 실패하였습니다.\n\n- 변환 서버에 장애가 발생하였습니다.\n\n관리자에게 문의하시기 바랍니다.\n\n02-788-4150");

			return;
		}

		var tocWidth = showToc == true ? toc.clientWidth + 1 : 0;
		var stageWidth = body.clientWidth - tocWidth;
		var stageHeight = body.clientHeight - menuBar.clientHeight;

		if (fillType == "height") {
			scale = parseInt(stageHeight / defaultHeight * 100);
		}
		else if (fillType == "width") {
			scale = parseInt(stageWidth / defaultWidth * 100);
		}

		if (scale > 500) {
			scale = 500;
		}
		else if (scale < 50) {
			scale = 50;
		}

		displayScale.value = scale;

		image.src = "/get.do?id=" + id + "&p=" + current + "&w=" + parseInt(defaultWidth * scale / 100) + "&h=" + parseInt(defaultHeight * scale / 100);
		retry = 0;

		setTimeout(_loadCallback, 1);
	};
	request.onerror = function() {
		alert("서버 오류가 발생하였습니다.\n관리자에게 문의하시기 바랍니다.\n\n02-788-4150");
	};
	request.open("get", "/info.do?id=" + id + "&p=" + current, true);
	request.send(null);
}

function _loadCallback() {
	if (image.complete == true) {
		loaded = true;

		if (current != displayCurrent.value) {
			_load(displayCurrent.value);
		}
		else {
			_resize();
		}
	}
	else {
		retry++;

		if (retry >= 30000) {
			// TODO: 닫기 버튼 없는 레이어드 경고창 띄우고 종료 처리

			alert("페이지 가져오기에 실패하였습니다.\n\n- 변환 서버에 장애가 발생하였습니다.\n\n관리자에게 문의하시기 바랍니다.\n\n02-788-4150");

			return;
		}
		else {
			setTimeout(_loadCallback, 1);
		}
	}
}

function _resize() {
	var tocWidth = showToc == true ? toc.clientWidth + 1 : 0;
	var stageWidth = body.clientWidth - tocWidth;
	var stageHeight = body.clientHeight - menuBar.clientHeight;

	stage.style.left = tocWidth + "px";
	stage.style.width = stageWidth + "px";
	stage.style.height = stageHeight + "px";

	if (loaded != true) {
		return;
	}

	var newScale;

	if (fillType == "height") {
		newScale = parseInt(stageHeight / defaultHeight * 100);
	}
	else if (fillType == "width") {
		newScale = parseInt(stageWidth / defaultWidth * 100);
	}
	else if (fillType == "fixed") {
		newScale = displayScale.value;
	}

	if (newScale > 500) {
		newScale = 500;
	}
	else if (newScale < 50) {
		newScale = 50;
	}

	displayScale.value = newScale;

	var pageWidth = parseInt(image.width * newScale / scale);
	var pageHeight = parseInt(image.height * newScale / scale);

	page.width = pageWidth;
	page.height = pageHeight;

	var deltaWidth = stageWidth - pageWidth;
	var deltaHeight = stageHeight - pageHeight;
	var left;
	var top;

	if (deltaWidth >= 0) {
		left = parseInt(deltaWidth / 2);
	}
	else {
		if (page.offsetLeft >= 0) {
			left = 0;
		}
		else if (pageWidth + page.offsetLeft >= stageWidth) {
			left = page.offsetLeft;
		}
		else {
			left = stageWidth - pageWidth;
		}
	}

	if (deltaHeight >= 0) {
		top = parseInt(deltaHeight / 2);
	}
	else {
		if (page.offsetTop >= 0) {
			top = 0;
		}
		else if (pageHeight + page.offsetTop >= stageHeight) {
			top = page.offsetTop;
		}
		else {
			top = stageHeight - pageHeight;
		}
	}

	page.style.marginLeft = left + "px";
	page.style.marginTop = top + "px";

	page.getContext("2d").drawImage(image, 0, 0, pageWidth, pageHeight);

	if (pageWidth > stageWidth) {
		var scrollWidth = stageWidth - (pageHeight > stageHeight ? 53 : 36);

		scrollX.style.width =  scrollWidth + "px";
		scrollX.style.display = "block";

		barX.style.width = parseInt(stageWidth * scrollWidth / pageWidth) + "px";
		barX.style.marginLeft = parseInt(-left * scrollWidth / pageWidth) + "px";
	}
	else {
		scrollX.style.display = "none";
	}

	if (pageHeight > stageHeight) {
		var scrollHeight = stageHeight - (pageWidth > stageWidth ? 53 : 36);

		scrollY.style.height = scrollHeight + "px";
		scrollY.style.display = "block";

		barY.style.height = parseInt(stageHeight * scrollHeight / pageHeight) + "px";
		barY.style.marginTop = parseInt(-top * scrollHeight / pageHeight) + "px";
	}
	else {
		scrollY.style.display = "none";
	}

	if (stageHeight > 100) {
		var height = stageHeight - 60;

		prev.style.height = height + "px";
		prev.style.backgroundPositionY = parseInt((height - 40) / 2) + "px";
		prev.style.left = page.offsetLeft > 90 ? (page.offsetLeft - 60) + "px" : "30px";
		prev.style.display = current > 1 ? "block" : "none";

		next.style.height = height + "px";
		next.style.backgroundPositionY = parseInt((height - 40) / 2) + "px";
		next.style.right = stageWidth - (page.offsetLeft + pageWidth) > 90 ? (stageWidth - (page.offsetLeft + pageWidth) - 60) + "px" : "30px";
		next.style.display = current < total ? "block" : "none";
	}
	else {
		prev.style.display = "none";
		next.style.display = "none";
	}

	if (scale != newScale) {
		if (hq == true) {
			if (timer != undefined) {
				clearTimeout(timer);
			}

			timer = setTimeout(_clear, 300);
		}
		else {
			scale = newScale;
		}
	}
}

function _loading() {
	animation = [0, 0, -4, -8, -12];

	setTimeout(_loadingAnimation, 50);
}

function _loadingAnimation() {
	if (loaded == true) {
		loading.style.display = "none";

		return;
	}

	for (var i = 1; i <= 4; i++) {
		var size = animation[i] <= 10 ? animation[i] : 20 - animation[i];

		if (size < 0) {
			size = 0;
		}

		var ball = document.getElementById("ball" + i);

		ball.style.borderWidth = size + "px";
		ball.style.marginLeft = parseInt(-size / 2) + "px";
		ball.style.marginTop = parseInt(-size / 2) + "px";

		animation[i]++

		if (animation[i] >= 20) {
			animation[i] = -5;
		}
	}

	loading.style.display = "block";

	setTimeout(_loadingAnimation, 30);
}

function _clear() {
	if (loaded != true) {
		timer = setTimeout(_clear, 1);

		return;
	}

	clearCurrent = displayCurrent.value;
	clearScale = displayScale.value;
	clearImage.src = "/get.do?id=" + id + "&p=" + clearCurrent + "&w=" + parseInt(image.width * displayScale.value / scale) + "&h=" + parseInt(image.height * displayScale.value / scale);
	clearRetry = 0;

	timer = setTimeout(_clearCallback, 1);
}

function _clearCallback() {
	if (clearImage.complete == true) {
		if (clearCurrent != displayCurrent.value) {
			return;
		}
		else {
			scale = clearScale;
			image = clearImage;

			_resize();
		}
	}
	else {
		clearRetry++;

		if (clearRetry < 30000) {
			timer = setTimeout(_clearCallback, 1);
		}
	}
}

function _classAppend(target, name) {
	target.className += " "+name;
}

function _classRemove(target, name) {
	var token = target.className.split(" ");
	var className = new Array();
	var size = 0;

	for (var i = 0; i < token.length; i++) {
		if (token[i] != name) {
			className[size] = token[i];
			size++;
		}
	}

	if (size == 0) {
		target.className = "";
	}
	else {
		target.className = className.join(" ");
	}
}

function _keyword(type) {
	var string = document.getElementsByName("keyword")[0];

	if (type == "on") {
		if (string.value == "검색어") {
			string.value = "";
		}
	}
	else if (type == "blur") {
		if (string.value == "") {
			string.value = "검색어";
		}
	}
}

// --------------------------------------------------

function tocTrigger() {
	var target = document.getElementById("tocButton");

	if (showToc == true) {
		showToc = false;

		_classRemove(target, "click");

		toc.style.display = "none";
	}
	else if (showToc == false) {
		showToc = true;

		_classAppend(target, "click");

		toc.style.display = "block";
	}

	_resize();

	return false;
}

function move(pageNo) {
	if (isNaN(pageNo) == true) {
		// TODO: 디자인해야 함

		alert("1 ~ " + total + " 사이의 값이어야 합니다."+pageNo);
	}
	else {
		if (pageNo < 1) {
			pageNo = 1;
		}
		else if (pageNo > total) {
			pageNo = total;
		}

		displayCurrent.value = pageNo;

		_load(pageNo);
	}

	return false;
}

function magnification(target) {
	var value = parseInt(target.value);

	if (isNaN(value) == true) {
		// TODO: 디자인해야 함

		alert("50 ~ 300 사이의 값이어야 합니다.");

		target.value = scale;
	}
	else {
		if (value < 50) {
			value = 50;
		}
		else if (value > 300) {
			value = 300;
		}

		fillType = "fixed";

		_classRemove(document.getElementById("heightButton"), "click");
		_classRemove(document.getElementById("widthButton"), "click");

		_resize();
	}

	return false;
}

function pageTrigger(type) {
	var page1 = document.getElementById("1pageButton");
	var page2 = document.getElementById("2pagesButton");
	var pages = document.getElementById("continueButton");

	if (type == "1page" || type == "2pages" || type == "continue") {
		if (type == "1page") {
			_classAppend(page1, "click");
			_classRemove(page2, "click");
			_classRemove(pages, "click");
		}
		else if (type == "2pages") {
			_classRemove(page1, "click");
			_classAppend(page2, "click");
			_classRemove(pages, "click");
		}
		else if (type == "continue") {
			_classRemove(page1, "click");
			_classRemove(page2, "click");
			_classAppend(pages, "click");
		}

		pageType = type;

		_resize();
	}

	return false;
}

function fillTrigger(type) {
	var height = document.getElementById("heightButton");
	var width = document.getElementById("widthButton");

	if (type == "width" || type == "height") {
		if (type == "width") {
			_classAppend(width, "click");
			_classRemove(height, "click");
		}
		else if (type == "height") {
			_classRemove(width, "click");
			_classAppend(height, "click");
		}

		fillType = type;

		_resize();
	}

	return false;
}

function rescale(type) {
	var rescale = parseInt(displayScale.value);

	if (type == "bigger") {
		if (rescale >= 300) {}
		else if (rescale >= 250) {
			rescale = 300;
		}
		else if (rescale >= 200) {
			rescale = 250;
		}
		else if (rescale >= 150) {
			rescale = 200;
		}
		else if (rescale >= 100) {
			rescale = 150;
		}
		else if (rescale >= 50) {
			rescale = 100;
		}
	}
	else if (type == "smaller") {
		if (rescale <= 50) {}
		else if (rescale <= 100) {
			rescale = 50;
		}
		else if (rescale <= 150) {
			rescale = 100;
		}
		else if (rescale <= 200) {
			rescale = 150;
		}
		else if (rescale <= 250) {
			rescale = 200;
		}
		else if (rescale <= 300) {
			rescale = 250;
		}
	}

	fillType = "fixed";
	displayScale.value = rescale;

	_classRemove(document.getElementById("heightButton"), "click");
	_classRemove(document.getElementById("widthButton"), "click");

	_resize();

	return false;
}

function hqTrigger() {
	var target = document.getElementById("hqButton");

	if (hq == true) {
		hq = false;

		_classRemove(target, "click");
	}
	else if (hq == false) {
		hq = true;

		_classAppend(target, "click");

		_clear();
	}

	return false;
}

function wheel(target, delta) {
	if (target == "toc") {
		alert("TOC");
	}
	else if (target == "stage") {
		if (page.clientHeight > stage.clientHeight) {
			var top = parseInt(page.style.marginTop) - delta;
			var boundary = page.clientHeight - stage.clientHeight;

			if (top < -boundary) {
				top = -boundary;
			}
			else if (top > 0) {
				top = 0;
			}

			page.style.marginTop = top + "px";

			barY.style.marginTop = (-top * (scrollY.clientHeight - barY.clientHeight) / boundary) + "px";
		}
	}

	return false;
}

function drag(action, event) {
	if (action == "start") {
		var target = event.currentTarget != undefined ? event.currentTarget.id : event.srcElement.id;

		if (target == "barX") {
			dragging = true;
			dragX = event.clientX;
			dragY = 0;
		}
		else if (target == "barY") {
			dragging = true;
			dragX = 0;
			dragY = event.clientY;
		}
	}
	else if (action == "stop") {
		dragging = false;
		dragX = 0;
		dragY = 0;
	}
	else if (action == "conditional_stop") {
		if ((event.clientX <= 0) || (event.clientX >= body.clientWidth) || (event.clientY <= 0) || (event.clientY >= body.clientHeight)) {
			dragging = false;
			dragX = 0;
			dragY = 0;
		}
	}
	else if (action == "move" && dragging == true) {
		if (dragX != 0) {
			var x = event.clientX - dragX;

			dragX = event.clientX;

			if (x != 0) {
				var left = barX.offsetLeft + x;

				if (left < 0) {
					left = 0;
				}
				else {
					var boundary = scrollX.clientWidth - barX.clientWidth;

					if (left > boundary) {
						left = scrollX.clientWidth - barX.clientWidth;
					}
				}

				barX.style.marginLeft = left + "px";
			}
		}
		else if (dragY != 0) {
			var y = event.clientY - dragY;

			dragY = event.clientY;

			if (y != 0) {
				var top = barY.offsetTop + y;

				if (top < 0) {
					top = 0;
				}
				else {
					var boundary = scrollY.clientHeight - barY.clientHeight;

					if (top > boundary) {
						top = scrollY.clientHeight - barY.clientHeight;
					}
				}

				barY.style.marginTop = top + "px";
			}
		}

		page.style.marginLeft = (-(barX.offsetLeft * (page.clientWidth - stage.clientWidth) / (scrollX.clientWidth - barX.clientWidth))) + "px";
		page.style.marginTop = (-(barY.offsetTop * (page.clientHeight - stage.clientHeight) / (scrollY.clientHeight - barY.clientHeight))) + "px";
	}

	return false;
}
