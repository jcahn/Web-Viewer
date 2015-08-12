<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@page import="java.util.ArrayList"%>
<%@page import="jcahn.webviewer.server.core.Dimension"%>
<%@page import="jcahn.webviewer.server.core.PdfInfo"%>
<%@page import="org.springframework.beans.factory.annotation.Value"%>
<%
	String id = request.getParameter("id");

	PdfInfo pdfInfo = (PdfInfo)request.getAttribute("info");
	String viewerPageType = (String)request.getAttribute("viewerPageType");
	String viewerFillType = (String)request.getAttribute("viewerFillType");
	boolean viewerHqOn = (Boolean)request.getAttribute("viewerHqOn");
%>
<%out.clear();%><!DOCTYPE html>
<html>
	<head>
		<link href="/css/viewer.css" rel="stylesheet" type="text/css">
	</head>
	<body onmouseout="_Drag('conditional_stop', event);">
		<div id="MenuBar">
			<a href="" id="TocButton" onclick="return TocTrigger();"><img src="/img/menu/toc.png" title="목차"></a>
			<p class="split"></p>
			<a href="" onclick="return PrintPopup();"><img src="/img/menu/print.png" title="인쇄"></a>
			<p class="split"></p>
			<a href="" onclick="return Move('fast_prev');"><img src="/img/menu/prev.png" title="이전 페이지"></a>
			<input type="text" id="Current" value="1" style="width:90px;" maxlength="5" onkeydown="if (event.keyCode == 13) return Move('manual');"><p style="margin-left:-55px;font-weight:bold;">/ <%=pdfInfo.pages%></p>
			<a href="" onclick="return Move('fast_next');"><img src="/img/menu/next.png" title="다음 페이지"></a>
			<p class="split"></p>
			<a href="" id="1pageButton" onclick="return PageType('1page');"><img src="/img/menu/1page.png" title="한 쪽씩 보기"></a>
			<a href="" id="2pagesButton" onclick="return PageType('2pages');"><img src="/img/menu/2pages.png" title="두 쪽씩 보기"></a>
			<a href="" id="ContinueButton" onclick="return PageType('continue');"><img src="/img/menu/continue.png" title="이어서 보기"></a>
			<p class="split"></p>
			<a href="" id="HeightButton" onclick="return Scale('height');"><img src="/img/menu/height.png" title="세로 맞춤"></a>
			<a href="" id="WidthButton" onclick="return Scale('width');"><img src="/img/menu/width.png" title="가로 맞춤"></a>
			<a href="" onclick="return Scale('bigger');"><img src="/img/menu/bigger.png" title="확대"></a>
			<a href="" onclick="return Scale('smaller');"><img src="/img/menu/smaller.png" title="축소"></a>
			<select id="Scale" onchange="return Scale('manual');">
				<option value="50">50%</option>
				<option value="100">100%</option>
				<option value="150">150%</option>
				<option value="200">200%</option>
				<option value="250">250%</option>
				<option value="300">300%</option>
				<option value="400">400%</option>
				<option value="500">500%</option>
				<option value="height">높이에 맞추기</option>
				<option value="width">너비에 맞추기</option>
			</select>
			<p class="split"></p>
			<a href="" onclick="return Rotate();"><img src="/img/menu/rotate.png" title="회전"></a>
			<a href="" id="HqButton" onclick="return HqTrigger();"><img src="/img/menu/hq.png" title="품질향상"></a>
			<a href="" onclick="return TtsPopup();"><img src="/img/menu/tts.png" title="음성"></a>
			<p class="split"></p>
			<input type="text" id="Keyword" value="검색어" style="width:150px;padding-left:23px;" onfocus="_Keyword('on');" onblur="_Keyword('blur');" onkeydown="if (event.keyCode == 13) return SearchPopup();"><p style="margin-left:-176px;margin-top:11px;"><img src="/img/menu/search.png" style="width:20px;height:20px"></p>
		</div>
		<div id="Toc" onmousewheel="_Wheel('toc', -event.wheelDelta);">
			<div id="TocList">
<%for (int i = 0; i < pdfInfo.tocList.size(); ) {%>
				<div class="item" onmouseover="this.style.backgroundColor = 'rgb(200,200,200)';" onmouseout="this.style.backgroundColor = '';" onclick="return Move('manual', <%=pdfInfo.tocList.get(i).page%>);"><a href="" style="<%if (pdfInfo.tocList.get(i).level == 1) {%>font-weight:bold;<%} else {%>padding-left:<%=(pdfInfo.tocList.get(i).level - 1) * 8%>px;<%}%>" onclick="return Move('manual', <%=pdfInfo.tocList.get(i).page%>);"><%=pdfInfo.tocList.get(i).title.replaceAll("<", "&lt;").replaceAll(">", "&gt;")%></a></div>
	<%i++;%>
	<%if (i < pdfInfo.tocList.size()) {%>
				<div class="split"></div>
	<%}%>
<%}%>
			</div>
			<div id="ScrollToc">
				<div class="lane"></div>
				<div id="BarToc" onmousedown="_Drag('start', event);" onmousemove="_Drag('move', event);" onmouseup="_Drag('stop');"></div>
			</div>
		</div>
		<div id="Stage" onmousewheel="_Wheel('stage', -event.wheelDelta);">
			<div id="1page"></div>
			<div id="2pages"></div>
			<div id="Continue">
<%for (int i = 0, size = pdfInfo.dimensionList.size(); i < size; i++) {%>
				<div id="Page<%=i + 1%>"></div>
<%}%>
			</div>
			<div id="ScrollX" class="scroll x">
				<div class="lane"></div>
				<div id="BarX" class="bar x" onmousedown="_Drag('start', event);" onmousemove="_Drag('move', event);" onmouseup="_Drag('stop');"></div>
			</div>
			<div id="ScrollY" class="scroll y">
				<div class="lane"></div>
				<div id="BarY" class="bar y" onmousedown="_Drag('start', event);" onmousemove="_Drag('move', event);" onmouseup="_Drag('stop');"></div>
			</div>
			<div id="Prev" class="move prev" onmouseover="this.style.opacity=0.5;" onmouseout="this.style.opacity='';"><a href="" onclick="return Move('prev');"></a></div>
			<div id="Next" class="move next" onmouseover="this.style.opacity=0.5;" onmouseout="this.style.opacity='';"><a href="" onclick="return Move('next');"></a></div>
		</div>
		<div id="Loading">
			<div id="Ball1" class="ball"></div>
			<div id="Ball2" class="ball"></div>
			<div id="Ball3" class="ball"></div>
			<div id="Ball4" class="ball"></div>
		</div>
		<div id="log" style="position:absolute;top:50px;left:10px;"></div>
		<script>
			var $id = "<%=id%>";
			var $total = <%=pdfInfo.pages%>;
			var $pageType = "<%=viewerPageType%>";
			var $hqOn = <%=viewerHqOn%>;
			var $fillType = "<%=viewerFillType%>";
			var $defaultHeight = [0<%for (int i = 0, size = pdfInfo.dimensionList.size(); i < size; i++) out.print("," + pdfInfo.dimensionList.get(i).height * 100 / 72);%>];
			var $defaultWidth = [0<%for (int i = 0, size = pdfInfo.dimensionList.size(); i < size; i++) out.print("," + pdfInfo.dimensionList.get(i).width * 100 / 72);%>];
		</script>
		<script src="/js/viewer.js"></script>
	</body>
</html>
