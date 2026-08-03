package com.augustine.gplfantasyleaague.domain.news.service;

import com.augustine.gplfantasyleaague.domain.news.dto.NewsArticleResponse;
import com.rometools.rome.feed.synd.SyndContent;
import com.rometools.rome.feed.synd.SyndEnclosure;
import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

// Fetches and parses GhanaSoccernet's Ghana Premier League RSS feed on
// every call - no server-side caching, so a client-side pull-to-refresh
// always reflects whatever is live on the source site right now. GPL news
// doesn't publish frequently enough for that to be a real load concern for
// a single small app.
@Service
public class NewsService {
    private static final String FEED_URL = "https://ghanasoccernet.com/category/ghana-prem-league/feed";
    private static final String SOURCE_NAME = "GhanaSoccernet";
    private static final int SUMMARY_MAX_LENGTH = 200;
    private static final Pattern IMG_SRC_PATTERN =
            Pattern.compile("<img[^>]+src=[\"']([^\"']+)[\"']", Pattern.CASE_INSENSITIVE);
    private static final Pattern HTML_TAG_PATTERN = Pattern.compile("<[^>]+>");

    // page 1 is the live "latest" set. page 2+ asks WordPress for older
    // posts in the same category feed (?paged=N is a real WP query var that
    // applies to feeds, not just HTML archive pages) - this is what gives
    // pull-to-refresh a genuinely different set of real articles instead of
    // re-showing the same ~10 items every time, since GPL news doesn't
    // publish new posts often enough for the "latest" set to change between
    // two refreshes a few seconds apart.
    public List<NewsArticleResponse> getLatestNews(int page) {
        SyndFeed feed = fetchFeed(page);
        return feed.getEntries().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private SyndFeed fetchFeed(int page) {
        try {
            URL url = new URL(page <= 1 ? FEED_URL : FEED_URL + "/?paged=" + page);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setConnectTimeout(8000);
            connection.setReadTimeout(8000);
            // Some sites reject requests with no/blank User-Agent (treated
            // as bot traffic) - identify honestly as a feed reader instead.
            connection.setRequestProperty("User-Agent", "GPLLiveApp/1.0 (+RSS reader)");
            try (XmlReader reader = new XmlReader(connection)) {
                SyndFeedInput input = new SyndFeedInput();
                return input.build(reader);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch GPL news feed: " + e.getMessage(), e);
        }
    }

    private NewsArticleResponse mapToResponse(SyndEntry entry) {
        String description = entry.getDescription() != null ? entry.getDescription().getValue() : "";
        String contentHtml = description;
        if (entry.getContents() != null && !entry.getContents().isEmpty()) {
            SyndContent content = entry.getContents().get(0);
            if (content.getValue() != null && !content.getValue().isBlank()) {
                contentHtml = content.getValue();
            }
        }

        return NewsArticleResponse.builder()
                .id(resolveId(entry))
                .headline(resolveHeadline(entry))
                .summary(toSummary(description))
                .imageUrl(resolveImageUrl(entry, contentHtml))
                .source(SOURCE_NAME)
                .publishedAt(resolvePublishedAt(entry))
                .url(entry.getLink())
                .build();
    }

    // WordPress feed XML is pretty-printed, and titles aren't always wrapped
    // in CDATA - that lets the source's own indentation/newlines leak into
    // getTitle() as literal leading/trailing whitespace. Left uncleaned,
    // that shows up client-side as the headline looking indented compared
    // to the category/source lines around it, which are always clean
    // strings. Also strips a stray zero-width space some feeds insert.
    // Trims plain whitespace plus a few invisible characters feeds
    // sometimes leak in (zero-width space U+200B, BOM U+FEFF, non-breaking
    // space U+00A0) from either end of the title, using explicit \\u
    // escapes rather than pasted invisible characters so this is
    // unambiguous in source control.
    private static final Pattern LEADING_TRAILING_INVISIBLES =
            Pattern.compile("^[\\s\\u200B\\uFEFF\\u00A0]+|[\\s\\u200B\\uFEFF\\u00A0]+$");

    private String resolveHeadline(SyndEntry entry) {
        String title = entry.getTitle();
        if (title == null) return "Untitled";
        return LEADING_TRAILING_INVISIBLES.matcher(title).replaceAll("");
    }

    private String resolveId(SyndEntry entry) {
        if (entry.getUri() != null && !entry.getUri().isBlank()) {
            return entry.getUri();
        }
        return entry.getLink();
    }

    private String resolvePublishedAt(SyndEntry entry) {
        var date = entry.getPublishedDate() != null ? entry.getPublishedDate() : entry.getUpdatedDate();
        if (date == null) {
            return java.time.Instant.now().toString();
        }
        return date.toInstant()
                .atZone(ZoneId.of("UTC"))
                .format(DateTimeFormatter.ISO_INSTANT);
    }

    // Prefers an explicit media enclosure (a proper <enclosure type="image/..">
    // tag) if the feed provides one; WordPress feeds like this one usually
    // don't, so this falls back to pulling the first <img src="..."> out of
    // the entry's HTML content/description, which is where the featured
    // image actually lives in practice.
    private String resolveImageUrl(SyndEntry entry, String contentHtml) {
        if (entry.getEnclosures() != null) {
            for (SyndEnclosure enclosure : entry.getEnclosures()) {
                if (enclosure.getType() != null && enclosure.getType().startsWith("image") && enclosure.getUrl() != null) {
                    return enclosure.getUrl();
                }
            }
        }
        if (contentHtml != null) {
            Matcher matcher = IMG_SRC_PATTERN.matcher(contentHtml);
            if (matcher.find()) {
                return matcher.group(1);
            }
        }
        return null;
    }

    private String toSummary(String descriptionHtml) {
        if (descriptionHtml == null) return "";
        String plainText = HTML_TAG_PATTERN.matcher(descriptionHtml).replaceAll(" ")
                .replace("&nbsp;", " ")
                .replace("&#8217;", "'")
                .replace("&#8216;", "'")
                .replace("&#8220;", "\"")
                .replace("&#8221;", "\"")
                .replace("&amp;", "&")
                .trim()
                .replaceAll("\\s+", " ");
        if (plainText.length() <= SUMMARY_MAX_LENGTH) {
            return plainText;
        }
        // Cut at the last full word before the limit rather than mid-word.
        String truncated = plainText.substring(0, SUMMARY_MAX_LENGTH);
        int lastSpace = truncated.lastIndexOf(' ');
        if (lastSpace > 0) {
            truncated = truncated.substring(0, lastSpace);
        }
        return truncated.trim() + "...";
    }
}
