<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@page import="java.io.File"%>
<%@page import="java.io.FileInputStream"%>
<%
	out.clear();

	out.print(request.getAttribute("dimension"));
%>
