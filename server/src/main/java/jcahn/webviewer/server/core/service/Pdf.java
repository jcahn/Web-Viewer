package jcahn.webviewer.server.core.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.lang.ProcessBuilder.Redirect;
import java.util.ArrayList;
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

		PdfInfo info = new PdfInfo();

		info.pages = 0;
		info.width = 0;
		info.height = 0;

		ArrayList<String> command = new ArrayList<String>();

		command.add(this.converterPath + "/mutool.exe");
		command.add("info");
		command.add("-M");
		command.add(storage.originalPath(id));

		this.logger.debug("command: " + command.toString());

		ProcessBuilder processBuilder = new ProcessBuilder(command);

		processBuilder.redirectError(Redirect.INHERIT);

		InputStreamReader input = null;
		BufferedReader reader = null;

		try {
			Process process = processBuilder.start();

			input = new InputStreamReader(process.getInputStream());
			reader = new BufferedReader(input);

			while (true) {
				String line = reader.readLine();

				if (line == null) {
					break;
				}

				if (line.startsWith("Pages:")) {
					info.pages = Integer.parseInt(line.substring(7));
				}

				if (line.indexOf('[') != -1 && info.pages != 0) {
					String[] tokenList = line.substring(line.indexOf('[') + 2, line.indexOf(']') - 1).split(" ");

					info.width = (int)Math.ceil(Double.parseDouble(tokenList[2]) - Double.parseDouble(tokenList[0]));
					info.height = (int)Math.ceil(Double.parseDouble(tokenList[3]) - Double.parseDouble(tokenList[1]));

					break;
				}
			}

			process.waitFor();
		}
		catch (Exception e) {
			this.logger.debug("\ninfo 작업 오류 발생;\nid: " + id + "\nmutool 실행 오류.");

			info.pages = 0;
			info.width = 0;
			info.height = 0;
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

		this.logger.debug("pdf info\npages: " + info.pages + "\nwidth: " + info.width + "\nheight: " + info.height);

		return info;
	}

	public class PdfInfo {

		public int pages = 0;
		public int width = 0;
		public int height = 0;
	}
}
