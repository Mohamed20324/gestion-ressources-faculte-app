package ma.faculte.gestion_ressources_backend.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static Optional<Long> currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return Optional.empty();
        }
        Object details = auth.getDetails();
        if (details instanceof Long l) {
            return Optional.of(l);
        }
        if (details instanceof Number n) {
            return Optional.of(n.longValue());
        }
        return Optional.empty();
    }

    public static Long requireUserId() {
        return currentUserId().orElseThrow(() -> new RuntimeException("Utilisateur non authentifié"));
    }

    /**
     * Rôle métier sans préfixe ROLE_ (ex. RESPONSABLE), ou vide si inconnu.
     */
    public static Optional<String> primaryRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return Optional.empty();
        }
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .findFirst()
                .map(a -> a.substring("ROLE_".length()));
    }
}
