package ma.faculte.gestion_ressources_backend.entities.utilisateurs;

import jakarta.persistence.*;
import ma.faculte.gestion_ressources_backend.entities.departement.Departement;

/*
 * ENSEIGNANT — hérite de Utilisateur
 * Table créée : enseignants
 * Liée à la table utilisateurs via la colonne id
 *
 * Un enseignant appartient à UN SEUL département
 *
 * LIEN AVEC AUTRES MEMBRES :
 * - Membre 4 utilise Enseignant dans :
 *     SignalementPanne (l'enseignant qui signale)
 *     Affectation (la ressource affectée à l'enseignant)
 * - Membre 1 Frontend : page de soumission des besoins
 *   et page de signalement de panne utilisent cet acteur
 *
 * ATTENTION : ChefDepartement hérite de cette classe
 * voir ChefDepartement.java
 */

@Entity
@Table(name = "enseignants")
public class Enseignant extends Utilisateur {

    @Column(nullable = false, unique = true)
    private String matricule;

    @Column(nullable = true)
    private String specialite;

    /*
     * Un enseignant appartient à un seul département
     * fetch LAZY = le département n'est chargé que si on y accède
     * évite les requêtes inutiles en base de données
     *
     * ATTENTION : ne pas oublier @JsonIgnore dans le DTO
     * pour éviter la boucle infinie lors de la sérialisation JSON
     * Departement → List<Enseignant> → Departement → ...
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departement_id", nullable = true)
    private Departement departement;

    // =====================
    // CONSTRUCTEURS
    // =====================

    public Enseignant() {}

    public Enseignant(String nom, String prenom, String email,
                      String motDePasse, String matricule,
                      String specialite, Departement departement) {
        super(nom, prenom, email, motDePasse, "ENSEIGNANT");
        this.matricule = matricule;
        this.specialite = specialite;
        this.departement = departement;
    }

    // =====================
    // GETTERS ET SETTERS
    // =====================

    public String getMatricule() { return matricule; }
    public void setMatricule(String matricule) { this.matricule = matricule; }

    public String getSpecialite() { return specialite; }
    public void setSpecialite(String specialite) { this.specialite = specialite; }

    public Departement getDepartement() { return departement; }
    public void setDepartement(Departement departement) { this.departement = departement; }
}