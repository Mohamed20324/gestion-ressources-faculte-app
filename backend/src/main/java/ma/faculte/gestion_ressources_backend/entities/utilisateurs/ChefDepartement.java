package ma.faculte.gestion_ressources_backend.entities.utilisateurs;

import jakarta.persistence.*;
import ma.faculte.gestion_ressources_backend.entities.departement.Departement;
import java.time.LocalDate;

/*
 * CHEF DE DÉPARTEMENT — hérite de Enseignant
 * Table créée : chefs_departement
 * Liée à la table enseignants via la colonne id
 * Liée à la table utilisateurs via enseignants
 *
 * Hiérarchie : Utilisateur → Enseignant → ChefDepartement
 *
 * Le chef est avant tout un enseignant
 * Il a en plus la responsabilité de gérer un département
 *
 * IMPORTANT : on a supprimé la double relation Departement
 * Le chef utilise uniquement departementGere
 * La relation departement héritée de Enseignant
 * sera null pour le chef car il gère via departementGere
 *
 * LIEN AVEC AUTRES MEMBRES :
 * - Membre 1 Frontend : page de gestion des besoins
 *   et page de réunion de concertation
 * - Membre 3 (toi) : ReunionServiceImpl utilise
 *   cette entité pour vérifier les droits
 */

@Entity
@Table(name = "chefs_departement")
public class ChefDepartement extends Enseignant {

    @Column(nullable = true)
    private LocalDate dateNomination;

    /*
     * departementGere = le département que ce chef dirige
     * OneToOne = un chef dirige un seul département
     * et un département a un seul chef
     *
     * mappedBy absent ici car on met la clé étrangère
     * dans la table chefs_departement
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departement_gere_id", nullable = true)
    private Departement departementGere;

    // =====================
    // CONSTRUCTEURS
    // =====================

    public ChefDepartement() {}

    public ChefDepartement(String nom, String prenom, String email,
                           String motDePasse, String matricule,
                           String specialite, Departement departementGere) {
        super(nom, prenom, email, motDePasse, matricule, specialite, null);
        /*
         * on passe null pour departement hérité de Enseignant
         * car le chef utilise departementGere à la place
         */
        setRole("CHEF_DEPARTEMENT");
        this.departementGere = departementGere;
        this.dateNomination = LocalDate.now();
    }

    // =====================
    // GETTERS ET SETTERS
    // =====================

    public LocalDate getDateNomination() { return dateNomination; }
    public void setDateNomination(LocalDate dateNomination) {
        this.dateNomination = dateNomination;
    }

    public Departement getDepartementGere() { return departementGere; }
    public void setDepartementGere(Departement departementGere) {
        this.departementGere = departementGere;
    }
}