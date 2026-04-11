package ma.faculte.gestion_ressources_backend.entities.utilisateurs;

import jakarta.persistence.*;
import java.time.LocalDate;

/*
 * FOURNISSEUR — hérite de Utilisateur
 * Table créée : fournisseurs
 * Liée à la table utilisateurs via la colonne id
 *
 * INSCRIPTION AUTONOME :
 * Le fournisseur s'inscrit seul avec uniquement nomSociete
 * Les autres champs (lieu, adresse, siteInternet, gerant)
 * sont remplis après la PREMIÈRE LIVRAISON
 *
 * IMPORTANT POUR MEMBRE 4 :
 * Quand tu codes la livraison appelle cet endpoint
 * que je vais créer dans UtilisateurController :
 * PUT /api/utilisateurs/fournisseur/{id}/completer
 * Body : { lieu, adresse, siteInternet, gerant }
 *
 * LIEN AVEC AUTRES MEMBRES :
 * - Membre 4 utilise Fournisseur dans :
 *     DemandeIntervention (fournisseur destinataire)
 * - Membre 1 Frontend : page inscription fournisseur
 *   et page consultation appels d'offres
 *
 * NOTE : nom et prenom hérités de Utilisateur
 * sont nullable pour le fournisseur
 * car il utilise nomSociete à la place
 */

@Entity
@Table(name = "fournisseurs")
public class Fournisseur extends Utilisateur {

    /*
     * nomSociete est le SEUL champ obligatoire à l'inscription
     * voir InscriptionFournisseurDTO.java
     */
    @Column(nullable = false)
    private String nomSociete;

    /*
     * ces 4 champs sont remplis après la première livraison
     * nullable = true obligatoire sinon erreur à l'inscription
     */
    @Column(nullable = true)
    private String lieu;

    @Column(nullable = true)
    private String adresse;

    @Column(nullable = true)
    private String siteInternet;

    @Column(nullable = true)
    private String gerant;

    /*
     * estListeNoire = true si le responsable blackliste ce fournisseur
     * voir ListeNoireServiceImpl.java
     * quand on blackliste : ce champ passe à true
     * ET une entrée est créée dans la table liste_noire
     */
    @Column(nullable = false)
    private boolean estListeNoire = false;

    @Column(nullable = false)
    private LocalDate dateInscription;

    // =====================
    // CONSTRUCTEURS
    // =====================

    public Fournisseur() {}

    /*
     * constructeur minimal pour l'inscription autonome
     * seul nomSociete est requis
     * email généré automatiquement ou saisi par le fournisseur
     */
    public Fournisseur(String nomSociete, String email, String motDePasse) {
        super(null, null, email, motDePasse, "FOURNISSEUR");
        this.nomSociete = nomSociete;
        this.estListeNoire = false;
        this.dateInscription = LocalDate.now();
    }

    // =====================
    // GETTERS ET SETTERS
    // =====================

    public String getNomSociete() { return nomSociete; }
    public void setNomSociete(String nomSociete) { this.nomSociete = nomSociete; }

    public String getLieu() { return lieu; }
    public void setLieu(String lieu) { this.lieu = lieu; }

    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }

    public String getSiteInternet() { return siteInternet; }
    public void setSiteInternet(String siteInternet) { this.siteInternet = siteInternet; }

    public String getGerant() { return gerant; }
    public void setGerant(String gerant) { this.gerant = gerant; }

    public boolean isEstListeNoire() { return estListeNoire; }
    public void setEstListeNoire(boolean estListeNoire) {
        this.estListeNoire = estListeNoire;
    }

    public LocalDate getDateInscription() { return dateInscription; }
    public void setDateInscription(LocalDate dateInscription) {
        this.dateInscription = dateInscription;
    }
}