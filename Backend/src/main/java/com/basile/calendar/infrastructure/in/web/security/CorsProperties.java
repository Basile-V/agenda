package com.basile.calendar.infrastructure.in.web.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.cors")
record CorsProperties(String allowedOrigin) {
}
