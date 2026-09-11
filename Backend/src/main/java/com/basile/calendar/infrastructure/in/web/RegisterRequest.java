package com.basile.calendar.infrastructure.in.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

record RegisterRequest(
        @NotBlank String username, @NotBlank @Size(min = 8) String password, @NotBlank String displayName) {
}
