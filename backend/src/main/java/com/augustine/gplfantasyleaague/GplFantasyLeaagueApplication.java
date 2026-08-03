package com.augustine.gplfantasyleaague;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GplFantasyLeaagueApplication {

    public static void main(String[] args) {
        SpringApplication.run(GplFantasyLeaagueApplication.class, args);
    }

}
