package jcahn.webviewer.server.web.controller;

import javax.servlet.http.HttpServletRequest;
import jcahn.webviewer.server.core.converter.Pdf;
import jcahn.webviewer.server.core.converter.Pdf.PdfInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class Viewer {

	@Autowired
	private Pdf pdf;

	@RequestMapping("/viewer.do")
	public String viewerDo(HttpServletRequest request, Model model) {

		PdfInfo info = pdf.info(request.getParameter("id"));

		model.addAttribute("total", info.pages);
		model.addAttribute("width", info.width);
		model.addAttribute("height", info.height);

		return "/web/viewer/viewer.do";
	}
}
