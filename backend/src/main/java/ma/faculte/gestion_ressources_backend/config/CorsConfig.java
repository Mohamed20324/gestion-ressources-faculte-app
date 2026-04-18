//package ma.faculte.gestion_ressources_backend.config;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.servlet.config.annotation.CorsRegistry;
//import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
//
///*
// * CONFIGURATION CORS
// * Permet au frontend React de communiquer avec ce backend
// * sans erreur de Cross-Origin
// *
// * LIEN FRONTEND MEMBRES 1 et 2 :
// * React tourne sur http://localhost:3000
// * Spring Boot tourne sur http://localhost:8081
// * Sans cette config les requêtes Axios seront bloquées
// */
//
//@Configuration
//public class CorsConfig {
//
//    @Bean
//    public WebMvcConfigurer corsConfigurer() {
//        return new WebMvcConfigurer() {
//            @Override
//            public void addCorsMappings(CorsRegistry registry) {
//                registry.addMapping("/api/**")
//                        .allowedOrigins(
//                                "http://localhost:3000",
//                                "http://localhost:5173"
//                        )
//                        /*
//                         * 3000 = port React classique
//                         * 5173 = port Vite React
//                         * les deux sont autorisés
//                         */
//                        .allowedMethods("GET", "POST", "PUT", "DELETE")
//                        .allowedHeaders("*");
//            }
//        };
//    }
//}