package ma.faculte.gestion_ressources_backend.entities.utilisateurs;

import jakarta.persistence.*;

/*
 * RESPONSABLE DES RESSOURCES — hérite de Utilisateur
 * Table créée : responsables
 * Liée à la table utilisateurs via la colonne id
 *
 * C'est l'acteur central du système
 * Il gère : appels d'offres, affectations,
 *           inventaire, liste noire, comptes utilisateurs
 *
 * LIEN AVEC AUTRES MEMBRES :
 * - Membre 4 utilise Responsable dans :
 *     DemandeIntervention (qui envoie la demande)
 *     Affectation (qui affecte la ressource)
 * - Membre 2 Frontend : dashboard principal du responsable
 */

@Entity
@Table(name = "responsables")
public class Responsable extends Utilisateur {

    @Column(nullable = false, unique = true)
    private String matricule;

    @Column(nullable = true)
    private String bureau;

    // =====================
    // CONSTRUCTEURS
    // =====================

    public Responsable() {}

    public Responsable(String nom, String prenom, String email,
                       String motDePasse, String matricule, String bureau) {
        super(nom, prenom, email, motDePasse, "RESPONSABLE");
        this.matricule = matricule;
        this.bureau = bureau;
    }

    // =====================
    // GETTERS ET SETTERS
    // =====================

    public String getMatricule() { return matricule; }
    public void setMatricule(String matricule) { this.matricule = matricule; }

    public String getBureau() { return bureau; }
    public void setBureau(String bureau) { this.bureau = bureau; }
}