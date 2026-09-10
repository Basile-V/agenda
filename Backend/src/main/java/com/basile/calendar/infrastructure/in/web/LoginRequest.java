package com.basile.calendar.infrastructure.in.web;

import jakarta.validation.constraints.NotBlank;

record LoginRequest(@NotBlank String username, @NotBlank String password) {
}
