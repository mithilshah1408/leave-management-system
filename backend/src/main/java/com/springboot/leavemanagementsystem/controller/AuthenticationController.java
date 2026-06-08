package springboot.leavemanagementsystem.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import springboot.leavemanagementsystem.dto.LoginRequest;
import springboot.leavemanagementsystem.dto.LoginResponse;
import springboot.leavemanagementsystem.entity.User;
import springboot.leavemanagementsystem.repository.UserRepository;
import springboot.leavemanagementsystem.service.JwtService;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public AuthenticationController(AuthenticationManager authenticationManager,
                                    JwtService jwtService,
                                    UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    /**
     * Lightweight health-check used by the frontend to warm up the server.
     * No auth required — already covered by /api/auth/** in SecurityConfig.
     */
    @GetMapping("/ping")
    public ResponseEntity<Map<String, String>> ping() {
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        String token = jwtService.generateToken(request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();

        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setRole(user.getRole().getName());

        return ResponseEntity.ok(response);
    }
}
