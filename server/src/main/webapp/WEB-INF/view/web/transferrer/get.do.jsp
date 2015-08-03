<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@page import="java.io.File"%>
<%@page import="java.io.FileInputStream"%>
<%
	String filePath = (String)request.getAttribute("filePath");

	out.clear();

	out = pageContext.pushBody();

	byte buffer[] = new byte[1000000];

	response.reset();
	response.setContentType("application/octet-stream");
	response.setHeader("Content-Disposition", "attatchment; filename = " + filePath.substring(filePath.lastIndexOf("/") + 1));
	response.setHeader("Content-Length", String.valueOf(new File(filePath).length()));
	response.setHeader("Content-Transfer-Encoding", "binary");

	FileInputStream input = new FileInputStream(filePath);
	ServletOutputStream output = response.getOutputStream();
	int size;

	while((size = input.read(buffer, 0, buffer.length)) != -1) {
		output.write(buffer, 0, size);
	}

	output.flush();

	input.close();
	output.close();
%>
