package jcahn.webviewer.server.web.controller;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import jcahn.webviewer.server.core.service.Pdf;
import jcahn.webviewer.server.core.service.Pdf.PdfInfo;

@Controller
public class Viewer {

	@Autowired
	private Pdf pdf;

	@RequestMapping("/viewer.do")
	public String viewerDo(HttpServletRequest request, Model model) {

		PdfInfo info = pdf.info(request.getParameter("id"));

		model.addAttribute("total", info.pages);

		return "/web/viewer/viewer.do";
	}
}
