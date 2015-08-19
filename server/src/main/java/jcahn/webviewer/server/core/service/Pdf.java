package jcahn.webviewer.server.core.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.lang.ProcessBuilder.Redirect;
import java.util.ArrayList;
import java.util.List;
import jcahn.webviewer.server.core.Dimension;
import jcahn.webviewer.server.core.PdfInfo;
import jcahn.webviewer.server.core.Toc;
import org.apache.pdfbox.cos.COSArray;
import org.apache.pdfbox.cos.COSObject;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.interactive.documentnavigation.outline.PDOutlineItem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class Pdf {

	@Autowired
	private Storage storage;

	@Value("#{properties['bin.mutool.path']}")
	private String mutoolPath;

	final Logger logger = LoggerFactory.getLogger(this.getClass());

	public PdfInfo info(String id) {

		String originalPath = storage.originalPath(id);

		ArrayList<String> command = new ArrayList<String>();

		command.add(this.mutoolPath);
		command.add("pages");
		command.add(originalPath);

		this.logger.debug("command: " + command.toString());

		ProcessBuilder processBuilder = new ProcessBuilder(command);

		processBuilder.redirectError(Redirect.INHERIT);

		InputStreamReader input = null;
		BufferedReader reader = null;
		PdfInfo info = new PdfInfo();

		try {
			Process process = processBuilder.start();

			input = new InputStreamReader(process.getInputStream());
			reader = new BufferedReader(input);

			while (true) {
				String line = reader.readLine();

				if (line == null) {
					break;
				}

				if (line.startsWith("<CropBox ") || line.startsWith("<TrimBox ")) {
					String[] tokenList = line.split(" ");

					Dimension dimension = new Dimension();

					dimension.width = (int)Math.ceil((Double.parseDouble(tokenList[3].replaceAll("\"", "").substring(2)) - Double.parseDouble(tokenList[1].replaceAll("\"", "").substring(2))) * 100 / 72);
					dimension.height = (int)Math.ceil((Double.parseDouble(tokenList[4].replaceAll("\"", "").substring(2)) - Double.parseDouble(tokenList[2].replaceAll("\"", "").substring(2))) * 100 / 72);

					info.pages++;
					info.dimensionList.add(dimension);
				}
			}

			process.waitFor();
		}
		catch (Exception e) {
			this.logger.debug("\ninfo 작업 오류 발생;\nid: " + id + "\nmutool 실행 오류.");

			info = new PdfInfo();
		}
		finally {
			try {
				reader.close();
			}
			catch (Exception e) {}

			try {
				input.close();
			}
			catch (Exception e) {}
		}

		PDDocument doc = null;

		try {
			doc = PDDocument.load(originalPath);

			if (doc.getDocumentCatalog().getDocumentOutline() != null) {
				toc(info.tocList, doc, doc.getDocumentCatalog().getDocumentOutline().getFirstChild(), 1);
			}
		}
		catch (Exception e) {
			this.logger.debug("\ninfo 작업 오류 발생;\nid: " + id + "\npdfbox 오류.");

			info.tocList.clear();
		}
		finally {
			try {
				doc.close();
			}
			catch (Exception e) {}
		}

		this.logger.debug("pdf info\npages: " + info.pages);
		this.logger.debug("dimensions: " + info.dimensionList.size());
		this.logger.debug("tocs: " + info.tocList.size());

		return info;
	}

	// --------------------------------------------------

	@SuppressWarnings("unchecked")
	private void toc(ArrayList<Toc> tocList, PDDocument doc, PDOutlineItem item, int level) throws Exception {

		while (item != null) {
			int page;

			if (item.getDestination() != null) {
				page = ((List<PDPage>)doc.getDocumentCatalog().getAllPages()).indexOf(item.findDestinationPage(doc)) + 1;
			}
			else if (item.getAction() != null) {
				if ("GoTo".equals(item.getAction().getSubType())) {
					COSObject o = (COSObject)((COSArray)item.getAction().getCOSDictionary().getDictionaryObject("D")).get(0);

					page = doc.getPageMap().get(o.getObjectNumber().intValue()+","+o.getGenerationNumber().intValue());
				}
				else if ("GoToR".equals(item.getAction().getSubType())) {
					page = ((COSArray)item.getAction().getCOSDictionary().getDictionaryObject("D")).getInt(0) + 1;
				}
				else {
					throw new Exception("<!> "+item.getAction().getSubType()+" type not supported.");
				}
			}
			else {
				throw new Exception("<!> toc type not supported.");
			}

			Toc tocItem = new Toc();

			tocItem.level = level;
			tocItem.title = item.getTitle();
			tocItem.page = page;

			tocList.add(tocItem);

			PDOutlineItem child = item.getFirstChild();

			if (child != null) {
				toc(tocList, doc, child, level + 1);
			}

			item = item.getNextSibling();
		}
	}
}
