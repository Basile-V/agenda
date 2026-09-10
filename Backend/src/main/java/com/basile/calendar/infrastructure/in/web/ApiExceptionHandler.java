package com.basile.calendar.infrastructure.in.web;

import com.basile.calendar.domain.model.exception.AuthenticationFailedException;
import com.basile.calendar.domain.model.exception.DomainException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
class ApiExceptionHandler {

    @ExceptionHandler(DomainException.class)
    ResponseEntity<ErrorResponse> handleDomainException(DomainException exception) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(exception.getMessage()));
    }

    @ExceptionHandler(AuthenticationFailedException.class)
    ResponseEntity<ErrorResponse> handleAuthenticationFailedException(AuthenticationFailedException exception) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse(exception.getMessage()));
    }
}
