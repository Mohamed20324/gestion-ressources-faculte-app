package ma.faculte.gestion_ressources_backend.entities.departement;

import jakarta.persistence.*;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Enseignant;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;
import java.util.ArrayList;

/*
 * DÉPARTEMENT — entité centrale du système
 * Table créée : departements
 *
 * RELATION CHEF → sens unique (unidirectionnelle) :
 * C'est ChefDepartement qui porte la FK (departement_gere_id)
 * On retrouve le chef via : chefRepository.findByDepartementGereId(dept.id)
 * Suppression du champ 'chef' ici → évite les problèmes de lazy loading
 * et de synchronisation des deux côtés de la relation.
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

    public List<Enseignant> getEnseignants() { return enseignants; }
    public void setEnseignants(List<Enseignant> enseignants) {
        this.enseignants = enseignants;
    }
}