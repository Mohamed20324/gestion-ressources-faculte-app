package ma.faculte.gestion_ressources_backend.dto.utilisateurs;

/*
 * DTO ENSEIGNANT
 * Utilisé pour créer et modifier un enseignant
 * Contient les champs de Utilisateur + champs spécifiques
 *
 * UTILISÉ PAR :
 * - UtilisateurController (POST /api/utilisateurs)
 * - UtilisateurServiceImpl
 */

public class EnseignantDTO {

    private Long id;
    private String nom;
    private String prenom;
    private String email;

    /*
     * motDePasse inclus ici car utilisé à la création
     * ne jamais le retourner dans la réponse
     * voir UtilisateurServiceImpl.creerUtilisateur()
     */
    private String motDePasse;

    private String matricule;
    private String specialite;

    /*
     * on passe l'id du département
     * pas l'objet complet pour éviter la complexité
     */
    private Long departementId;

    public EnseignantDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMotDePasse() { return motDePasse; }
    public void setMotDePasse(String motDePasse) { this.motDePasse = motDePasse; }

    public String getMatricule() { return matricule; }
    public void setMatricule(String matricule) { this.matricule = matricule; }

    public String getSpecialite() { return specialite; }
    public void setSpecialite(String specialite) { this.specialite = specialite; }

    public Long getDepartementId() { return departementId; }
    public void setDepartementId(Long departementId) {
        this.departementId = departementId;
    }
}