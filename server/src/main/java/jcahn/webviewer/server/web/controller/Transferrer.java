package jcahn.webviewer.server.web.controller;

import jcahn.webviewer.server.core.converter.Converter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class Transferrer {

	@Autowired
	Converter converter;

	@RequestMapping("/get.do")
	public String getDo(HttpServletRequest request, HttpServletResponse response, ModelMap model) {

		String filePath = converter.convert(request.getParameter("id"), request.getParameter("p"), request.getParameter("s"));

		if (filePath.length() == 1) {
			try {
				response.sendError(HttpServletResponse.SC_NOT_FOUND);
			}
			catch (Exception e) {}

			return null;
		}

		model.put("filePath", filePath);

		return "/web/transferrer/get.do";
	}
}
