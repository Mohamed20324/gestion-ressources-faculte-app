package ma.faculte.gestion_ressources_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Désactive la protection CSRF (car nous faisons une API REST)
                .csrf(AbstractHttpConfigurer::disable)
                // Active la configuration CORS (pour que React puisse nous parler)
                .cors(cors -> cors.configure(http))
                // Règle les permissions
                .authorizeHttpRequests(auth -> auth
                        // On laisse l'accès libre aux routes de login/logout
                        .requestMatchers("/api/auth/**").permitAll()
                        // Tout le reste est bloqué si on n'est pas connecté
                        .anyRequest().authenticated()
                );

        return http.build();
    }

    // Ce Bean autorise spécifiquement les ports utilisés par React (5173 ou 3000)
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}