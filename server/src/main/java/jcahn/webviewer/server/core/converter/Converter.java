package jcahn.webviewer.server.core.converter;

import java.io.File;
import java.lang.ProcessBuilder.Redirect;
import java.util.ArrayList;
import java.util.HashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class Converter {

	@Value("#{properties['doc.org.path']}")
	private String docOrgPath;

	@Value("#{properties['doc.cache.path']}")
	private String docCachePath;

	@Value("#{properties['max.waiting.millis']}")
	private int maxWaitingMillis;

	@Value("#{properties['converter.path']}")
	private String converterPath;

	private HashMap<String, HashMap<String, HashMap<String, String>>> jobMap = new HashMap<String, HashMap<String, HashMap<String, String>>>();

	final Logger logger = LoggerFactory.getLogger(this.getClass());

	public String convert(String id, String page, String scale) {

		String cachePath = this.docCachePath + "/" + id + "/";

		new File(cachePath).mkdirs();

		cachePath += id + "_" + scale + "_" + page + ".png";

		File file = new File(cachePath);

		// 파일이 있으면 캐시에서 가져간다.
		if (file.exists() && file.isFile()) {
			// 해당 페이지의 모든 변환 작업이 완료되었나?
			if (this.running(id, page, scale)) {
				int retry = 0;

				// 변환 작업이 끝날 때까지 대기
				while (this.running(id, page, scale) && retry < this.maxWaitingMillis) {
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

			return cachePath;
		}

		// 신규 변환 작업 등록
		this.add(id, page, scale);

		ArrayList<String> command = new ArrayList<String>();

		command.add(this.converterPath + "/mudraw.exe");
		command.add("-o");
		command.add(cachePath);
		if (scale.equals("2")) {
			command.add("-r");
			command.add("144");
		}
		else if (scale.equals("3")) {
			command.add("-r");
			command.add("216");
		}
		else if (scale.equals("4")) {
			command.add("-r");
			command.add("300");
		}
		command.add(this.docOrgPath + "/" + id + ".pdf");
		command.add(String.valueOf(page));

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
			this.remove(id, page, scale);
		}

		// 변환 완료된 파일이 있나?
		if (file.exists() == false || file.isFile() == false || file.length() == 0) {
			this.logger.debug("\nconvert 작업 오류 발생;\nid: " + id + "\npage: " + page + "\n변환 결과물이 없음.");

			return null;
		}

		return cachePath;
	}

	private boolean running(String id, String page, String scale) {

		synchronized (this.jobMap) {
			HashMap<String, HashMap<String, String>> pageMap = this.jobMap.get(id);

			if (pageMap == null) {
				return false;
			}

			HashMap<String, String> scaleMap = pageMap.get(page);

			if (scaleMap == null || scaleMap.get(scale) == null) {
				return false;
			}
		}

		return true;
	}

	private void add(String id, String page, String scale) {

		synchronized (this.jobMap) {
			HashMap<String, HashMap<String, String>> pageMap = this.jobMap.get(id);

			if (pageMap == null) {
				pageMap = new HashMap<String, HashMap<String, String>>();

				this.jobMap.put(id, pageMap);
			}

			HashMap<String, String> scaleMap = pageMap.get(page);

			if (scaleMap == null) {
				scaleMap = new HashMap<String, String>();

				pageMap.put(page, scaleMap);
			}

			scaleMap.put(scale, scale);
		}
	}

	private void remove(String id, String page, String scale) {

		synchronized (this.jobMap) {
			HashMap<String, HashMap<String, String>> pageMap = this.jobMap.get(id);

			if (pageMap != null) {
				HashMap<String, String> scaleMap = pageMap.get(page);

				if (scaleMap != null) {
					scaleMap.remove(scale);

					if (scaleMap.size() == 0) {
						pageMap.remove(page);
					}
				}

				if (pageMap.size() == 0) {
					this.jobMap.remove(id);
				}
			}
		}
	}
}
