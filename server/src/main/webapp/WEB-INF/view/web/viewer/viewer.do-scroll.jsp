<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%
	String id = "DOC001";
	int total = 100;
%>
<%out.clear();%><!DOCTYPE html>
<html>
	<head></head>
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
/*		canvas, img {
			image-rendering: optimizeQuality;
			image-rendering: -moz-crisp-edges;
			image-rendering: -webkit-optimize-contrast;
			image-rendering: optimize-contrast;
			-ms-interpolation-mode: nearest-neighbor;
		}*/
		#menuBar_icon {
			font-size:12px;
			font-weight:bold;
			color:#fff;
		}
		#menuBar_icon a {
			color:#fff;
			text-decoration:none;
		}
		#menuBar_icon input {
			border:0;
			background-color:none;
			line-height:14px;
			height:20px;
		}
	</style>
	<body>
		<!-- 메뉴 바 -->
		<div id="menuBar" style="position:absolute;z-index:100;opacity:0.4;height:30px;top:10px;" onmouseover="commandMenuBar('on');" onmouseout="commandMenuBar('off');">
			<div style="position:absolute;width:100%;height:100%;background-color:#000;opacity:0.65;filter:alpha(opacity=65);">
				<img src="/img/menuBar/left.png" style="margin-left:-8px;display:block;float:left;">
				<img src="/img/menuBar/right.png" style="margin-right:-8px;display:block;float:right;">
			</div>
			<div id="menuBar_icon" style="position:absolute;margin:5px 20px 0 20px;">
				<div style="float:left;"><a href="" onclick="">인쇄</a></div>
				<div style="float:left;margin-left:10px;">|</div>
				<div style="float:left;margin-left:10px;"><a href="" onclick="">처음</a></div>
				<div style="float:left;margin-left:10px;"><a href="" onclick="">이전</a></div>
				<div style="float:left;margin-left:10px;padding-left:5px;padding-right:5px;background-color:#fff;"><input type="text" name="currentPage" value="1" style="width:50px;"></div>
				<div style="float:left;margin-left:10px;"> / <%=total%></div>
				<div style="float:left;margin-left:10px;"><a href="" onclick="">다음</a></div>
				<div style="float:left;margin-left:10px;"><a href="" onclick="">마지막</a></div>
				<div style="float:left;margin-left:10px;">|</div>
				<div style="float:left;margin-left:10px;"><a href="" onclick="">연결</a></div>
				<div style="float:left;margin-left:10px;"><a href="" onclick="">한쪽</a></div>
				<div style="float:left;margin-left:10px;"><a href="" onclick="">두쪽</a></div>
				<div style="float:left;margin-left:10px;">|</div>
				<div style="float:left;margin-left:10px;"><a href="" onclick="">가로</a></div>
				<div style="float:left;margin-left:10px;"><a href="" onclick="">세로</a></div>
				<div style="float:left;margin-left:10px;"><input type="text" name="magnification" value="100" style="">%</div>
				<div style="float:left;margin-left:10px;">|</div>
				<div style="float:left;margin-left:10px;"><input type="text" name="keyword" value="검색어" style=""> 검색</div>
			</div>
		</div>
		<div id="stage" style="background-color:#e0e0e0;width:100%;height:100%;overflow:scroll;"></div>
	</body>
	<script>
		var body = document.getElementsByTagName("body")[0];
		var menuBar = document.getElementById("menuBar");
		var menuBar_icon = document.getElementById("menuBar_icon");
		var stage = document.getElementById("stage");

		try {
			window.addEventListener("load", init);
			window.addEventListener("resize", resize);
		}
		catch (e) {
			window.attachEvent("onload", init);
			window.attachEvent("onresize", resize);
		}

		// --------------------------------------------------

		var initialized = false;

		function init() {
			setTimeout(function() {
				_resize();

				body.style.visibility = "visible";

				_load(1);
			}, 1);
		}

		function resize() {
			if (initialized == false) {
				return;
			}

			setTimeout(function() {
				_resize();
			}, 1);
		}

		function _resize() {
			var width = body.clientWidth;
			var height = body.clientHeight;
			var menuBarWidth = width > 1000 ? 1000 : width - 80;

			menuBar.style.width = menuBarWidth + "px";
			menuBar.style.left = parseInt((width - menuBarWidth) / 2) + "px";
			
			// TODO: 종이 가운데 정렬 바꿈
			// 현재 위치 기준으로 [화면에 보이는 페이지 + 2] 까지의 페이지만 정렬을 변경함
			// 나머지는 timer를 사용하여 하나씩 보정(중간에 cancel... 가능해야 함)

		}

		// --------------------------------------------------

		var imageList = new Array();

		function _set() {
			// 첫 페이지를 읽어들인다...
			// 첫 페이지의 사이즈를 기준으로 전체 페이지를 세팅한다.
			// 첫 페이지 이후의 페이지들은 timer를 사용하여 하나씩 추가

			var image = new Image();

			image.src = "/get.do?id=<%=id%>&page=1";

alert(image.complete+"/"+image.width+"/"+image.height);
alert(image.complete+"/"+image.width+"/"+image.height);

			var imageWidth = image.width;
			var imageHeight = image.height;

			var width = stage.clientWidth;
			var scaleX = (width - 20) / imageWidth;
			var scaleY = (body.clientHeight - 90) / imageHeight;

			scale = scaleX > scaleY ? scaleY : scaleX;
			if (scale > 1.0) {
				scale = 1.0;
			}

			document.getElementsByName("magnification")[0].value = parseInt(scale * 100);

			for (var i = 1; i <= total; i++) {
				var node = document.createElement("div");
				var scaledWidth = paperWidth * scale;

				node.id = "page_" + i;
				node.style.width = scaledWidth + "px";
				node.style.height = (paperHeight * scale) + "px";
				node.style.backgroundColor = "#fff";
				node.style.marginBottom = "10px";
				if (i == 1) {
					node.style.marginTop = "50px";
				}
				node.style.marginLeft = ((width - scaledWidth) / 2) + "px";
				node.style.position = "relative";

				stage.appendChild(node);
			}

			initialized = true;
		}

		function _load(page) {
			var image = new Image();

			imageList.push(image);

			image.src = "/get.do?id=<%=id%>&page=" + page;

			setTimeout(function() {
				_loadCallback(image);
			}, 1);
		}
		
		function _loadCallback(image) {
			if (image.complete == true) {
				if (initialized == false) {
					var imageWidth = image.width;
					var imageHeight = image.height;

					var width = stage.clientWidth;
					var scaleX = (width - 20) / imageWidth;
					var scaleY = (body.clientHeight - 90) / imageHeight;

					scale = scaleX > scaleY ? scaleY : scaleX;
//					if (scale > 1.0) {
//						scale = 1.0;
//					}

					document.getElementsByName("magnification")[0].value = parseInt(scale * 100);

					for (var i = 1; i <= total; i++) {
						var node = document.createElement("div");
						var scaledWidth = parseInt(imageWidth * scale);
						var scaledHeight = parseInt(imageHeight * scale);

						if (i == 1) alert(scaledWidth+"\n"+scaledHeight);

						node.id = "page_" + i;
						node.style.width = scaledWidth + "px";
						node.style.height = scaledHeight + "px";
						node.style.backgroundColor = "#fff";
						node.style.marginBottom = "10px";
						if (i == 1) {
							node.style.marginTop = "50px";
						}
						node.style.marginLeft = parseInt((width - scaledWidth) / 2) + "px";
						node.style.position = "relative";

						stage.appendChild(node);
					}

					var canvas = document.createElement("canvas");
					
					canvas.width = scaledWidth;
					canvas.height = scaledHeight;

					var context = canvas.getContext("2d");

					context.drawImage(image, 0, 0, scaledWidth, scaledHeight);

				    resample_hermite(canvas, imageWidth, imageHeight, scaledWidth, scaledHeight);

					var page = document.getElementById("page_1");

					page.appendChild(canvas);

					initialized = true;
				}
				else {
					// 일반 페이지 그리기...
				}
			}
			else {
				setTimeout(function() {
					_loadCallback(image);
				}, 1);
			}
		}

		
		
		
		
		/*
		var img = document.getElementById("mm");

		var W = 500;
		var H = 500;
		var canvas = document.getElementById("cc");
		var ctx = canvas.getContext("2d");
		canvas.width = W;
		canvas.height = H;

		var img = new Image();
		img.crossOrigin = "Anonymous"; //cors support
		img.onload = function(){
		    ctx.drawImage(img, 0, 0);
		    
		    //now we can resize
		    resample_hermite(canvas, W, H, 250, 250);
		}
		img.src = 'http://i.imgur.com/JuJMPxs.png';
		*/



		function resample_hermite(canvas, W, H, W2, H2){
				var time1 = Date.now();
				var img = canvas.getContext("2d").getImageData(0, 0, W, H);
				var img2 = canvas.getContext("2d").getImageData(0, 0, W2, H2);
				var data = img.data;
				var data2 = img2.data;
				var ratio_w = W / W2;
				var ratio_h = H / H2;
				var ratio_w_half = Math.ceil(ratio_w/2);
				var ratio_h_half = Math.ceil(ratio_h/2);
				
				for(var j = 0; j < H2; j++){
					for(var i = 0; i < W2; i++){
						var x2 = (i + j*W2) * 4;
						var weight = 0;
						var weights = 0;
						var weights_alpha = 0;
						var gx_r = gx_g = gx_b = gx_a = 0;
						var center_y = (j + 0.5) * ratio_h;
						for(var yy = Math.floor(j * ratio_h); yy < (j + 1) * ratio_h; yy++){
							var dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
							var center_x = (i + 0.5) * ratio_w;
							var w0 = dy*dy //pre-calc part of w
							for(var xx = Math.floor(i * ratio_w); xx < (i + 1) * ratio_w; xx++){
								var dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
								var w = Math.sqrt(w0 + dx*dx);
								if(w >= -1 && w <= 1){
									//hermite filter
									weight = 2 * w*w*w - 3*w*w + 1;
									if(weight > 0){
										dx = 4*(xx + yy*W);
										//alpha
										gx_a += weight * data[dx + 3];
										weights_alpha += weight;
										//colors
										if(data[dx + 3] < 255)
											weight = weight * data[dx + 3] / 250;
										gx_r += weight * data[dx];
										gx_g += weight * data[dx + 1];
										gx_b += weight * data[dx + 2];
										weights += weight;
										}
									}
								}		
							}
						data2[x2]     = gx_r / weights;
						data2[x2 + 1] = gx_g / weights;
						data2[x2 + 2] = gx_b / weights;
						data2[x2 + 3] = gx_a / weights_alpha;
						}
					}
				console.log("hermite = "+(Math.round(Date.now() - time1)/1000)+" s");
				canvas.getContext("2d").clearRect(0, 0, Math.max(W, W2), Math.max(H, H2));
				canvas.getContext("2d").putImageData(img2, 0, 0);
			}

		// --------------------------------------------------

		var scale;

		var current = 1;
		var total = <%=total%>;
		var paperWidth = 2310;
		var paperHeight = 3267;
		var menuBarOpacity;
		var magnification;

		function commandMenuBar(command) {
			if (command == "on") {
				menuBarOpacity = menuBar.style.opacity;

				menuBar.style.opacity = "";
			}
			else if (command == "off") {
				menuBar.style.opacity = menuBarOpacity;
			}
		}
		
		function _paper() {
			var width = stage.clientWidth;
			var scaleX = (width - 20) / paperWidth;
			var scaleY = (body.clientHeight - 90) / paperHeight;
			var scale = scaleX > scaleY ? scaleY : scaleX;

			if (scale > 1.0) {
				scale = 1.0;
			}

			magnification = scale;

			document.getElementsByName("magnification")[0].value = parseInt(scale * 100);

			for (var i = 1; i <= total; i++) {
				var node = document.createElement("div");
				var scaledWidth = paperWidth * scale;

				node.id = "page_" + i;
				node.style.width = scaledWidth + "px";
				node.style.height = (paperHeight * scale) + "px";
				node.style.backgroundColor = "#fff";
				node.style.marginBottom = "10px";
				if (i == 1) {
					node.style.marginTop = "50px";
				}
				node.style.marginLeft = ((width - scaledWidth) / 2) + "px";
				node.style.position = "relative";

				stage.appendChild(node);
			}
		}

		
		function _loading() {
			for (var i = 1; i <= 10; i++) {
				var img = document.createElement("img");
				
				img.src = "/get.do?id=DOC001&page=" + i;
				img.style.visibility = "hidden";

				img.onload = function() {
					var scaledWidth = this.width * magnification;
					var scaledHeight = this.height * magnification;

					var page = this.parentNode;
					
					page.style.width = scaledWidth + "px";
					page.style.height = scaledHeight + "px";

					page.style.marginLeft = ((stage.clientWidth - scaledWidth) / 2) + "px";

					this.style.width = "100%";
					this.style.height = "100%";
					this.style.visibility = "visible";
				}

				var page = document.getElementById("page_" + i);

				page.appendChild(img);
			}
		}
	</script>
</html>