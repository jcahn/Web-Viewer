<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@page import="java.util.ArrayList"%>
<%
	String id = request.getParameter("id");
	int total = (Integer)request.getAttribute("total");
	int pageWidth = (Integer)request.getAttribute("width");
	int pageHeight = (Integer)request.getAttribute("height");
	@SuppressWarnings("unchecked") ArrayList<ArrayList<String>> tocList = (ArrayList<ArrayList<String>>)request.getAttribute("tocList"); // {[0] - 제목, [1] - 페이지} 반복
%>
<%out.clear();%><!DOCTYPE html>
<html>
	<head>
		<style>
			* {
				margin:0;
				padding:0;
				font-family:돋움, Dotum;
			}
			html, body {
				height:100%;
				width:100%;
			}
			body {
				overflow:hidden;
				visibility:hidden;
			}
			a {
				color:#fff;
				font-size:12px;
				font-weight:bold;
				text-decoration:none;
			}
			#menuBar {
				background-color:rgb(43,43,45);
				height:40px;
				overflow:hidden;
				width:100%;
			}
			#menuBar .tocTrigger {
				background-color:rgb(0,163,224);
				height:inherit;
				position:absolute;
				width:40px;
			}
			#menuBar .tocTrigger a {
				display:block;
				margin-left:6px;
				margin-top:15px;
			}
			#menuBar .menuGroup {
				color:#fff;
				font-size:12px;
				font-weight:bold;
				left:40px;
				position:relative;
				width:1000px;
			}
			#menuBar .menuGroup a {
				display:inline-block;
				margin-left:5px;
				margin-right:5px;
			}
			#menuBar .menuGroup input {
			}
			#toc {
				background-color:rgb(234,234,235);
				border-right:1px solid rgb(227,227,228);
				border-top:2px solid rgb(0,163,224);
				position:absolute;
				width:250px;
			}
			#stage {
				overflow:hidden;
				position:absolute;
			}
			#stage canvas {
				position:absolute;
			}
			#stage .scroll {
				border:1px solid #e0e0e0;
				display:none;
				position:absolute;
			}
			#stage .scroll.x {
				bottom:3px;
				height:15px;
				left:17px;
			}
			#stage .scroll.y {
				right:3px;
				top:17px;
				width:15px;
			}
			#stage .scroll .up {
				background-image:url(/img/scroll/up.png);
				height:8px;
				position:absolute;
				right:3px;
				top:-13px;
				width:9px;
			}
			#stage .scroll .down {
				background-image:url(/img/scroll/down.png);
				bottom:-13px;
				height:8px;
				position:absolute;
				right:3px;
				width:9px;
			}
			#stage .scroll .left {
				background-image:url(/img/scroll/left.png);
				height:9px;
				left:-13px;
				position:absolute;
				top:3px;
				width:8px;
			}
			#stage .scroll .right {
				background-image:url(/img/scroll/right.png);
				height:9px;
				position:absolute;
				right:-13px;
				top:3px;
				width:8px;
			}
			#stage .scroll .bar {
				background-color:#a0a0a0;
				opacity:0.8;
				position:absolute;
			}
			#stage .scroll .bar.x {
				height:100%;
			}
			#stage .scroll .bar.y {
				width:100%;
			}
			#stage .move {
				background-color:rgb(187,187,187);
				background-position-x:16px;
				background-repeat:no-repeat;
				opacity:0.1;
				position:absolute;
				top:30px;
				width:60px;
			}
			#stage .move.prev {
				background-image:url(/img/stage/prev.png);
				border-radius:8px 0 0 8px;
				left:35px;
			}
			#stage .move.next {
				background-image:url(/img/stage/next.png);
				border-radius:0 8px 8px 0;
				right:35px;
			}
			#stage .move a {
				display:block;
				height:100%;
				width:100%;
			}
			#loading {
				display:none;
				position:absolute;
			}
			#loading .ball {
				border:10px solid red;
				border-radius:50%;
				position:absolute;
			}
			#loading #ball1 {
				left:0;
			}
			#loading #ball2 {
				left:20px;
			}
			#loading #ball3 {
				left:40px;
			}
			#loading #ball4 {
				left:60px;
			}
		</style>
	</head>
	<body onmouseout="return drag('conditional_stop', event);">
		<div id="menuBar">
			<div class="tocTrigger"><a href="" onclick="return tocTrigger();">목차</a></div>
			<div class="menuGroup"><a href="" onclick="">인쇄</a> &nbsp;|&nbsp; <a href="" onclick="">처음</a><a href="" onclick="">이전</a> &nbsp; <input type="text" name="currentPage" value="1" style="width:50px;" onkeydown="if (event.keyCode == 13) move(this.value);"> / <%=total%> &nbsp; <a href="" onclick="">다음</a><a href="" onclick="">마지막</a> &nbsp;|&nbsp; <a href="" onclick="">연결</a><a href="" onclick="">한쪽</a><a href="" onclick="">두쪽</a> &nbsp;|&nbsp; <a href="" onclick="">가로</a><a href="" onclick="">세로</a><a href="" onclick="">확대</a><a href="" onclick="">축소</a><input type="text" name="scale" value="100" style="width:50px;" onchange="return magnification(this);">% &nbsp;|&nbsp; <input type="text" name="keyword" value="검색어" style="width:100px;"> 검색</div>
		</div>
		<div id="toc" onmousewheel="return wheel('toc', -event.wheelDelta);">
			<div>1. 목차</div>
			<div>1.1 목차1-1</div>
			<div>1.2 목차 1-2</div>
		</div>
		<div id="stage" onmousewheel="return wheel('stage', -event.wheelDelta);" onmousemove="return drag('move', event);" onmouseup="return drag('stop');">
			<canvas id="page"></canvas>
			<div id="scrollX" class="scroll x">
				<div id="barX" class="bar x" onmousedown="return drag('start', event);" onmousemove="return drag('move', event);" onmouseup="return drag('stop');"></div>
				<div class="left"></div>
				<div class="right"></div>
			</div>
			<div id="scrollY" class="scroll y">
				<div id="barY" class="bar y" onmousedown="return drag('start', event);" onmousemove="return drag('move', event);" onmouseup="return drag('stop');"></div>
				<div class="up"></div>
				<div class="down"></div>
			</div>
			<div id="prev" class="move prev" onmouseover="opacity = this.style.opacity; this.style.opacity=0.5;" onmouseout="this.style.opacity=opacity;"><a href="" onclick="return move(current-1);"></a></div>
			<div id="next" class="move next" onmouseover="opacity = this.style.opacity; this.style.opacity=0.5;" onmouseout="this.style.opacity=opacity;"><a href="" onclick="return move(current+1);"></a></div>
		</div>
		<div id="loading">
			<div id="ball1" class="ball"></div>
			<div id="ball2" class="ball"></div>
			<div id="ball3" class="ball"></div>
			<div id="ball4" class="ball"></div>
		</div>
<div id="log" style="position:absolute;top:50px;left:10px"></div>
		<script>
			var body = document.getElementsByTagName("body")[0];
			var menuBar = document.getElementById("menuBar");
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

			// --------------------------------------------------

			function init() {
				setTimeout(function() {
					var tocWidth = showToc == true ? toc.clientWidth + 1 : 0;
					var menuBarHeight = menuBar.clientHeight;

					toc.style.display = showToc == true ? "block" : "none";
					stage.style.top = toc.style.top = menuBarHeight + "px";
					stage.style.left = tocWidth + "px";
					stage.style.width = (body.clientWidth - tocWidth) + "px";
					stage.style.height = (body.clientHeight - menuBarHeight) + "px";

					body.style.visibility = "visible";

					_load(1);
				}, 1);
			}

			function resize() {
				if (loaded == true) {
					setTimeout(function() {
						_resize();
					}, 1);
				}
			}

			// --------------------------------------------------

			var current = 1;
			var image1 = new Image();
			var image2 = new Image();
			var image3 = new Image();
			var retry;
			var loaded;
			var showToc = <%=tocList != null && tocList.size() > 0 ? "true" : "false"%>;
			var fillType = "height";<%-- width, height, fixed(scale) --%>
			var scale;
			var dragging = false;
			var dragX = 0;
			var dragY = 0;
			var opacity;
			var animation;

			function _load(pageNo) {
				if (loaded == false) {
					return;
				}

				loaded = false;

				_loading();

				image1.src = "/get.do?id=<%=id%>&p=" + pageNo + "&s=1";
				image2.src = "/get.do?id=<%=id%>&p=" + pageNo + "&s=2";
				image3.src = "/get.do?id=<%=id%>&p=" + pageNo + "&s=3";
				retry = 0;

				setTimeout(function() {
					_loadCallback();
				}, 1);

				return false;
			}

			function _loadCallback() {
				if (image1.complete == true && image2.complete == true && image3.complete == true) {
					loaded = true;

					_resize();
				}
				else {
					retry++;

					if (retry >= 30000) {
						// TODO: 디자인해야 함

						alert("대기 시간 초과!!!");
					}
					else {
						setTimeout(function() {
							_loadCallback();
						}, 1);
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

				if (fillType == "height") {
					scale = stageHeight / <%=pageHeight%>;
				}
				else if (fillType == "width") {
					scale = stageWidth / <%=pageWidth%>;
				}
				else if (fillType == "fixed") {
					scale = parseInt(document.getElementsByName("scale")[0].value) / 100;
				}

				if (scale > 6.0) {
					scale = 6.0;
				}
				else if (scale < 0.5) {
					scale = 0.5;
				}

				document.getElementsByName("scale")[0].value = parseInt(scale * 100);

				var image;
				var factor;

				if (scale > 2.0) {
					image = image3;
					factor = 3.0;
				}
				else if (scale > 1.0) {
					image = image2;
					factor = 2.0;
				}
				else {
					image = image1;
					factor = 1.0;
				}

				var pageWidth = parseInt(image.width * scale / factor);
				var pageHeight = parseInt(image.height * scale / factor);

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
					next.style.display = current < <%=total%> ? "block" : "none";
				}
				else {
					prev.style.display = "none";
					next.style.display = "none";
				}

				loading.style.left = parseInt((body.clientWidth - 40) / 2) + "px";
				loading.style.top = parseInt(body.clientHeight / 2) + "px";
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

			// --------------------------------------------------

			function tocTrigger() {
				if (showToc == true) {
					showToc = false;

					toc.style.display = "none";
				}
				else {
					showToc = true;

					toc.style.display = "block";
				}

				_resize();

				return false;
			}

			function move(pageNo) {
				if (isNaN(pageNo) == true || (pageNo < 1) || (pageNo > <%=total%>)) {
					// TODO: 디자인해야 함

					alert("1 ~ <%=total%> 사이의 값이어야 합니다.");
				}
				else {
					current = pageNo;

					_load(current);
				}

				document.getElementsByName("currentPage")[0].value = current;

				return false;
			}

			function magnification(target) {
				var value = parseInt(target.value);

				if (isNaN(value) == true || (value < 50) || (value > 600)) {
					// TODO: 디자인해야 함

					alert("50 ~ 600 사이의 값이어야 합니다.");

					target.value = scale;
				}
				else {
					fillType = "fixed";

					_resize();
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
		</script>
	</body>
</html>