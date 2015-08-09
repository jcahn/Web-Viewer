package jcahn.webviewer.server.core.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.lang.ProcessBuilder.Redirect;
import java.util.ArrayList;
import jcahn.webviewer.server.core.Dimension;
import jcahn.webviewer.server.core.PdfInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class Pdf {

	@Autowired
	Storage storage;

	@Value("#{properties['converter.path']}")
	private String converterPath;

	final Logger logger = LoggerFactory.getLogger(this.getClass());

	public PdfInfo info(String id) {

		ArrayList<String> command = new ArrayList<String>();

		command.add(this.converterPath + "/mutool.exe");
		command.add("pages");
		command.add(storage.originalPath(id));

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

				if (line.startsWith("<MediaBox ")) {
					String[] tokenList = line.split(" ");

					Dimension dimension = new Dimension();

					dimension.width = (int)(Double.parseDouble(tokenList[3].replaceAll("\"", "").substring(2)) - Double.parseDouble(tokenList[1].replaceAll("\"", "").substring(2)));
					dimension.height = (int)(Double.parseDouble(tokenList[4].replaceAll("\"", "").substring(2)) - Double.parseDouble(tokenList[2].replaceAll("\"", "").substring(2)));

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

		this.logger.debug("pdf info\npages: " + info.pages);

		return info;
	}
}
