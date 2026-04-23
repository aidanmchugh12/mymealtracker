package backend.api.controllers;

import backend.api.auth.JwtUtils;
import backend.api.db.UserRepository;
import backend.api.models.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        String username = body.get("username");

        if (email == null || password == null || username == null) {
            return ResponseEntity.badRequest().body("Email, password, and username are required");
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already in use");
        }

        String passwordHash = passwordEncoder.encode(password);
        User user = new User(email, username, passwordHash);
        userRepository.save(user);

        String token = jwtUtils.generateToken(user.getId(), user.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "token", token,
            "user", Map.of("id", user.getId(), "email", user.getEmail(), "username", user.getUsername())
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body("Email and password are required");
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        String token = jwtUtils.generateToken(user.getId(), user.getEmail());
        return ResponseEntity.ok(Map.of(
            "token", token,
            "user", Map.of("id", user.getId(), "email", user.getEmail(), "username", user.getUsername())
        ));
    }
}