package com.prototype.arpartment_managing.token;

import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class TokenBlackList {
    private final Set<String> blacklistedTokens = new HashSet<>();

    public void addToBlacklist(String token) {
        blacklistedTokens.add(token);
    }

    public boolean isBlacklisted(String token) {
        return blacklistedTokens.contains(token);
    }

    public void removeFromBlacklist(String token) {
        blacklistedTokens.remove(token);
    }
}
