package jcahn.webviewer.server.web.controller;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import jcahn.webviewer.server.core.service.Pdf;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class Viewer {

	@Autowired
	private Pdf pdf;

	@Value("#{properties['viewer.page.type']}")
	private String viewerPageType;

	@Value("#{properties['viewer.fill.type']}")
	private String viewerFillType;

	@Value("#{properties['viewer.hq.on']}")
	private boolean viewerHqOn;

	final Logger logger = LoggerFactory.getLogger(this.getClass());

	@RequestMapping("/viewer.do")
	public String viewerDo(HttpServletRequest request, HttpServletResponse response, Model model) {

		String id = request.getParameter("id");

		logger.debug("파라미터: [id-" + id + "]");

		response.reset();
		response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
		response.setHeader("Expires", "0");

		model.addAttribute("info", pdf.info(id));
		model.addAttribute("viewerPageType", this.viewerPageType);
		model.addAttribute("viewerFillType", this.viewerFillType);
		model.addAttribute("viewerHqOn", this.viewerHqOn);

		return "/web/viewer/viewer.do";
	}
}
