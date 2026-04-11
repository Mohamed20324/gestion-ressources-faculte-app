package ma.faculte.gestion_ressources_backend.entities.utilisateurs;

import jakarta.persistence.*;

/*
 * TECHNICIEN DE MAINTENANCE — hérite de Utilisateur
 * Table créée : techniciens
 * Liée à la table utilisateurs via la colonne id
 *
 * LIEN AVEC AUTRES MEMBRES :
 * - Membre 4 utilise Technicien dans :
 *     SignalementPanne (assigné au technicien)
 *     Constat (technicien qui rédige)
 * - Membre 2 Frontend : page de gestion des pannes
 *   et page de rédaction du constat
 *
 * IMPORTANT POUR MEMBRE 4 :
 * quand tu crées SignalementPanne.java ajoute :
 * @ManyToOne
 * @JoinColumn(name = "technicien_id")
 * private Technicien technicien;
 */

@Entity
@Table(name = "techniciens")
public class Technicien extends Utilisateur {

    @Column(nullable = false, unique = true)
    private String matricule;

    @Column(nullable = true)
    private String specialiteTechnique;

    // =====================
    // CONSTRUCTEURS
    // =====================

    public Technicien() {}

    public Technicien(String nom, String prenom, String email,
                      String motDePasse, String matricule,
                      String specialiteTechnique) {
        super(nom, prenom, email, motDePasse, "TECHNICIEN");
        this.matricule = matricule;
        this.specialiteTechnique = specialiteTechnique;
    }

    // =====================
    // GETTERS ET SETTERS
    // =====================

    public String getMatricule() { return matricule; }
    public void setMatricule(String matricule) { this.matricule = matricule; }

    public String getSpecialiteTechnique() { return specialiteTechnique; }
    public void setSpecialiteTechnique(String s) { this.specialiteTechnique = s; }
}