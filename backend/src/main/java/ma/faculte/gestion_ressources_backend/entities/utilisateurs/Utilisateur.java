package ma.faculte.gestion_ressources_backend.entities.utilisateurs;

import jakarta.persistence.*;
import java.time.LocalDate;

/*
 * CLASSE MÈRE DE TOUS LES ACTEURS DU SYSTÈME
 * Stratégie JOINED = une table par sous-classe
 * Chaque sous-classe a sa propre table liée à cette table mère
 *
 * Tables créées automatiquement en MySQL :
 * - utilisateurs        (cette classe)
 * - enseignants         (Enseignant.java)
 * - chefs_departement   (ChefDepartement.java)
 * - responsables        (Responsable.java)
 * - techniciens         (Technicien.java)
 * - fournisseurs        (Fournisseur.java)
 *
 * LIEN AVEC AUTRES MEMBRES :
 * - Membre 4 utilise cette classe pour ses entités
 *   SignalementPanne, Constat, DemandeIntervention
 * - Frontend Membres 1 et 2 reçoivent ces données
 *   via les DTOs dans les réponses API
 */

@Entity
@Table(name = "utilisateurs")
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * nom et prenom obligatoires pour tous les utilisateurs
     * sauf Fournisseur qui utilise nomSociete à la place
     * voir Fournisseur.java pour les détails
     */
    @Column(nullable = true)
    private String nom;

    @Column(nullable = true)
    private String prenom;

    /*
     * email est unique dans toute la table utilisateurs
     * utilisé comme identifiant de connexion
     * voir AuthController.java pour le login
     */
    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String motDePasse;

    /*
     * role possible :
     * ENSEIGNANT / CHEF_DEPARTEMENT / RESPONSABLE / TECHNICIEN / FOURNISSEUR
     * utilisé plus tard pour Spring Security JWT
     * pour l'instant gestion manuelle dans les controllers
     */
    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private LocalDate dateCreation;

    /*
     * actif = false si le compte est désactivé
     * le Responsable peut désactiver un compte
     * sans le supprimer de la base de données
     */
    @Column(nullable = false)
    private boolean actif = true;

    // =====================
    // CONSTRUCTEURS
    // =====================

    public Utilisateur() {}

    public Utilisateur(String nom, String prenom, String email,
                       String motDePasse, String role) {
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.motDePasse = motDePasse;
        this.role = role;
        this.dateCreation = LocalDate.now();
        this.actif = true;
    }

    // =====================
    // GETTERS ET SETTERS
    // =====================

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

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public LocalDate getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDate dateCreation) { this.dateCreation = dateCreation; }

    public boolean isActif() { return actif; }
    public void setActif(boolean actif) { this.actif = actif; }
}