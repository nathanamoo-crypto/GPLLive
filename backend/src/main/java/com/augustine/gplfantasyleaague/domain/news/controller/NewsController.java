package com.augustine.gplfantasyleaague.domain.news.controller;

import com.augustine.gplfantasyleaague.domain.news.dto.NewsArticleResponse;
import com.augustine.gplfantasyleaague.domain.news.service.NewsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/news")
public class NewsController {
    private final NewsService newsService;

    public NewsController(NewsService newsService) {
        this.newsService = newsService;
    }

    // ?page=1 (default) is the current live set; the frontend cycles this
    // on pull-to-refresh so refreshing surfaces a genuinely different real
    // set of articles instead of the same handful every time.
    @GetMapping
    public ResponseEntity<List<NewsArticleResponse>> getLatestNews(
            @RequestParam(defaultValue = "1") int page) {
        return ResponseEntity.ok(newsService.getLatestNews(page));
    }
}
