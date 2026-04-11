package ma.faculte.gestion_ressources_backend.dto.utilisateurs;

import java.time.LocalDate;

/*
 * DTO FOURNISSEUR
 * Utilisé pour les réponses et la mise à jour
 * après première livraison
 *
 * UTILISÉ PAR :
 * - UtilisateurController
 *   PUT /api/utilisateurs/fournisseur/{id}/completer
 */

public class FournisseurDTO {

    private Long id;
    private String nomSociete;
    private String email;
    private String lieu;
    private String adresse;
    private String siteInternet;
    private String gerant;
    private boolean estListeNoire;
    private LocalDate dateInscription;

    public FournisseurDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNomSociete() { return nomSociete; }
    public void setNomSociete(String nomSociete) { this.nomSociete = nomSociete; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

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