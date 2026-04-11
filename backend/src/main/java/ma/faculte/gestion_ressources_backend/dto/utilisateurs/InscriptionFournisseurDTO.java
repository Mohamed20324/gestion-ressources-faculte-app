package ma.faculte.gestion_ressources_backend.dto.utilisateurs;

/*
 * DTO INSCRIPTION FOURNISSEUR
 * Utilisé uniquement pour l'inscription autonome
 * Seuls nomSociete, email et motDePasse sont requis
 * Les autres champs sont remplis après première livraison
 *
 * UTILISÉ PAR : AuthController (POST /api/auth/register)
 */

public class InscriptionFournisseurDTO {

    /*
     * ces 3 champs sont OBLIGATOIRES à l'inscription
     */
    private String nomSociete;
    private String email;
    private String motDePasse;

    public InscriptionFournisseurDTO() {}

    public String getNomSociete() { return nomSociete; }
    public void setNomSociete(String nomSociete) { this.nomSociete = nomSociete; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMotDePasse() { return motDePasse; }
    public void setMotDePasse(String motDePasse) { this.motDePasse = motDePasse; }
}