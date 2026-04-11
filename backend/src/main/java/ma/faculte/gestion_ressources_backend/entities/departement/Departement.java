package ma.faculte.gestion_ressources_backend.entities.departement;

import jakarta.persistence.*;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.ChefDepartement;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Enseignant;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;
import java.util.ArrayList;

/*
 * DÉPARTEMENT — entité centrale du système
 * Table créée : departements
 *
 * Un département a :
 * - un seul chef (ChefDepartement)
 * - plusieurs enseignants (List<Enseignant>)
 * - un budget pour les achats de ressources
 *
 * LIEN AVEC AUTRES MEMBRES :
 * - Membre 4 utilise Departement dans Affectation.java
 *   pour les ressources affectées au département entier
 * - Membre 3 (toi) utilise Departement dans
 *   BesoinRessource.java et Reunion.java
 * - Membre 1 Frontend : le chef voit son département
 *   et les besoins associés
 *
 * ATTENTION BOUCLE INFINIE :
 * Departement → List<Enseignant> → Departement → ...
 * Solution : @JsonIgnore sur enseignants et chef
 * Les données sont transmises via les DTOs
 */

@Entity
@Table(name = "departements")
public class Departement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nom;

    @Column(nullable = true)
    private Double budget;

    /*
     * @JsonIgnore évite la boucle infinie lors
     * de la sérialisation JSON
     * ChefDepartement → Departement → ChefDepartement → ...
     */
    @JsonIgnore
    @OneToOne(mappedBy = "departementGere", fetch = FetchType.LAZY)
    private ChefDepartement chef;

    /*
     * @JsonIgnore même raison
     * Departement → List<Enseignant> → Departement → ...
     * Pour récupérer les enseignants d'un département
     * utilise le endpoint :
     * GET /api/utilisateurs/role/ENSEIGNANT
     * filtré par departementId dans le service
     */
    @JsonIgnore
    @OneToMany(mappedBy = "departement", fetch = FetchType.LAZY)
    private List<Enseignant> enseignants = new ArrayList<>();

    // =====================
    // CONSTRUCTEURS
    // =====================

    public Departement() {}

    public Departement(String nom, Double budget) {
        this.nom = nom;
        this.budget = budget;
    }

    // =====================
    // GETTERS ET SETTERS
    // =====================

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public Double getBudget() { return budget; }
    public void setBudget(Double budget) { this.budget = budget; }

    public ChefDepartement getChef() { return chef; }
    public void setChef(ChefDepartement chef) { this.chef = chef; }

    public List<Enseignant> getEnseignants() { return enseignants; }
    public void setEnseignants(List<Enseignant> enseignants) {
        this.enseignants = enseignants;
    }
}