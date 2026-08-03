package com.augustine.gplfantasyleaague.config;

import org.flywaydb.core.Flyway;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class FlywayConfig {
    @Bean
    public Flyway flyway(DataSource dataSource) {
        Flyway flyway =  Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .baselineOnMigrate(true)
                .schemas("public")
                .load();

        flyway.migrate();  // then runs any pending migrations

        return flyway;

    }
}
