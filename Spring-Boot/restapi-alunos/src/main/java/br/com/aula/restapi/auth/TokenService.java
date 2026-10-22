package br.com.aula.restapi.auth;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

/**
 * Serviço de token apenas para a atividade. Não substitui um servidor OAuth2.
 */
@Service
@Profile("parte2")
public class TokenService {

    private static final Logger LOGGER = LoggerFactory.getLogger(TokenService.class);
    private static final String USERNAME = "user";
    private static final long TOKEN_DURATION_SECONDS = 3_600;

    private final SecureRandom random = new SecureRandom();
    private final Map<String, Instant> tokens = new ConcurrentHashMap<>();
    private final String password = randomValue(12);

    @EventListener(ApplicationReadyEvent.class)
    public void showCredentials() {
        LOGGER.info("ATIVIDADE PARTE 2 - usuario para token: {}", USERNAME);
        LOGGER.info("ATIVIDADE PARTE 2 - senha gerada para token: {}", password);
    }

    public String createToken(String username, String suppliedPassword) {
        if (!USERNAME.equals(username) || !password.equals(suppliedPassword)) {
            return null;
        }

        String token = randomValue(32);
        tokens.put(token, Instant.now().plusSeconds(TOKEN_DURATION_SECONDS));
        return token;
    }

    public boolean isValid(String token) {
        Instant expiresAt = tokens.get(token);
        if (expiresAt == null) {
            return false;
        }
        if (Instant.now().isAfter(expiresAt)) {
            tokens.remove(token);
            return false;
        }
        return true;
    }

    public long tokenDurationSeconds() {
        return TOKEN_DURATION_SECONDS;
    }

    private String randomValue(int bytes) {
        byte[] value = new byte[bytes];
        random.nextBytes(value);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
    }
}
