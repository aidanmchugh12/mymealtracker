package backend.api.auth;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String jwtSecret;

    private static final long EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000L; // 7 days

    public String generateToken(String userId, String email) {
        return JWT.create()
                .withSubject(userId)
                .withClaim("email", email)
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .sign(Algorithm.HMAC256(jwtSecret));
    }

    public DecodedJWT validateToken(String token) throws JWTVerificationException {
        return JWT.require(Algorithm.HMAC256(jwtSecret))
                .build()
                .verify(token);
    }

    public String getUserIdFromToken(String token) {
        try {
            return validateToken(token).getSubject();
        } catch (Exception e) {
            return null;
        }
    }

    public String getEmailFromToken(String token) {
        try {
            return validateToken(token).getClaim("email").asString();
        } catch (Exception e) {
            return null;
        }
    }
}