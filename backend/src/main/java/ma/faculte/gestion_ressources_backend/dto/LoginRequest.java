package ma.faculte.gestion_ressources_backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/*
 * DTO LOGIN REQUEST
 * Utilisé par AuthController pour le login
 *
 * ATTENTION :
 * le fichier existant de ton ami utilisait getUsername()
 * on remplace par email pour être cohérent
 * avec notre entité Utilisateur
 */

public class LoginRequest {

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Email invalide")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    private String password;

    public LoginRequest() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}