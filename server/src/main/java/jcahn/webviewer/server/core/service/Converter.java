package jcahn.webviewer.server.core.service;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.lang.ProcessBuilder.Redirect;
import java.util.ArrayList;
import java.util.HashMap;
import javax.servlet.ServletOutputStream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class Converter {

	@Autowired
	Storage storage;

	@Value("#{properties['converter.path']}")
	private String converterPath;

	@Value("#{properties['max.waiting.millis']}")
	private int maxWaitingMillis;

	private HashMap<String, HashMap<String, String>> jobMap = new HashMap<String, HashMap<String, String>>();

	final Logger logger = LoggerFactory.getLogger(this.getClass());

	public String convert(String id, String page) {

		String cachePath = storage.cachePath(id, page);
		File file = new File(cachePath);

		if (file.exists() && file.isFile()) {
			if (this.running(id, page)) {
				int retry = 0;

				while (this.running(id, page) && retry < this.maxWaitingMillis) {
					try {
						Thread.sleep(1);
					}
					catch (Exception e) {}

					retry ++;
				}

				if (retry >= this.maxWaitingMillis) {
					this.logger.debug("\nconvert 작업 오류 발생;\nid: " + id + "\npage: " + page + "\nJOB 등록 대기 시간 초과.");

					return null;
				}
			}

			this.logger.debug("cache path: " + cachePath);

			return cachePath;
		}

		this.add(id, page);

		ArrayList<String> command = new ArrayList<String>();

		command.add(this.converterPath + "/mudraw.exe");
		command.add("-o");
		command.add(cachePath);
		command.add("-r");
		command.add("300");
		command.add(storage.originalPath(id));
		command.add(String.valueOf(page));

		this.logger.debug("command: " + command.toString());

		ProcessBuilder processBuilder = new ProcessBuilder(command);

		processBuilder.redirectError(Redirect.INHERIT);
		processBuilder.redirectOutput(Redirect.INHERIT);

		try {
			Process process = processBuilder.start();

			process.waitFor();
		}
		catch (Exception e) {
			this.logger.debug("\nconvert 작업 오류 발생;\nid: " + id + "\npage: " + page + "\nmudraw 실행 오류.");

			return null;
		}
		finally {
			this.remove(id, page);
		}

		if (file.exists() == false || file.isFile() == false || file.length() == 0) {
			this.logger.debug("\nconvert 작업 오류 발생;\nid: " + id + "\npage: " + page + "\n변환 결과물이 없음.");

			return null;
		}

		this.logger.debug("cache path: " + cachePath);

		return cachePath;
	}

	public String dimension(String filePath) {

		ArrayList<String> command = new ArrayList<String>();

		command.add(this.converterPath + "/identify.exe");
		command.add(filePath);

		this.logger.debug("command: " + command.toString());

		ProcessBuilder processBuilder = new ProcessBuilder(command);

		processBuilder.redirectError(Redirect.INHERIT);

		InputStreamReader input = null;
		BufferedReader reader = null;
		String geometry = null;

		try {
			Process process = processBuilder.start();

			input = new InputStreamReader(process.getInputStream());
			reader = new BufferedReader(input);

			while (true) {
				String line = reader.readLine();

				if (line == null) {
					break;
				}

				int index = line.indexOf(" PNG ");

				if (index != -1) {
					geometry = line.substring(index + 5, line.indexOf(' ', index + 5));
				}
			}

			process.waitFor();
		}
		catch (Exception e) {
			this.logger.debug("\nconvert 작업 오류 발생;\nfile: " + filePath + "\nidentify 실행 오류.");

			return null;
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

		String[] token = geometry.split("x");

		int width = Integer.parseInt(token[0]) / 3;
		int height = Integer.parseInt(token[1]) / 3;

		this.logger.debug("dimension: " + width + "x" + height);

		return width + "x" + height;
	}

	public void resize(String id, String page, int width, int height, ServletOutputStream output) {

		ArrayList<String> command = new ArrayList<String>();

		command.add(this.converterPath + "/convert.exe");
		command.add(storage.cachePath(id, page));
		command.add("-resize");
		command.add(width + "x" + height);
		command.add("-");

		this.logger.debug("command: " + command.toString());

		ProcessBuilder processBuilder = new ProcessBuilder(command);

		processBuilder.redirectError(Redirect.INHERIT);

		BufferedInputStream input = null;

		try {
			Process process = processBuilder.start();

			input = new BufferedInputStream(process.getInputStream());

			byte buffer[] = new byte[1000000];
			int size;

			while((size = input.read(buffer, 0, buffer.length)) != -1) {
				output.write(buffer, 0, size);
			}

			output.flush();

			process.waitFor();
		}
		catch (Exception e) {
			this.logger.debug("\nresize 작업 오류 발생;\nfile: " + storage.cachePath(id, page) + "\nconvert 실행 오류.");
		}
		finally {
			try {
				input.close();
			}
			catch (Exception e) {}
		}
	}

	// --------------------------------------------------

	private void add(String id, String page) {

		synchronized (this.jobMap) {
			HashMap<String, String> pageMap = this.jobMap.get(id);

			if (pageMap == null) {
				pageMap = new HashMap<String, String>();

				this.jobMap.put(id, pageMap);
			}

			pageMap.put(page, page);
		}
	}

	private void remove(String id, String page) {

		synchronized (this.jobMap) {
			HashMap<String, String> pageMap = this.jobMap.get(id);

			if (pageMap != null) {
				pageMap.remove(page);

				if (pageMap.size() == 0) {
					this.jobMap.remove(id);
				}
			}
		}
	}

	private boolean running(String id, String page) {

		synchronized (this.jobMap) {
			HashMap<String, String> pageMap = this.jobMap.get(id);

			if (pageMap == null || pageMap.get(page) == null) {
				return false;
			}
		}

		return true;
	}
}
