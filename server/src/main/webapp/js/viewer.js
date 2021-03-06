var $body = document.getElementsByTagName("body")[0];
var $menuBar = document.getElementById("MenuBar");
var $toc = document.getElementById("Toc");
var $tocList = document.getElementById("TocList");
var $scrollToc = document.getElementById("ScrollToc");
var $barToc = document.getElementById("BarToc");
var $stage = document.getElementById("Stage");
var $single = document.getElementById("Single");
var $dual = document.getElementById("Dual");
var $continue = document.getElementById("Continue");
var $loading = document.getElementById("Loading");
var $prev = document.getElementById("Prev");
var $next = document.getElementById("Next");
var $scrollX = document.getElementById("ScrollX");
var $scrollY = document.getElementById("ScrollY");
var $barX = document.getElementById("BarX");
var $barY = document.getElementById("BarY");
var $tocButton = document.getElementById("TocButton");
var $singleButton = document.getElementById("SingleButton");
var $dualButton = document.getElementById("DualButton");
var $continueButton = document.getElementById("ContinueButton");
var $heightButton = document.getElementById("HeightButton");
var $widthButton = document.getElementById("WidthButton");
var $hqButton = document.getElementById("HqButton");
var $displayCurrent = document.getElementById("Current");
var $displayScale = document.getElementById("Scale");
var $displayKeyword = document.getElementById("Keyword");
var $image = new Array();
var $imageScale = new Array();
var $pageLoaded;
var $pageCurrent;
var $pageRetry;
var $loadingOn = false;
var $animation;
var $rotate = 0;
var $hqImage = new Array();
var $hqTimer;
var $hqLoaded;
var $hqCurrent;
var $hqScale;
var $hqRetry;
var $tocOn = false;
var $dragOn = false;
var $dragX = 0;
var $dragY = 0;
var $pivotX;
var $pivotY;

setTimeout(function() {
	_Init();
}, 1);

function _Init() {
	window.onresize = _Resize;

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

	var aList = $menuBar.getElementsByTagName("a");

	for (var i = 0; i < aList.length; i++) {
		var img = aList[i].getElementsByTagName("img")[0];

		img.addEventListener("mouseover", function(event) {_ClassAppend('over', event);});
		img.addEventListener("mouseout", function(event) {_ClassRemove('over', event);});
	}

	try {
		$toc.addEventListener("DOMMouseScroll", function (event) {_Wheel('toc', event.detail * 40);});
		$stage.addEventListener("DOMMouseScroll", function (event) {_Wheel('stage', event.detail * 40);});
	}
	catch (e) {}

	var stageHeight = $body.clientHeight - $menuBar.clientHeight;

	$stage.style.top =  $menuBar.clientHeight + "px";
	$stage.style.width = $body.clientWidth + "px";
	$stage.style.height = stageHeight + "px";
	if ($pageType == "single") {
		$singleButton.className = "click";
		$single.style.display = "block";
	}
	else if ($pageType == "dual") {
		$dualButton.className = "click";
		$dual.style.display = "block";
	}
	else {
		$continueButton.className = "click";
		$continue.style.display = "block";
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
	$displayScale.value = $fillType == "fixed" ? "100" : $fillType;

	var scale = _CalcScale();
	var pageList = $continue.getElementsByTagName("div");

	for (var i = 1; i <= $total; i++) {
		var page = pageList[i - 1];

		page.style.width = Math.ceil(($rotate == 0 || $rotate == 180 ? $defaultWidth[i] : $defaultHeight[i]) * scale / 100) + "px";
		page.style.height = Math.ceil(($rotate == 0 || $rotate == 180 ? $defaultHeight[i] : $defaultWidth[i]) * scale / 100) + "px";
	}

	$body.style.visibility = "visible";

	_Load(1);
}

function _Load(pageNo) {
	if ($pageLoaded == false) {
		return;
	}

	$pageLoaded = false;
	$pageCurrent = pageNo;

	$prev.style.display = "none";
	$next.style.display = "none";

	_Loading();

	if ($pageType == "single" || $pageType == "dual") {
		var page = $pageType == "single" ? $single : $dual;
		var canvasList = page.getElementsByTagName("canvas");

		while (canvasList.length > 0) {
			page.removeChild(canvasList[0]);
		}

		var scale = _CalcScale(pageNo);

		_Page(pageNo, scale);

		pageNo++;

		if (pageNo <= $total) {
			_Page(pageNo, scale);
		}

		if ($pageCurrent >= 2) {
			_Page($pageCurrent - 1, scale);
		}
		if ($pageType == "dual") {
			if ($pageCurrent >= 3) {
				_Page($pageCurrent - 2, scale);
			}
			if ($pageCurrent + 2 <= $total) {
				_Page($pageCurrent + 2, scale);
			}
			if ($pageCurrent + 3 <= $total) {
				_Page($pageCurrent + 3, scale);
			}
		}

		$pivotX = 0;
		$pivotY = 0;
	}
	else {
		// TODO: 여기부터 정리...
//		var autoPageNo = false;

//		if (pageNo == undefined) {
//			pageNo = parseInt($total * $barY.offsetTop / ($scrollY.clientHeight - $barY.clientHeight));

//			if (isNaN(pageNo) || pageNo < 1) {
//				pageNo = 1;
//			}
//			else if (pageNo > $total) {
//				pageNo = $total;
//			}

//			autoPageNo = true;
//		}

		var canvasList = $continue.getElementsByTagName("canvas");
		var removeList = new Array();

		for (var i = 0; i < canvasList.length; i++) {
			var canvas = canvasList[i];
			var div = canvas.parentNode;

			if ((div.offsetTop + div.clientHeight < -$continue.offsetTop) || (div.offsetTop > -$continue.offsetTop + $stage.clientHeight)) {
				removeList.push(canvas);
			}
		}

		while (removeList.length > 0) {
			var canvas = removeList.pop();

			canvas.parentNode.removeChild(canvas);
		}

//		if (autoPageNo == true) {
			var page = document.getElementById("Page" + pageNo);
			var scroll = -$continue.offsetTop + page.offsetTop;

			if (scroll + page.clientHeight > $continue.clientHeight) {
				scroll = $continue.clientHeight - page.clientHeight;
			}

			$continue.style.marginTop = -scroll + "px";
//		}
//		else {
//			while (document.getElementById("Page" + pageNo).offsetTop > -$continue.offsetTop) {
//				if (pageNo > 1) {
//					pageNo--;
//				}
//				else {
//					break;
//				}
//			}

//			while (true) {
//				var page = document.getElementById("Page" + pageNo);

//				if (page.offsetTop + page.clientHeight < -$continue.offsetTop) {
//					if (pageNo < $total) {
//						pageNo++;

//						continue;
//					}
//				}

//				break;
//			}
//		}

		var scale = _CalcScale();
		var bottom = -$continue.offsetTop + $stage.clientHeight;

		while (pageNo <= $total && (-$continue.offsetTop + document.getElementById("Page" + pageNo).offsetTop) <= bottom) {
			_Page(pageNo, scale);

			pageNo++;
		}

		if ($pageCurrent > 1) {
			_Page($pageCurrent - 1, scale);
		}
		if (pageNo <= $total) {
			_Page(pageNo, scale);
		}
	}

	/*
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

		var canvasList = $2pages.getElementsByTagName("canvas");

		while (canvasList.length > 0) {
			$2pages.removeChild(canvasList[0]);
		}

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
			if ($image[pageNext] == undefined || $imageScale[pageNext] != scale) {
				if ($image[pageNext] == undefined) {
					$image[pageNext] = new Image();
				}

				$imageScale[pageNext] = scale;
				$image[pageNext].src = "/get.do?id=" + $id + "&p=" + pageNext + "&s=" + scale;
			}
		}

		if (pageNo >= 3) {
			$preload.src = "/preload.do?id=" + $id + "&p=" + (pageNo - 2);
		}
		if (pageNo >= 2) {
			$preload.src = "/preload.do?id=" + $id + "&p=" + (pageNo - 1);
		}
		if (pageNo + 2 <= $total) {
			$preload.src = "/preload.do?id=" + $id + "&p=" + (pageNo + 2);
		}
		if (pageNo + 3 <= $total) {
			$preload.src = "/preload.do?id=" + $id + "&p=" + (pageNo + 3);
		}
	}
	else {
		// TODO:
		var autoPageNo = false;

		if (pageNo == undefined) {
			pageNo = parseInt($total * $barY.offsetTop / ($scrollY.clientHeight - $barY.clientHeight));

			if (isNaN(pageNo) || pageNo < 1) {
				pageNo = 1;
			}
			else if (pageNo > $total) {
				pageNo = $total;
			}

			autoPageNo = true;
		}

		var canvasList = $continue.getElementsByTagName("canvas");

		while (canvasList.length > 0) {
alert(canvasList.length);
			var canvas = canvasList[0];
			var div = canvas.parentNode;

			if ((div.offsetTop + div.clientHeight < -$continue.offsetTop) || (div.offsetTop > -$continue.offsetTop + $stage.clientHeight)) {
				div.removeChild(canvas);
			}
		}

		if (autoPageNo == true) {
			$continue.style.marginTop = -document.getElementById("Page" + pageNo).offsetTop + "px";
		}
		else {
			while (document.getElementById("Page" + pageNo).offsetTop > -$continue.offsetTop) {
				if (pageNo > 1) {
					pageNo--;
				}
				else {
					break;
				}
			}

			while (true) {
				var page = document.getElementById("Page" + pageNo);

				if (page.offsetTop + page.clientHeight < -$continue.offsetTop) {
					if (pageNo < $total) {
						pageNo++;

						continue;
					}
				}

				break;
			}
		}

		var scale = _CalcScale();

		while (pageNo <= $total && document.getElementById("Page" + pageNo).offsetTop <= -$continue.offsetTop + $stage.clientHeight) {
			if ($image[pageNo] == undefined || $imageScale[pageNo] != scale) {
				if ($image[pageNo] == undefined) {
					$image[pageNo] = new Image();
				}

				$imageScale[pageNo] = scale;
				$image[pageNo].src = "/get.do?id=" + $id + "&p=" + pageNo + "&s=" + scale;
			}

			pageNo++;
		}

		if ($pageCurrent > 1) {
			$preload.src = "/preload.do?id=" + $id + "&p=" + ($pageCurrent - 1);
		}
		if (pageNo < $total) {
			$preload.src = "/preload.do?id=" + $id + "&p=" + (pageNo + 1);
		}
	}
	*/

	$pageRetry = 0;

	setTimeout(_LoadCallback, 1);
}

function _LoadCallback() {
	var complete = false;

	if ($pageType == "single") {
		if ($image[$pageCurrent].complete == true) {
			complete = true;
		}
	}
	else if ($pageType == "dual") {
		if ($image[$pageCurrent].complete == true && ($pageCurrent == $total || $image[$pageCurrent + 1].complete == true)) {
			complete = true;
		}
	}
	else {
		complete = true;

		var pageNo = $pageCurrent;
		var bottom = -$continue.offsetTop + $stage.clientHeight;

		while (pageNo <= $total && -$continue.offsetTop + document.getElementById("Page" + pageNo).offsetTop <= bottom && complete == true) {
			if ($image[pageNo].complete == false) {
				complete = false;

				break;
			}

			pageNo++;
		}
	}

	if (complete == true) {
		$pageLoaded = true;

		if ($pageCurrent != $displayCurrent.value) {
			_Load(parseInt($displayCurrent.value));
		}
		else {
			_Resize();
		}
	}
	else {
		$pageRetry++;

		if ($pageRetry >= 30000) {
			alert("페이지 가져오기에 실패하였습니다.\n\n- 변환 서버에 장애가 발생하였습니다.\n\n관리자에게 문의하시기 바랍니다.");
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
	if ($pageLoaded == true) {
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

	$toc.style.height = (stageHeight - 10) + "px";
	$stage.style.left = tocWidth + "px";
	$stage.style.width = stageWidth + "px";
	$stage.style.height = stageHeight + "px";

	if ($pageLoaded != true) {
		return;
	}

	var scale = _CalcScale($pageCurrent);

	if ($pageType == "single" || $pageType == "dual") {
		var page;
		var size;

		if ($pageType == "single") {
			page = $single;
			size = 1;
		}
		else {
			page = $dual;
			size = 2;
		}

		var reload = false;

		for (var i = 0; i < size && $pageCurrent + i <= $total; i++) {
			var image = $image[$pageCurrent + i];
			var imageScale = $imageScale[$pageCurrent + i];
			var canvas = page.getElementsByTagName("canvas")[i];

			if (canvas == undefined) {
				canvas = document.createElement("canvas");
				canvas.addEventListener("mousedown", function(event) {_Drag('start', event);});
				canvas.addEventListener("mousemove", function(event) {_Drag('move', event);});
				canvas.addEventListener("mouseup", function() {_Drag('stop');});

				page.appendChild(canvas);
			}

			var canvasWidth = parseInt(($rotate == 0 || $rotate == 180 ? image.width : image.height) * scale / imageScale);
			var canvasHeight = parseInt(($rotate == 0 || $rotate == 180 ? image.height : image.width) * scale / imageScale);

			canvas.width = canvasWidth;
			canvas.height = canvasHeight;

			if (i == 0) {
				page.style.width = canvasWidth + "px";
				page.style.height = canvasHeight + "px";
			}
			else {
				canvas.style.marginLeft = "2px";

				page.style.width = (page.clientWidth + canvasWidth + 2) + "px";
				if (canvasHeight > page.clientHeight) {
					page.style.height = canvasHeight + "px";
				}
			}

			var context = canvas.getContext("2d");

			if ($rotate == 0) {
				context.drawImage(image, 0, 0, canvasWidth, canvasHeight);
			}
			else {
				context.translate(parseInt(canvasWidth / 2), parseInt(canvasHeight / 2));
				context.rotate($rotate * Math.PI / 180);
				context.drawImage(image, -parseInt(($rotate == 180 ? canvasWidth : canvasHeight) / 2), -parseInt(($rotate == 180 ? canvasHeight : canvasWidth) / 2), $rotate == 180 ? canvasWidth : canvasHeight, $rotate == 180 ? canvasHeight : canvasWidth);
			}

			if (stageHeight > canvasHeight) {
				canvas.style.marginTop = parseInt((stageHeight - canvasHeight) / 2) + "px";
			}

			if ((scale != imageScale && scale <= 300) || (scale > 300 && imageScale != 300)) {
				reload = true;
			}
		}

		var deltaWidth = stageWidth - page.clientWidth;
		var deltaHeight = stageHeight - page.clientHeight;
		var left;
		var top;

		if (deltaWidth >= 0) {
			left = undefined;

			$pivotX = 0;
		}
		else {
			if ($pivotX == 0) {
				left = 0;
			}
			else {
				left = parseInt($pivotX * scale / 100);

				if (left < stageWidth - page.clientWidth) {
					left = stageWidth - page.clientWidth;
				}
			}

			left += "px";
		}

		if (deltaHeight >= 0) {
			top = undefined;

			$pivotY = 0;
		}
		else {
			if ($pivotY == 0) {
				top = 0;
			}
			else {
				top = parseInt($pivotY * scale / 100);

				if (top < stageHeight - page.clientHeight) {
					top = stageHeight - page.clientHeight;
				}
			}

			top += "px";
		}

		page.style.marginLeft = left;
		page.style.marginTop = top;

		if (page.clientWidth > stageWidth) {
			var scrollWidth = stageWidth - (page.clientHeight > stageHeight ? 15 : 10);

			$scrollX.style.width =  scrollWidth + "px";
			$scrollX.style.display = "block";

			var barSize = parseInt(stageWidth * scrollWidth / page.clientWidth);

			if (barSize < 50) {
				barSize = 50;
			}

			$barX.style.width = barSize + "px";
			$barX.style.marginLeft = -parseInt(left * scrollWidth / page.clientWidth) + "px";
		}
		else {
			$scrollX.style.display = "none";
		}

		if (page.clientHeight > stageHeight) {
			var scrollHeight = stageHeight - (page.clientWidth > stageWidth ? 15 : 10);

			$scrollY.style.height = scrollHeight + "px";
			$scrollY.style.display = "block";

			var barSize = parseInt(stageHeight * scrollHeight / page.clientHeight);

			if (barSize < 50) {
				barSize = 50;
			}

			$barY.style.height = barSize + "px";
			$barY.style.marginTop = -parseInt(top * scrollHeight / page.clientHeight) + "px";
		}
		else {
			$scrollY.style.display = "none";
		}

		if (stageHeight > 100) {
			var height = stageHeight - 60;

			$prev.style.height = height + "px";
			$prev.style.backgroundPosition = "16px " + parseInt((height - 40) / 2) + "px";
			$prev.style.left = page.offsetLeft > 90 ? (page.offsetLeft - 60) + "px" : "30px";
			$prev.style.display = $pageCurrent > 1 ? "block" : "none";

			$next.style.height = height + "px";
			$next.style.backgroundPosition = "16px " + parseInt((height - 40) / 2) + "px";
			$next.style.right = stageWidth - (page.offsetLeft + page.clientWidth) > 90 ? (stageWidth - (page.offsetLeft + page.clientWidth) - 60) + "px" : "30px";
			$next.style.display = $pageCurrent < $total ? "block" : "none";
		}
		else {
			$prev.style.display = "none";
			$next.style.display = "none";
		}

		if (reload == true && $hqOn == true) {
			if ($hqTimer != undefined) {
				clearTimeout($hqTimer);
			}

			$hqTimer = setTimeout(_Hq, 300);
		}
	}




/*
	if ($pageType == "1page") {
		var image = $image[$pageCurrent];
		var imageScale = $imageScale[$pageCurrent];
		var canvas = $1page.getElementsByTagName("canvas")[0];

		if (canvas == undefined) {
			canvas = document.createElement("canvas");
			canvas.addEventListener("mousedown", function(event) {_Drag('start', event);});
			canvas.addEventListener("mousemove", function(event) {_Drag('move', event);});
			canvas.addEventListener("mouseup", function() {_Drag('stop');});

			$1page.appendChild(canvas);
		}

		var scale = _CalcScale($pageCurrent);

		var pageWidth = parseInt(($rotate == 0 || $rotate == 180 ? image.width : image.height) * scale / imageScale);
		var pageHeight = parseInt(($rotate == 0 || $rotate == 180 ? image.height : image.width) * scale / imageScale);

		$1page.style.width = pageWidth + "px";
		$1page.style.height = pageHeight + "px";

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
				left = parseInt($pivotX * scale / 100);

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
				top = parseInt($pivotY * scale / 100);

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
			context.translate(parseInt(pageWidth / 2), parseInt(pageHeight / 2));
			context.rotate($rotate * Math.PI / 180);
			context.drawImage(image, -parseInt(($rotate == 180 ? pageWidth : pageHeight) / 2), -parseInt(($rotate == 180 ? pageHeight : pageWidth) / 2), $rotate == 180 ? pageWidth : pageHeight, $rotate == 180 ? pageHeight : pageWidth);
		}

		$1page.style.marginLeft = left + "px";
		$1page.style.marginTop = top + "px";

		if (pageWidth > stageWidth) {
			var scrollWidth = stageWidth - (pageHeight > stageHeight ? 15 : 10);

			$scrollX.style.width =  scrollWidth + "px";
			$scrollX.style.display = "block";

			var barSize = parseInt(stageWidth * scrollWidth / pageWidth);

			if (barSize < 50) {
				barSize = 50;
			}

			$barX.style.width = barSize + "px";
			$barX.style.marginLeft = -parseInt(left * scrollWidth / pageWidth) + "px";
		}
		else {
			$scrollX.style.display = "none";
		}

		if (pageHeight > stageHeight) {
			var scrollHeight = stageHeight - (pageWidth > stageWidth ? 15 : 10);

			$scrollY.style.height = scrollHeight + "px";
			$scrollY.style.display = "block";

			var barSize = parseInt(stageHeight * scrollHeight / pageHeight);

			if (barSize < 50) {
				barSize = 50;
			}

			$barY.style.height = barSize + "px";
			$barY.style.marginTop = -parseInt(top * scrollHeight / pageHeight) + "px";
		}
		else {
			$scrollY.style.display = "none";
		}

		if (stageHeight > 100) {
			var height = stageHeight - 60;

			$prev.style.height = height + "px";
			$prev.style.backgroundPosition = "16px " + parseInt((height - 40) / 2) + "px";
			$prev.style.left = $1page.offsetLeft > 90 ? ($1page.offsetLeft - 60) + "px" : "30px";
			$prev.style.display = $pageCurrent > 1 ? "block" : "none";

			$next.style.height = height + "px";
			$next.style.backgroundPosition = "16px " + parseInt((height - 40) / 2) + "px";
			$next.style.right = stageWidth - ($1page.offsetLeft + pageWidth) > 90 ? (stageWidth - ($1page.offsetLeft + pageWidth) - 60) + "px" : "30px";
			$next.style.display = $pageCurrent < $total ? "block" : "none";
		}
		else {
			$prev.style.display = "none";
			$next.style.display = "none";
		}

		if ((scale != imageScale && scale <= 300) || (scale > 300 && imageScale != 300)) {
			if ($hqOn == true) {
				if ($hqTimer != undefined) {
					clearTimeout($hqTimer);
				}

				$hqTimer = setTimeout(_Hq, 300);
			}
		}
	}
	else if ($pageType == "2pages") {
		var leftImage = $image[$pageCurrent];
		var leftImageScale = $imageScale[$pageCurrent];
		var leftCanvas = $2pages.getElementsByTagName("canvas")[0];

		if (leftCanvas == undefined) {
			leftCanvas = document.createElement("canvas");
			leftCanvas.addEventListener("mousedown", function(event) {_Drag('start', event);});
			leftCanvas.addEventListener("mousemove", function(event) {_Drag('move', event);});
			leftCanvas.addEventListener("mouseup", function() {_Drag('stop');});

			$2pages.appendChild(leftCanvas);
		}

		var rightImage;
		var rightImage;
		var rightCanvas;

		if ($pageCurrent < $total) {
			rightImage = $image[$pageCurrent + 1];
			rightImageScale = $imageScale[$pageCurrent + 1];
			rightCanvas = $2pages.getElementsByTagName("canvas")[1];

			if (rightCanvas == undefined) {
				rightCanvas = document.createElement("canvas");
				rightCanvas.addEventListener("mousedown", function(event) {_Drag('start', event);});
				rightCanvas.addEventListener("mousemove", function(event) {_Drag('move', event);});
				rightCanvas.addEventListener("mouseup", function() {_Drag('stop');});

				$2pages.appendChild(rightCanvas);
			}
		}

		var scale = _CalcScale($pageCurrent);

		var leftCanvasWidth = parseInt(($rotate == 0 || $rotate == 180 ? leftImage.width : leftImage.height) * scale / leftImageScale);
		var leftCanvasHeight = parseInt(($rotate == 0 || $rotate == 180 ? leftImage.height : leftImage.width) * scale / leftImageScale);
		var rightCanvasWidth = $pageCurrent < $total ? parseInt(($rotate == 0 || $rotate == 180 ? rightImage.width : rightImage.height) * scale / rightImageScale) : 0;
		var rightCanvasHeight = $pageCurrent < $total ? parseInt(($rotate == 0 || $rotate == 180 ? rightImage.height : rightImage.width) * scale / rightImageScale) : 0;
		var pageWidth = leftCanvasWidth + rightCanvasWidth + 2;
		var pageHeight = Math.max(leftCanvasHeight, rightCanvasHeight);

		$2pages.style.width = pageWidth + "px";
		$2pages.style.height = pageHeight + "px";

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
				left = parseInt($pivotX * scale / 100);

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
				top = parseInt($pivotY * scale / 100);

				if (top < stageHeight - pageHeight) {
					top = stageHeight - pageHeight;
				}
			}
		}

		leftCanvas.width = leftCanvasWidth;
		leftCanvas.height = leftCanvasHeight;

		var context = leftCanvas.getContext("2d");

		if ($rotate == 0) {
			context.drawImage(leftImage, 0, 0, leftCanvasWidth, leftCanvasHeight);
		}
		else {
			context.translate(parseInt(leftCanvasWidth / 2), parseInt(leftCanvasHeight / 2));
			context.rotate($rotate * Math.PI / 180);
			context.drawImage(leftImage, -parseInt(($rotate == 180 ? leftCanvasWidth : leftCanvasHeight) / 2), -parseInt(($rotate == 180 ? leftCanvasHeight : leftCanvasWidth) / 2), $rotate == 180 ? leftCanvasWidth : leftCanvasHeight, $rotate == 180 ? leftCanvasHeight : leftCanvasWidth);
		}

		if (pageHeight > leftCanvasHeight) {
			leftCanvas.style.marginTop = parseInt((pageHeight - leftCanvasHeight) / 2) + "px";
		}

		if ($pageCurrent < $total) {
			rightCanvas.width = rightCanvasWidth;
			rightCanvas.height = rightCanvasHeight;

			context = rightCanvas.getContext("2d");

			if ($rotate == 0) {
				context.drawImage(rightImage, 0, 0, rightCanvasWidth, rightCanvasHeight);
			}
			else {
				context.translate(parseInt(rightCanvasWidth / 2), parseInt(rightCanvasHeight / 2));
				context.rotate($rotate * Math.PI / 180);
				context.drawImage(rightImage, -parseInt(($rotate == 180 ? rightCanvasWidth : rightCanvasHeight) / 2), -parseInt(($rotate == 180 ? rightCanvasHeight : rightCanvasWidth) / 2), $rotate == 180 ? rightCanvasWidth : rightCanvasHeight, $rotate == 180 ? rightCanvasHeight : rightCanvasWidth);
			}

			rightCanvas.style.marginLeft = (leftCanvasWidth + 2) + "px";
			if (pageHeight > rightCanvasHeight) {
				rightCanvas.style.marginTop = parseInt((pageHeight - rightCanvasHeight) / 2) + "px";
			}
		}

		$2pages.style.marginLeft = left + "px";
		$2pages.style.marginTop = top + "px";

		if (pageWidth > stageWidth) {
			var scrollWidth = stageWidth - (pageHeight > stageHeight ? 15 : 10);;

			$scrollX.style.width =  scrollWidth + "px";
			$scrollX.style.display = "block";

			var barSize = parseInt(stageWidth * scrollWidth / pageWidth);

			if (barSize < 50) {
				barSize = 50;
			}

			$barX.style.width = barSize + "px";
			$barX.style.marginLeft = -parseInt(left * scrollWidth / pageWidth) + "px";
		}
		else {
			$scrollX.style.display = "none";
		}

		if (pageHeight > stageHeight) {
			var scrollHeight = stageHeight - (pageWidth > stageWidth ? 15 : 10);

			$scrollY.style.height = scrollHeight + "px";
			$scrollY.style.display = "block";

			var barSize = parseInt(stageHeight * scrollHeight / pageHeight);

			if (barSize < 50) {
				barSize = 50;
			}

			$barY.style.height = barSize + "px";
			$barY.style.marginTop = -parseInt(top * scrollHeight / pageHeight) + "px";
		}
		else {
			$scrollY.style.display = "none";
		}

		if (stageHeight > 100) {
			var height = stageHeight - 60;

			$prev.style.height = height + "px";
			$prev.style.backgroundPosition = "16px " + parseInt((height - 40) / 2) + "px";
			$prev.style.left = $2pages.offsetLeft > 90 ? ($2pages.offsetLeft - 60) + "px" : "30px";
			$prev.style.display = $pageCurrent > 1 ? "block" : "none";

			$next.style.height = height + "px";
			$next.style.backgroundPosition = "16px " + parseInt((height - 40) / 2) + "px";
			$next.style.right = stageWidth - ($2pages.offsetLeft + pageWidth) > 90 ? (stageWidth - ($2pages.offsetLeft + pageWidth) - 60) + "px" : "30px";
			$next.style.display = $pageCurrent < $total ? "block" : "none";
		}
		else {
			$prev.style.display = "none";
			$next.style.display = "none";
		}

		if (((scale != leftImageScale || scale != rightImageScale) && scale <= 300) || (scale > 300 && (leftImageScale != 300 || rightImageScale != 300))) {
			if ($hqOn == true) {
				if ($hqTimer != undefined) {
					clearTimeout($hqTimer);
				}

				$hqTimer = setTimeout(_Hq, 300);
			}
		}
	}
	else {
		// TODO:
		var pageNo = $pageCurrent;

		while (pageNo <= $total && document.getElementById("Page" + pageNo).offsetTop <= -$continue.offsetTop + $stage.clientHeight) {
			var image = $image[pageNo];
			var imageScale = $imageScale[pageNo];
			var page = document.getElementById("Page" + pageNo);
			var canvas = page.getElementsByTagName("canvas")[0];

			if (canvas == undefined) {
				canvas = document.createElement("canvas");
				canvas.addEventListener("mousedown", function(event) {_Drag('start', event);});
				canvas.addEventListener("mousemove", function(event) {_Drag('move', event);});
				canvas.addEventListener("mouseup", function() {_Drag('stop');});

				page.appendChild(canvas);
			}

			var scale = _CalcScale($pageCurrent);

			var pageWidth = parseInt(($rotate == 0 || $rotate == 180 ? image.width : image.height) * scale / imageScale);
			var pageHeight = parseInt(($rotate == 0 || $rotate == 180 ? image.height : image.width) * scale / imageScale);

			page.style.width = pageWidth + "px";
			page.style.height = pageHeight + "px";

			canvas.width = pageWidth;
			canvas.height = pageHeight;

			var context = canvas.getContext("2d");

			if ($rotate == 0) {
				context.drawImage(image, 0, 0, pageWidth, pageHeight);
			}
			else {
				context.translate(parseInt(pageWidth / 2), parseInt(pageHeight / 2));
				context.rotate($rotate * Math.PI / 180);
				context.drawImage(image, -parseInt(($rotate == 180 ? pageWidth : pageHeight) / 2), -parseInt(($rotate == 180 ? pageHeight : pageWidth) / 2), $rotate == 180 ? pageWidth : pageHeight, $rotate == 180 ? pageHeight : pageWidth);
			}

			pageNo++;
		}

		pageWidth = $continue.clientWidth;
		pageHeight = $continue.clientHeight;

		if (pageWidth > stageWidth) {
			var scrollWidth = stageWidth - (pageHeight > stageHeight ? 15 : 10);;

			$scrollX.style.width =  scrollWidth + "px";
			$scrollX.style.display = "block";

			var barSize = parseInt(stageWidth * scrollWidth / pageWidth);

			if (barSize < 50) {
				barSize = 50;
			}

			$barX.style.width = barSize + "px";
			$barX.style.marginLeft = -parseInt(left * scrollWidth / pageWidth) + "px";
		}
		else {
			$scrollX.style.display = "none";
		}

		if (pageHeight > stageHeight) {
			var scrollHeight = stageHeight - (pageWidth > stageWidth ? 15 : 10);

			$scrollY.style.height = scrollHeight + "px";
			$scrollY.style.display = "block";

			var barSize = parseInt(stageHeight * scrollHeight / pageHeight);

			if (barSize < 50) {
				barSize = 50;
			}

			$barY.style.height = barSize + "px";
			$barY.style.marginTop = -parseInt(top * scrollHeight / pageHeight) + "px";
		}
		else {
			$scrollY.style.display = "none";
		}
	}
*/

	if ($tocList.clientHeight > $toc.clientHeight) {
		var scrollHeight = $toc.clientHeight - 10;
		var top =  $tocList.offsetHeight * (scrollHeight - $barToc.clientHeight) / ($tocList.clientHeight - $toc.clientHeight);

		$scrollToc.style.height = scrollHeight + "px";
		$scrollToc.style.display = "block";

		$barToc.style.height = parseInt(scrollHeight * scrollHeight / $tocList.clientHeight) + "px";
		$barToc.style.marginTop = -(($tocList.offsetTop - 5) * (scrollHeight - $barToc.clientHeight) / ($tocList.clientHeight - $toc.clientHeight))+ "px";
	}
	else {
		$scrollToc.style.display = "none";
	}
}

function _Hq() {
	if ($pageLoaded != true && $hqLoaded == false) {
		setTimeout(_Hq, 1);

		return;
	}

	$hqLoaded = false;

	$hqCurrent = $pageCurrent;
	$hqScale = _CalcScale($hqCurrent);

	if ($hqScale > 300) {
		$hqScale = 300;
	}

	$hqRetry = 0;

	$hqImage[0] = new Image();
	$hqImage[0].src = "/get.do?id=" + $id + "&p=" + $hqCurrent + "&s=" + $hqScale;

	if ($pageType == "dual" && $hqCurrent < $total) {
		$hqImage[1] = new Image();
		$hqImage[1].src = "/get.do?id=" + $id + "&p=" + ($hqCurrent + 1) + "&s=" + $hqScale;
	}
	else {
		$hqImage[1] = undefined;
	}

	setTimeout(_HqCallback, 1);
}

function _HqCallback() {
	if ($hqImage[0].complete == true && ($hqImage[1] == undefined || $hqImage[1].complete == true)) {
		$hqLoaded = true;

		var scale = _CalcScale($pageCurrent);

		if ($hqCurrent != $pageCurrent || ((scale <=300 && $hqScale != scale) || (scale > 300 && $hqScale != 300))) {
			_Hq();
		}
		else {
			$image[$hqCurrent] = $hqImage[0];
			$imageScale[$hqCurrent] = $hqScale;

			if ($hqImage[1] != undefined) {
				$image[$hqCurrent + 1] = $hqImage[1];
				$imageScale[$hqCurrent + 1] = $hqScale;
			}

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

function _Drag(action, event) {
	var page = $pageType == "single" ? $single : $dual;

	if (action == "start") {
		if (page.clientWidth > $stage.clientWidth || page.clientHeight > $stage.clientHeight) {
			$dragOn = true;
			$dragX = event.clientX;
			$dragY = event.clientY;
		}
	}
	else if (action == "move" && $dragOn == true) {
		var x = event.clientX - $dragX;
		var y = event.clientY - $dragY;

		$dragX = event.clientX;
		$dragY = event.clientY;

		var left;
		var top;

		if (page.clientWidth > $stage.clientWidth) {
			left = page.offsetLeft + x;

			if (left > 0) {
				left = 0;
			}
			else if (left < ($stage.clientWidth - page.clientWidth)) {
				left = $stage.clientWidth - page.clientWidth;
			}
		}

		if (page.clientHeight > $stage.clientHeight) {
			top = page.offsetTop + y;

			if (top > 0) {
				top = 0;
			}
			else if (top < ($stage.clientHeight - page.clientHeight)) {
				top = $stage.clientHeight - page.clientHeight;
			}
		}

		if (left != undefined) {
			page.style.marginLeft = left + "px";

			$barX.style.marginLeft = -(left * ($scrollX.clientWidth - $barX.clientWidth) / (page.clientWidth - $stage.clientWidth)) + "px";
		}
		if (top != undefined) {
			page.style.marginTop = top + "px";

			$barY.style.marginTop = -(top * ($scrollY.clientHeight - $barY.clientHeight) / (page.clientHeight - $stage.clientHeight)) + "px";
		}

		/* 스크롤바 스크롤 시 루틴...
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

		var page;

		if ($pageType == "1page") {
			page = $1page;
		}
		else if ($pageType == "2pages") {
			page = $2pages;
		}
		else {
			// TODO:
		}

		page.style.marginLeft = -($barX.offsetLeft * (page.clientWidth - $stage.clientWidth) / ($scrollX.clientWidth - $barX.clientWidth)) + "px";
		page.style.marginTop = -($barY.offsetTop * (page.clientHeight - $stage.clientHeight) / ($scrollY.clientHeight - $barY.clientHeight)) + "px";
		*/

		var scale = _CalcScale($pageCurrent);

		$pivotX = parseInt(page.offsetLeft * 100 / scale);
		$pivotY = parseInt(page.offsetTop * 100 / scale);
	}
	else if (action == "stop") {
		$dragOn = false;
	}
	else if (action == "conditional_stop") {
		if ((event.clientX <= ($tocOn == true ? $toc.clientWidth + 1 : 0)) || (event.clientX >= $body.clientWidth) || (event.clientY <= $menuBar.clientHeight) || (event.clientY >= $body.clientHeight)) {
			$dragOn = false;
		}
	}

	if (page.clientWidth > $stage.clientWidth || page.clientHeight > $stage.clientHeight) {
		if ($dragOn == true) {
			page.style.cursor = "url('/img/stage/grabbing.cur'), pointer";
		}
		else {
			page.style.cursor = "url('/img/stage/grab.cur'), pointer";
		}
	}
	else {
		page.style.cursor = "default";
	}
}

function _Wheel(target, delta) {
	var content;
	var bar;
	var areaHeight;
	var contentHeight;
	var scrollHeight;

	if (target == "toc") {
		content = $tocList;
		bar = $barToc;
		areaHeight = $toc.clientHeight - 10;
		contentTop = content.offsetTop - 5;
		scrollHeight = $scrollToc.clientHeight;
	}
	else {
		content = $pageType == "single" ? $single : $pageType == "dual" ? $dual : $continue;
		bar = $barY;
		areaHeight = $stage.clientHeight;
		contentTop = content.offsetTop;
		scrollHeight = $scrollY.clientHeight;
	}

	if (content.clientHeight > areaHeight) {
		var top = contentTop - delta;
		var boundary = content.clientHeight - areaHeight;

		if (top < -boundary) {
			top = -boundary;
		}
		else if (top > 0) {
			top = 0;
		}

		content.style.marginTop = top + "px";
		bar.style.marginTop = -(top * (scrollHeight - bar.clientHeight) / boundary) + "px";
	}

	return false;
}

function _CalcScale(pageNo) {
	var scale;

	if ($fillType == "height") {
		if ($pageType == "single") {
			scale = parseInt($stage.clientHeight * 100 / ($rotate == 0 || $rotate == 180 ? $defaultHeight[pageNo] : $defaultWidth[pageNo]));
		}
		else if ($pageType == "dual") {
			scale = parseInt($stage.clientHeight * 100 / ($rotate == 0 || $rotate == 180 ? Math.max($defaultHeight[pageNo], pageNo < $total ? $defaultHeight[pageNo + 1] : 0) : Math.max($defaultWidth[pageNo], pageNo < $total ? $defaultWidth[pageNo + 1] : 0)));
		}
		else {
			scale = parseInt($stage.clientHeight * 100 / ($rotate == 0 || $rotate == 180 ? $defaultHeight[1] : $defaultWidth[1]));
		}
	}
	else if ($fillType == "width") {
		if ($pageType == "single") {
			scale = parseInt($stage.clientWidth * 100 / ($rotate == 0 || $rotate == 180 ? $defaultWidth[pageNo] : $defaultHeight[pageNo]));
		}
		else if ($pageType == "dual") {
			scale = parseInt($stage.clientWidth * 100 / ($rotate == 0 || $rotate == 180 ? $defaultWidth[pageNo] + (pageNo < $total ? $defaultWidth[pageNo + 1] : 0) : ($defaultHeight[pageNo] + (pageNo < $total ? $defaultHeight[pageNo + 1] : 0))));
		}
		else {
			scale = parseInt($stage.clientWidth * 100 / ($rotate == 0 || $rotate == 180 ? $maxWidth : $maxHeight));
		}
	}
	else {
		scale = parseInt($displayScale.value);
	}

	if (scale > 500) {
		scale = 500;
	}
	else if (scale < 50) {
		scale = 50;
	}

	return scale;
}

function _ClassAppend(name, event) {
	var constructor = event.constructor.toString();
	var target;

	if (constructor.indexOf("function MouseEvent()") == 0 || constructor.indexOf("[object MouseEvent]") == 0) {
		target = event.currentTarget != undefined ? event.currentTarget : event.srcElement;
	}
	else {
		target = event;
	}

	while (target.tagName != "A") {
		target = target.parentNode;
	}

	target.className += " "+name;
}

function _ClassRemove(name, event) {
	var constructor = event.constructor.toString();
	var target;

	if (constructor.indexOf("function MouseEvent()") == 0 || constructor.indexOf("[object MouseEvent]") == 0) {
		target = event.currentTarget != undefined ? event.currentTarget : event.srcElement;
	}
	else {
		target = event;
	}

	while (target.tagName != "A") {
		target = target.parentNode;
	}

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

function _Page(pageNo, scale) {
	if ($image[pageNo] == undefined || $imageScale[pageNo] != scale) {
		if ($image[pageNo] == undefined) {
			$image[pageNo] = new Image();
		}

		$imageScale[pageNo] = scale;
		$image[pageNo].src = "/get.do?id=" + $id + "&p=" + pageNo + "&s=" + scale;
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

function Move(type, goTo) {
	var step = $pageType == "single" ? 1 : 2;
	var pageNo;

	if (type == "fast_prev") {
		pageNo = parseInt($displayCurrent.value) - step;
	}
	else if (type == "prev") {
		pageNo = parseInt($pageCurrent) - step;
	}
	else if (type == "next") {
		pageNo = parseInt($pageCurrent) + step;
	}
	else if (type == "fast_next") {
		pageNo = parseInt($displayCurrent.value) + step;
	}
	else {
		pageNo = goTo != undefined ? goTo : parseInt($displayCurrent.value);
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
	var canvasList;

	if ($pageType == "single") {
		_ClassRemove("click", $singleButton);

		$single.style.display = "none";

		canvasList = $single.getElementsByTagName("canvas");
	}
	else if ($pageType == "dual") {
		_ClassRemove("click", $dualButton);

		$dual.style.display = "none";

		canvasList = $dual.getElementsByTagName("canvas");
	}
	else {
		_ClassRemove("click", $continueButton);

		$continue.style.display = "none";

		canvasList = $continue.getElementsByTagName("canvas");
	}

	while (canvasList.length > 0) {
		canvasList[0].parentNode.removeChild(canvasList[0]);
	}

	if (type == "single") {
		_ClassAppend("click", $singleButton);

		$single.style.display = "block";
	}
	else if (type == "dual") {
		_ClassAppend("click", $dualButton);

		$dual.style.display = "block";
	}
	else {
		_ClassAppend("click", $continueButton);

		$continue.style.display = "block";
	}

	$pageType = type;

	_Load($pageCurrent);

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
