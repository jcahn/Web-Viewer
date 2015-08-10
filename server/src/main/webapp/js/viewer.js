var $body = document.getElementsByTagName("body")[0];
var $menuBar = document.getElementById("MenuBar");
var $toc = document.getElementById("Toc");
var $stage = document.getElementById("Stage");
var $1page = document.getElementById("1page");
var $2pages = document.getElementById("2pages");
var $continue = document.getElementById("continue");
var $loading = document.getElementById("Loading");
var $prev = document.getElementById("Prev");
var $next = document.getElementById("Next");
var $scrollX = document.getElementById("ScrollX");
var $scrollY = document.getElementById("ScrollY");
var $barX = document.getElementById("BarX");
var $barY = document.getElementById("BarY");
var $tocButton = document.getElementById("TocButton");
var $1pageButton = document.getElementById("1pageButton");
var $2pagesButton = document.getElementById("2pagesButton");
var $continueButton = document.getElementById("ContinueButton");
var $heightButton = document.getElementById("HeightButton");
var $widthButton = document.getElementById("WidthButton");
var $hqButton = document.getElementById("HqButton");
var $displayCurrent = document.getElementById("Current");
var $displayScale = document.getElementById("Scale");
var $displayKeyword = document.getElementById("Keyword");

var $image = new Array();
var $imageScale = new Array();
var $preload = new Image();

var $pageLoad;
var $pageCurrent;
var $pageRetry;
var $loadingOn = false;
var $animation;
var $rotate = 0;
var $hqImage;
var $hqTimer;
var $hqLoad;
var $hqCurrent;
var $hqScale;
var $hqRetry;
var $dragOn = false;
var $dragX = 0;
var $dragY = 0;
var $pivotX;
var $pivotY;


	var $mediaWidth;
	var $mediaWeight;







var showPrint = false;
var showTts = false;
var current;
var scale;
var imageWidth;
var imageHeight;
var loaded;

var opacity;
var clearImage = new Image();
var clearCurrent;
var clearScale;
var clearRetry;
var timer;






try {
	window.addEventListener("load", _Init);
	window.addEventListener("resize", _Resize);

	$toc.addEventListener("DOMMouseScroll", function (event) {_Wheel('toc', event.detail * 40);});
	$stage.addEventListener("DOMMouseScroll", function (event) {_Wheel('stage', event.detail * 40);});
}
catch (e) {
	window.attachEvent("onload", _Init);
	window.attachEvent("onresize", _Resize);
}

function _Init() {
	setTimeout(function() {
		if (typeof $body.onselectstart != "undefined") {
			$body.onselectstart = function() {
				return false;
			};
		}
		else if (typeof $body.style.MozUserSelect != "undefined") {
			$body.style.MozUserSelect = "none";
		}
		else {
			$body.onmousedown = function() {
				return false;
			};
			$body.style.cursor = "default";
		}

		var tocWidth = $tocOn == true ? $toc.clientWidth + 1 : 0;
		var menuBarHeight = $menuBar.clientHeight;

		$toc.style.display = $tocOn == true ? "block" : "none";
		$stage.style.top = $toc.style.top = menuBarHeight + "px";
		$stage.style.left = tocWidth + "px";
		$stage.style.width = ($body.clientWidth - tocWidth) + "px";
		$stage.style.height = ($body.clientHeight - menuBarHeight) + "px";
		if ($tocOn == true) {
			$tocButton.className = "click";
		}
		if ($pageType == "1page") {
			$1pageButton.className = "click";
			$1page.display = "block";
		}
		else if ($pageType == "2pages") {
			$2pagesButton.className = "click";
			$2pages.display = "block";
		}
		else {
			$continueButton.className = "click";
			$continue.display = "block";
		}
		if ($fillType == "height") {
			$heightButton.className = "click";
		}
		else if ($fillType == "width") {
			$widthButton.className = "click";
		}
		if ($hqOn == true) {
			$hqButton.className = "click";
		}
		$displayScale.value = $fillType == "fixed" ? 100 : $fillType;

		$body.style.visibility = "visible";

		_Load(1);
	}, 1);
}

function _Load(pageNo) {
	if ($pageLoad == false) {
		return;
	}

	$pageLoad = false;
	$pageCurrent = pageNo;

	$prev.style.display = "none";
	$next.style.display = "none";

	_Loading();

	if ($pageType == "1page") {
		$pivotX = 0;
		$pivotY = 0;

		var canvas = $1page.getElementsByTagName("canvas")[0];

		if (canvas != undefined) {
			$1page.removeChild(canvas);
		}

		var scale = _CalcScale(pageNo);

		if ($image[pageNo] == undefined || $imageScale[pageNo] != scale) {
			if ($image[pageNo] == undefined) {
				$image[pageNo] = new Image();
			}

			$imageScale[pageNo] = scale;
			$image[pageNo].src = "/get.do?id=" + $id + "&p=" + pageNo + "&s=" + scale;
		}

		if (pageNo > 1) {
			$preload.src = "/preload.do?id=" + $id + "&p=" + (pageNo - 1);
		}
		if (pageNo < $total) {
			$preload.src = "/preload.do?id=" + $id + "&p=" + (pageNo + 1);
		}
	}
	else if ($pageType == "2pages") {
		$pivotX = 0;
		$pivotY = 0;

		var scale = _CalcScale(pageNo);

		if ($image[pageNo] == undefined || $imageScale[pageNo] != scale) {
			if ($image[pageNo] == undefined) {
				$image[pageNo] = new Image();
			}

			$imageScale[pageNo] = scale;
			$image[pageNo].src = "/get.do?id=" + $id + "&p=" + pageNo + "&s=" + scale;
		}

		var pageNext = pageNo + 1;

		if (pageNext <= $total) {
			scale = _CalcScale(pageNext);

			if ($image[pageNext] == undefined || $imageScale[pageNext] != scale) {
				if ($image[pageNext] == undefined) {
					$image[pageNext] = new Image();
				}

				$imageScale[pageNext] = scale;
				$image[pageNext].src = "/get.do?id=" + $id + "&p=" + pageNext + "&s=" + scale;
			}
		}

		pageNext = pageNo - 2;

		if (pageNext >= 1) {
			$preload.src = "/preload.do?id=" + $id + "&p=" + pageNext;
		}
		if (pageNext + 1 >= 1) {
			$preload.src = "/preload.do?id=" + $id + "&p=" + (pageNext + 1);
		}
		if (pageNext + 4 <= $total) {
			$preload.src = "/preload.do?id=" + $id + "&p=" + (pageNext + 4);
		}
		if (pageNext + 5 <= $total) {
			$preload.src = "/preload.do?id=" + $id + "&p=" + (pageNext + 5);
		}
	}
	else if ($pageType == "continue") {
		// TODO: 구현해야 함
		var canvasList = $stage.getElementsByTagName("canvas");

		if (canvasList.length > 0) {
			for (var i = 0; i < canvasList.length; i++) {
				canvasList[i].parentNode.removaChild(canvasList[i]);
			}
		}
	}

	$pageRetry = 0;

	setTimeout(_LoadCallback, 1);
}

function _LoadCallback() {
	var complete = false;

	if ($pageType == "1page") {
		if ($image[$pageCurrent].complete == true) {
			complete = true;
		}
	}
	else if ($pageType == "2pages") {
		if ($image[$pageCurrent].complete == true && ($pageCurrent + 1 > $total || $image[$pageCurrent + 1].complete == true)) {
			complete = true;
		}
	}
	else if ($pageType == "continue") {
		// TODO: 구현해야 함
	}

	if (complete == true) {
		$pageLoad = true;

		if ($pageCurrent != $displayCurrent.value) {
			_Load($displayCurrent.value);
		}
		else {
			_Resize();
		}
	}
	else {
		$pageRetry++;

		if ($pageRetry >= 30000) {
			// TODO: 닫기 버튼 없는 레이어드 경고창 띄우고 종료 처리

			alert("페이지 가져오기에 실패하였습니다.\n\n- 변환 서버에 장애가 발생하였습니다.\n\n관리자에게 문의하시기 바랍니다.\n\n02-788-4150");
		}
		else {
			setTimeout(_LoadCallback, 1);
		}
	}
}

function _Loading() {
	$animation = [0, 0, -4, -8, -12];

	if ($loadingOn == true) {
		return;
	}

	$loadingOn = true;

	setTimeout(_LoadingAnimation, 50);
}

function _LoadingAnimation() {
	if ($pageLoad == true) {
		$loading.style.display = "none";
		$loadingOn = false;

		return;
	}

	for (var i = 1; i <= 4; i++) {
		var size = $animation[i] <= 10 ? $animation[i] : 20 - $animation[i];

		if (size < 0) {
			size = 0;
		}

		var ball = document.getElementById("Ball" + i);

		ball.style.borderWidth = size + "px";
		ball.style.marginLeft = -size + "px";
		ball.style.marginTop = -size + "px";

		$animation[i]++

		if ($animation[i] >= 20) {
			$animation[i] = -5;
		}
	}

	$loading.style.display = "block";

	setTimeout(_LoadingAnimation, 30);
}

function _Resize() {
	var tocWidth = $tocOn == true ? $toc.clientWidth + 1 : 0;
	var stageWidth = $body.clientWidth - tocWidth;
	var stageHeight = $body.clientHeight - $menuBar.clientHeight;

	$stage.style.left = tocWidth + "px";
	$stage.style.width = stageWidth + "px";
	$stage.style.height = stageHeight + "px";

	if ($pageLoad != true) {
		return;
	}

	if ($pageType == "1page") {
		var image = $image[$pageCurrent];
		var imageScale = $imageScale[$pageCurrent];
		var page = document.getElementById("1page");
		var canvas = page.getElementsByTagName("canvas")[0];

		if (canvas == undefined) {
			canvas = document.createElement("canvas");

			page.appendChild(canvas);
		}

		var scale = _CalcScale($pageCurrent);

		var pageWidth = parseInt(($rotate == 0 || $rotate == 180 ? image.width : image.height) * scale / imageScale);
		var pageHeight = parseInt(($rotate == 0 || $rotate == 180 ? image.height : image.width) * scale / imageScale);

		page.style.width = pageWidth + "px";
		page.style.height = pageHeight + "px";

		var deltaWidth = stageWidth - pageWidth;
		var deltaHeight = stageHeight - pageHeight;
		var left;
		var top;

		if (deltaWidth >= 0) {
			left = parseInt(deltaWidth / 2);

			$pivotX = 0;
		}
		else {
			if ($pivotX == 0) {
				left = 0;
			}
			else {
				left = $pivotX * scale / 100;

				if (left < stageWidth - pageWidth) {
					left = stageWidth - pageWidth;
				}
			}
		}

		if (deltaHeight >= 0) {
			top = parseInt(deltaHeight / 2);

			$pivotY = 0;
		}
		else {
			if ($pivotY == 0) {
				top = 0;
			}
			else {
				top = $pivotY * scale / 100;

				if (top < stageHeight - pageHeight) {
					top = stageHeight - pageHeight;
				}
			}
		}

		canvas.width = pageWidth;
		canvas.height = pageHeight;

		var context = canvas.getContext("2d");

		if ($rotate == 0) {
			context.drawImage(image, 0, 0, pageWidth, pageHeight);
		}
		else {
			context.translate(pageWidth / 2, pageHeight / 2);
			context.rotate($rotate * Math.PI / 180);
			context.drawImage(image, -($rotate == 180 ? pageWidth : pageHeight) / 2, -($rotate == 180 ? pageHeight : pageWidth) / 2, $rotate == 180 ? pageWidth : pageHeight, $rotate == 180 ? pageHeight : pageWidth);
		}

		page.style.marginLeft = left + "px";
		page.style.marginTop = top + "px";

		if (pageWidth > stageWidth) {
			var scrollWidth = stageWidth - (pageHeight > stageHeight ? 15 : 10);;

			$scrollX.style.width =  scrollWidth + "px";
			$scrollX.style.display = "block";

			$barX.style.width = parseInt(stageWidth * scrollWidth / pageWidth) + "px";
			$barX.style.marginLeft = parseInt(-left * scrollWidth / pageWidth) + "px";
		}
		else {
			$scrollX.style.display = "none";
		}

		if (pageHeight > stageHeight) {
			var scrollHeight = stageHeight - (pageWidth > stageWidth ? 15 : 10);

			$scrollY.style.height = scrollHeight + "px";
			$scrollY.style.display = "block";

			$barY.style.height = parseInt(stageHeight * scrollHeight / pageHeight) + "px";
			$barY.style.marginTop = parseInt(-top * scrollHeight / pageHeight) + "px";
		}
		else {
			$scrollY.style.display = "none";
		}

		if (stageHeight > 100) {
			var height = stageHeight - 60;

			$prev.style.height = height + "px";
			$prev.style.backgroundPositionY = parseInt((height - 40) / 2) + "px";
			$prev.style.left = page.offsetLeft > 90 ? (page.offsetLeft - 60) + "px" : "30px";
			$prev.style.display = $pageCurrent > 1 ? "block" : "none";

			$next.style.height = height + "px";
			$next.style.backgroundPositionY = parseInt((height - 40) / 2) + "px";
			$next.style.right = stageWidth - (page.offsetLeft + pageWidth) > 90 ? (stageWidth - (page.offsetLeft + pageWidth) - 60) + "px" : "30px";
			$next.style.display = $pageCurrent < $total ? "block" : "none";
		}
		else {
			$prev.style.display = "none";
			$next.style.display = "none";
		}

		if (scale != imageScale && scale <= 300) {
			if ($hqOn == true) {
				if ($hqTimer != undefined) {
					clearTimeout($hqTimer);
				}

				$hqTimer = setTimeout(_Hq, 300);
			}
		}
	}
	else if ($pageType == "2pages") {

	}
	else if ($pageType == "continue") {

	}

	
	
	
	
	
	
/*
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
	*/
}

function _Hq() {
	if ($pageLoad != true && $hqLoad == false) {
		setTimeout(_Hq, 1);

		return;
	}

	$hqLoad = false;

	$hqCurrent = $pageCurrent;
	$hqScale = _CalcScale($pageCurrent);
	$hqRetry = 0;
	
	$hqImage = new Image();
	$hqImage.src = "/get.do?id=" + $id + "&p=" + $pageCurrent + "&s=" + $hqScale;

	setTimeout(_HqCallback, 1);
}

function _HqCallback() {
	if ($hqImage.complete == true) {
		$hqLoad = true;

		if ($hqCurrent != $pageCurrent || $hqScale != _CalcScale($pageCurrent)) {
			_Hq();
		}
		else {
			$image[$pageCurrent] = $hqImage;
			$imageScale[$pageCurrent] = $hqScale;

			_Resize();
		}
	}
	else {
		$hqRetry++;

		if ($hqRetry < 30000) {
			setTimeout(_HqCallback, 1);
		}
	}
}

function _Keyword(type) {
	if (type == "on") {
		if ($displayKeyword.value == "검색어") {
			$displayKeyword.value = "";
		}
	}
	else {
		if ($displayKeyword.value == "") {
			$displayKeyword.value = "검색어";
		}
	}
}

function _Drag(action) {
	var event = event ? event : window.event;

	if (action == "start") {
		var target = event.currentTarget != undefined ? event.currentTarget : event.srcElement;

		if (target.id == "1page") {
			$dragOn = true;
			$dragX = event.clientX;
			$dragY = event.clientY;
		}
		else if (target.id == "2pages") {
			
		}
		else {
			
		}
	}
	else if (action == "move" && $dragOn == true) {
		var x = $dragX - event.clientX;
		var y = $dragY - event.clientY;

		$dragX = event.clientX;
		$dragY = event.clientY;

		if (x != 0) {
			var left = $barX.offsetLeft + x;

			if (left < 0) {
				left = 0;
			}
			else {
				if (left > $scrollX.clientWidth - $barX.clientWidth) {
					left = $scrollX.clientWidth - $barX.clientWidth;
				}
			}

			$barX.style.marginLeft = left + "px";
		}

		if (y != 0) {
			var top = $barY.offsetTop + y;

			if (top < 0) {
				top = 0;
			}
			else {
				if (top > $scrollY.clientHeight - $barY.clientHeight) {
					top = $scrollY.clientHeight - $barY.clientHeight;
				}
			}

			$barY.style.marginTop = top + "px";
		}

		$1page.style.marginLeft = (-($barX.offsetLeft * ($1page.clientWidth - $stage.clientWidth) / ($scrollX.clientWidth - $barX.clientWidth))) + "px";
		$1page.style.marginTop = (-($barY.offsetTop * ($1page.clientHeight - $stage.clientHeight) / ($scrollY.clientHeight - $barY.clientHeight))) + "px";

		$pivotX = parseInt($1page.offsetLeft * 100 / _CalcScale($pageCurrent));
		$pivotY = parseInt($1page.offsetTop * 100 / _CalcScale($pageCurrent));
	}
	else if (action == "stop") {
		$dragOn = false;
	}
	else if (action == "conditional_stop") {
		if ((event.clientX <= ($tocOn == true ? $toc.clientWidth + 1 : 0)) || (event.clientX >= $body.clientWidth) || (event.clientY <= $menuBar.clientHeight) || (event.clientY >= $body.clientHeight)) {
			$dragOn = false;
		}
	}
}

function _Wheel(target, delta) {
	if (target == "toc") {
		alert("TOC");
	}
	else {
		if ($pageType == "1page") {
			if ($1page.clientHeight > $stage.clientHeight) {
				var top = parseInt($1page.style.marginTop) - delta;
				var boundary = $1page.clientHeight - $stage.clientHeight;

				if (top < -boundary) {
					top = -boundary;
				}
				else if (top > 0) {
					top = 0;
				}

				$1page.style.marginTop = top + "px";

				$barY.style.marginTop = (-top * ($scrollY.clientHeight - $barY.clientHeight) / boundary) + "px";
			}
		}
		else if ($pageType == "2pages") {

		}
		else {
			
		}

	}

	return false;
}



















/*
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
*/
















function _CalcScale(pageNo) {
	var tocWidth = $tocOn == true ? $toc.clientWidth + 1 : 0;
	var stageWidth = $body.clientWidth - tocWidth;
	var stageHeight = $body.clientHeight - $menuBar.clientHeight;
	var scale = parseInt($displayScale.value);

	if ($pageType == "1page" || $pageType == "2pages") {
		if ($fillType == "height") {
			scale = parseInt(stageHeight / ($rotate == 0 || $rotate == 180 ? $defaultHeight[pageNo] : $defaultWidth[pageNo]) * 100);
		}
		else if ($fillType == "width") {
			scale = parseInt($pageType == "2pages" ? stageWidth / 2 : stageWidth / ($rotate == 0 || $rotate == 180 ? $defaultWidth[pageNo] : $defaultHeight[pageNo]) * 100);
		}
	}
	else if ($pageType == "continue") {
		// TODO: 구현해야 함.
	}

	if (scale > 500) {
		scale = 500;
	}
	else if (scale < 50) {
		scale = 50;
	}

	return scale;
}

function _ClassAppend(name, target) {
	var event = event ? event : window.event;
	var target = target != undefined ? target : event.currentTarget != undefined ? event.currentTarget : event.srcElement;

	target.className += " "+name;
}

function _ClassRemove(name, target) {
	var event = event ? event : window.event;
	var target = target != undefined ? target : event.currentTarget != undefined ? event.currentTarget : event.srcElement;

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

// --------------------------------------------------

function TocTrigger() {
	$tocOn = $tocOn == false;

	if ($tocOn == true) {
		_ClassAppend("click", $tocButton);

		$toc.style.display = "block";
	}
	else {
		_ClassRemove("click", $tocButton);

		$toc.style.display = "none";
	}

	_Resize();

	return false;
}

function PrintPopup() {
	alert("프린터 팝업창");

	return false;
}

function Move(type) {
	var event = event ? event : window.event;
	var target = (target != undefined ? target : event.currentTarget != undefined ? event.currentTarget : event.srcElement).parentNode;
	var pageNo;

	if (type == "prev") {
		if (target.id == "MenuBar") {
			pageNo = parseInt($displayCurrent.value) - 1;
		}
		else {
			pageNo = parseInt($pageCurrent) - 1;
		}
	}
	else if (type == "next") {
		if (target.id == "MenuBar") {
			pageNo = parseInt($displayCurrent.value) + 1;
		}
		else {
			pageNo = parseInt($pageCurrent) + 1;
		}
	}
	else {
		pageNo = parseInt($displayCurrent.value);
	}

	if (isNaN(pageNo) == true || pageNo < 1) {
		pageNo = 1;
	}
	else if (pageNo > $total) {
		pageNo = $total;
	}

	$displayCurrent.value = pageNo;
	$displayCurrent.blur();

	_Load(pageNo);

	return false;
}

function PageType(type) {
	if (type == "1page") {
		_ClassAppend("click", $1pageButton);
	}
	else {
		_ClassRemove("click", $1pageButton);
	}
	if (type == "2pages") {
		_ClassAppend("click", $2pagesButton);
	}
	else {
		_ClassRemove("click", $2pagesButton);
	}
	if (type == "continue") {
		_ClassAppend("click", $continueButton);
	}
	else {
		_ClassRemove("click", $continueButton);
	}

	$pageType = type;

	_Resize();

	return false;
}

function Scale(type) {
	if (type == "height" || (type == "manual" && $displayScale.value == "height")) {
		$displayScale.value = "height";
		$fillType = "height";

		_ClassAppend("click", $heightButton);
		_ClassRemove("click", $widthButton);
	}
	else if (type == "width" || (type == "manual" && $displayScale.value == "width")) {
		$displayScale.value = "width";
		$fillType = "width";

		_ClassRemove("click", $heightButton);
		_ClassAppend("click", $widthButton);
	}
	else {
		var scale;

		if ($displayScale.value == "height" || $displayScale.value == "width") {
			scale = _CalcScale($pageCurrent);
		}
		else {
			scale = parseInt($displayScale.value);
		}

		if (type == "bigger") {
			if (scale >= 400) {
				scale = 500;
			}
			else if (scale >= 300) {
				scale = 400;
			}
			else if (scale >= 250) {
				scale = 300;
			}
			else if (scale >= 200) {
				scale = 250;
			}
			else if (scale >= 150) {
				scale = 200;
			}
			else if (scale >= 100) {
				scale = 150;
			}
			else {
				scale = 100;
			}
		}
		else if (type == "smaller"){
			if (scale <= 100) {
				scale = 50;
			}
			else if (scale <= 150) {
				scale = 100;
			}
			else if (scale <= 200) {
				scale = 150;
			}
			else if (scale <= 250) {
				scale = 200;
			}
			else if (scale <= 300) {
				scale = 250;
			}
			else if (scale <= 400) {
				scale = 300;
			}
			else {
				scale = 400;
			}
		}

		$displayScale.value = scale;
		$fillType = "fixed";

		_ClassRemove("click", $heightButton);
		_ClassRemove("click", $widthButton);
	}

	_Resize();

	return false;
}

function Rotate() {
	$rotate += 90;

	if ($rotate == 360) {
		$rotate = 0;
	}

	_Resize();

	return false;
}

function HqTrigger() {
	$hqOn = $hqOn == false;

	if ($hqOn == true) {
		_ClassAppend("click", $hqButton);

		_Hq();
	}
	else {
		_ClassRemove("click", $hqButton);
	}

	return false;
}

function TtsPopup() {
	alert("TTS 팝업창");

	return false;
}

function SearchPopup() {
	alert("검색 팝업창");

	return false;
}
