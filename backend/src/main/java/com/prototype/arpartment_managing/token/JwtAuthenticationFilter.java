package com.prototype.arpartment_managing.token;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain chain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");

        // If no Authorization header or not a Bearer token, continue with filter chain
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        try {
            // Extract and validate the JWT token
            String jwt = authHeader.substring(7);

            if (jwt.isEmpty()) {
                chain.doFilter(request, response);
                return;
            }

            // Only proceed if token is valid and we have no authentication yet
            if (jwtUtil.validateToken(jwt) && SecurityContextHolder.getContext().getAuthentication() == null) {
                String username = jwtUtil.extractUsername(jwt);
                String role = jwtUtil.extractRole(jwt);

                // Create authorities list with ROLE_ prefix (Spring Security convention)
                List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                        new SimpleGrantedAuthority("ROLE_" + role)
                );

                // Create authentication token
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(username, null, authorities);

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Set authentication in context
                SecurityContextHolder.getContext().setAuthentication(authToken);
                logger.debug("Authenticated user: {}, with role: {}", username, role);
            }
        } catch (Exception e) {
            logger.error("Authentication error: {}", e.getMessage());
        }

        chain.doFilter(request, response);
    }
}