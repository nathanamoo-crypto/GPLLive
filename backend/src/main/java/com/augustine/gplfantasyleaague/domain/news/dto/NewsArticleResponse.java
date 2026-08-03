package com.augustine.gplfantasyleaague.domain.news.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NewsArticleResponse {
    // Stable id derived from the RSS entry's guid (falls back to the
    // article link if a feed entry has no guid) - the frontend doesn't
    // need to look this back up server-side, it just uses it as a React
    // list key, so it only needs to be unique, not resolvable.
    private String id;
    private String headline;
    // Short plain-text excerpt (HTML stripped, truncated) - RSS feeds
    // never include the full article body, just a summary.
    private String summary;
    private String imageUrl;
    private String source;
    private String publishedAt;
    private String url;
}
