package jcahn.webviewer.server.web.controller;

import java.io.File;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import jcahn.webviewer.server.core.service.Converter;
import jcahn.webviewer.server.core.service.Storage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class Transferrer {

	@Autowired
	Converter converter;

	@Autowired
	Storage storage;

	@RequestMapping("/get.do")
	public String getDo(HttpServletRequest request, HttpServletResponse response, ModelMap model) {

		String id = request.getParameter("id");
		String page = request.getParameter("p");
		String filePath = storage.cachePath(id, page);
		File file = new File(filePath);

		if (file.exists() == false || file.isFile() == false) {
			try {
				response.sendError(HttpServletResponse.SC_NOT_FOUND);
			}
			catch (Exception e) {}

			return null;
		}

		int width;
		int height;

		try {
			width = Integer.parseInt(request.getParameter("w"));
			height = Integer.parseInt(request.getParameter("h"));

			String[] token = converter.dimension(filePath).split("x");

			int minWidth = Integer.parseInt(token[0]) / 2;
			int minHeight = Integer.parseInt(token[1]) / 2;
			int maxWidth = Integer.parseInt(token[0]) * 3;
			int maxHeight = Integer.parseInt(token[1]) * 3;

			if (width < minWidth || height < minHeight) {
				width = minWidth;
				height = minHeight;
			}
			else if (width > maxWidth || height > maxHeight) {
				width = maxWidth;
				height = maxHeight;
			}
		}
		catch (Exception e) {
			return null;
		}

		response.reset();
		response.setContentType("application/octet-stream");
		response.setHeader("Content-Disposition", "attatchment; filename = " + filePath.substring(filePath.lastIndexOf("/") + 1));
		response.setHeader("Content-Transfer-Encoding", "binary");

		try {
			converter.resize(id, page, width, height, response.getOutputStream());
		}
		catch (Exception e) {}

		return null;
	}

	@RequestMapping("/info.do")
	public String infoDo(HttpServletRequest request, HttpServletResponse response, ModelMap model) {

		String filePath = converter.convert(request.getParameter("id"), request.getParameter("p"));

		if (filePath == null) {
			try {
				response.sendError(HttpServletResponse.SC_NOT_FOUND);
			}
			catch (Exception e) {}

			return null;
		}

		String dimension = converter.dimension(filePath);

		if (dimension == null) {
			try {
				response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			}
			catch (Exception e) {}

			return null;
		}

		model.put("dimension", dimension);

		return "/web/transferrer/info.do";
	}
}
