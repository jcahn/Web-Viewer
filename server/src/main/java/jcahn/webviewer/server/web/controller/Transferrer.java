package jcahn.webviewer.server.web.controller;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import jcahn.webviewer.server.core.PdfInfo;
import jcahn.webviewer.server.core.service.Converter;
import jcahn.webviewer.server.core.service.Pdf;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class Transferrer {

	@Autowired
	private Converter converter;

	@Autowired
	private Pdf pdf;

	final Logger logger = LoggerFactory.getLogger(this.getClass());

	@RequestMapping("/get.do")
	public String getDo(HttpServletRequest request, HttpServletResponse response, ModelMap model) {

		String id = request.getParameter("id");
		String page = request.getParameter("p");
		String scale = request.getParameter("s");

		logger.debug("파라미터: [id-" + id + ", p-" + page + ", scale-" + scale + "]");

		try {
			PdfInfo info = pdf.info(id);
			int p = Integer.parseInt(page);

			if (p < 1 || p > info.pages) {
				page = "1";
			}
		}
		catch (Exception e) {
			page = "1";
		};

		String filePath = converter.convert(id, page);

		if (filePath == null) {
			try {
				response.sendError(HttpServletResponse.SC_NOT_FOUND);
			}
			catch (Exception e) {}

			return null;
		}

		response.reset();
		response.setContentType("application/octet-stream");
		response.setHeader("Content-Disposition", "attatchment; filename = " + filePath.substring(filePath.lastIndexOf("/") + 1));
		response.setHeader("Content-Transfer-Encoding", "binary");
		response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

		try {
			converter.resize(filePath, Integer.parseInt(scale), response.getOutputStream());
		}
		catch (Exception e) {}

		return null;
	}

	@RequestMapping("/preload.do")
	public String preloadDo(HttpServletRequest request, HttpServletResponse response, ModelMap model) {

		String id = request.getParameter("id");
		String page = request.getParameter("p");

		logger.debug("파라미터: [id-" + id + ", p-" + page + "]");

		try {
			PdfInfo info = pdf.info(id);
			int p = Integer.parseInt(page);

			if (p < 1 || p > info.pages) {
				page = "1";
			}
		}
		catch (Exception e) {
			page = "1";
		};

		converter.convert(id, page);

		return null;
	}
}
