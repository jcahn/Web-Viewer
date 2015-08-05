<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@page import="java.util.ArrayList"%>
<%
	String id = request.getParameter("id");
	int total = (Integer)request.getAttribute("total");
	@SuppressWarnings("unchecked") ArrayList<ArrayList<String>> tocList = (ArrayList<ArrayList<String>>)request.getAttribute("tocList"); // {[0] - 제목, [1] - 페이지} 반복

	String pageType = "1page";
	String fillType = "height";
	boolean hq = true;
%>
<%out.clear();%><!DOCTYPE html>
<html>
	<head>
		<link href="/css/viewer.css" rel="stylesheet" type="text/css">
	</head>
	<body onmouseout="return drag('conditional_stop', event);">
		<div id="menuBar">
			<a href="" id="tocButton" onclick="return tocTrigger();" onmouseover="_classAppend(this, 'over');" onmouseout="_classRemove(this, 'over');"><img src="/img/menu/toc.png" title="목차"></a>
			<p class="split"></p>
			<a href="" onclick="return printPopup();" onmouseover="_classAppend(this, 'over');" onmouseout="_classRemove(this, 'over');"><img src="/img/menu/print.png" title="인쇄"></a>
			<p class="split"></p>
			<a href="" onclick="return move(parseInt(displayCurrent.value)-1);" onmouseover="_classAppend(this, 'over');" onmouseout="_classRemove(this, 'over');"><img src="/img/menu/prev.png" title="이전 페이지"></a>
			<input type="text" name="currentPage" value="1" style="width:90px;" maxlength="5" onkeydown="if (event.keyCode == 13) return move(this.value);"><p style="margin-left:-55px;font-weight:bold;">/ <%=total%></p>
			<a href="" onclick="return move(parseInt(displayCurrent.value)+1);" onmouseover="_classAppend(this, 'over');" onmouseout="_classRemove(this, 'over');"><img src="/img/menu/next.png" title="다음 페이지"></a>
			<p class="split"></p>
			<a href="" id="1pageButton" onclick="return pageTrigger('1page');" onmouseover="_classAppend(this, 'over');" onmouseout="_classRemove(this, 'over');"><img src="/img/menu/1page.png" title="한 쪽씩 보기"></a>
			<a href="" id="2pagesButton" onclick="return pageTrigger('2pages');" onmouseover="_classAppend(this, 'over');" onmouseout="_classRemove(this, 'over');"><img src="/img/menu/2pages.png" title="두 쪽씩 보기"></a>
			<a href="" id="continueButton" onclick="return pageTrigger('continue');" onmouseover="_classAppend(this, 'over');" onmouseout="_classRemove(this, 'over');"><img src="/img/menu/continue.png" title="이어서 보기"></a>
			<p class="split"></p>
			<a href="" id="heightButton" onclick="return fillTrigger('height');" onmouseover="_classAppend(this, 'over');" onmouseout="_classRemove(this, 'over');"><img src="/img/menu/height.png" title="세로 맞춤"></a>
			<a href="" id="widthButton" onclick="return fillTrigger('width');" onmouseover="_classAppend(this, 'over');" onmouseout="_classRemove(this, 'over');"><img src="/img/menu/width.png" title="가로 맞춤"></a>
			<a href="" onclick="return rescale('bigger');" onmouseover="_classAppend(this, 'over');" onmouseout="_classRemove(this, 'over');"><img src="/img/menu/bigger.png" title="확대"></a>
			<a href="" onclick="return rescale('smaller');" onmouseover="_classAppend(this, 'over');" onmouseout="_classRemove(this, 'over');"><img src="/img/menu/smaller.png" title="축소"></a>
			<input type="text" name="scale" value="100" maxlength="3" style="width:40px;" onchange="return magnification(this);"><p style="margin-left:-17px;font-weight:bold;">%</p>
			<p class="split"></p>
			<a href="" onclick="return rotate();" onmouseover="this.className='over';" onmouseout="this.className='';"><img src="/img/menu/rotate.png" title="회전"></a>
			<a href="" id="hqButton" onclick="return hqTrigger();" onmouseover="_classAppend(this, 'over');" onmouseout="_classRemove(this, 'over');"><img src="/img/menu/hq.png" title="품질향상"></a>
			<a href="" onclick="return ttsPopup();" onmouseover="_classAppend(this, 'over');" onmouseout="_classRemove(this, 'over');"><img src="/img/menu/tts.png" title="음성"></a>
			<p class="split"></p>
			<input type="text" name="keyword" value="검색어" style="width:150px;padding-left:23px;" onfocus="_keyword('on');" onblur="_keyword('blur');" onkeydown="if (event.keyCode == 13) return searchPopup();"><p style="margin-left:-176px;margin-top:10px;"><img src="/img/menu/search.png" style="width:20px;height:20px"></p>
		</div>
		<div id="toc" onmousewheel="return wheel('toc', -event.wheelDelta);">
<%if (tocList != null && tocList.size() > 0) {%>
	<%for (int i = 0, size = tocList.size(); i < size; i++) {%>
			<div>
				<div><%=tocList.get(i).get(0)%></div>
				<div><%=tocList.get(i).get(1)%></div>
			</div>
	<%}%>
<%}%>
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
			<div id="prev" class="move prev" onmouseover="opacity=this.style.opacity;this.style.opacity=0.5;" onmouseout="this.style.opacity=opacity;"><a href="" onclick="return move(parseInt(displayCurrent.value)-1);"></a></div>
			<div id="next" class="move next" onmouseover="opacity=this.style.opacity;this.style.opacity=0.5;" onmouseout="this.style.opacity=opacity;"><a href="" onclick="return move(parseInt(displayCurrent.value)+1);"></a></div>
		</div>
		<div id="loading">
			<div id="ball1" class="ball"></div>
			<div id="ball2" class="ball"></div>
			<div id="ball3" class="ball"></div>
			<div id="ball4" class="ball"></div>
		</div>
<div id="log" style="position:absolute;top:50px;left:10px"></div>
		<script>
			var id = "<%=id%>";
			var total = <%=total%>;
			var showToc = <%=tocList != null && tocList.size() > 0 ? "true" : "false"%>;
			var pageType = "<%=pageType%>";
			var hq = <%=hq%>;
			var fillType = "<%=fillType%>";
		</script>
		<script src="/js/viewer.js"></script>
	</body>
</html>
