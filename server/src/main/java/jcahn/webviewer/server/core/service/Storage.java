package jcahn.webviewer.server.core.service;

import java.io.File;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class Storage {

	@Value("#{properties['doc.org.path']}")
	private String docOrgPath;

	@Value("#{properties['doc.cache.path']}")
	private String docCachePath;

	public String cachePath(String id, String page) {

		String cachePath = this.docCachePath + "/" + id + "/";

		new File(cachePath).mkdirs();

		cachePath += id + "_" + page + ".png";

		return cachePath;
	}

	public String originalPath(String id) {

		return this.docOrgPath + "/" + id + ".pdf";
	}
}
