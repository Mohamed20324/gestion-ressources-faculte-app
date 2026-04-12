package ma.faculte.gestion_ressources_backend.dto.appel_offre;

import ma.faculte.gestion_ressources_backend.dto.appel_offre.lignes.LigneOffreDTO;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class OffreDTO {

    private Long id;
    private LocalDate dateSoumission;
    private LocalDate dateLivraison;
    private int dureeGarantie;
    private Double prixTotal;
    private String statut;
    private String motifRejet;
    private Long fournisseurId;
    private Long appelOffreId;
    private List<LigneOffreDTO> lignes = new ArrayList<>();

    public OffreDTO() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDateSoumission() {
        return dateSoumission;
    }

    public void setDateSoumission(LocalDate dateSoumission) {
        this.dateSoumission = dateSoumission;
    }

    public LocalDate getDateLivraison() {
        return dateLivraison;
    }

    public void setDateLivraison(LocalDate dateLivraison) {
        this.dateLivraison = dateLivraison;
    }

    public int getDureeGarantie() {
        return dureeGarantie;
    }

    public void setDureeGarantie(int dureeGarantie) {
        this.dureeGarantie = dureeGarantie;
    }

    public Double getPrixTotal() {
        return prixTotal;
    }

    public void setPrixTotal(Double prixTotal) {
        this.prixTotal = prixTotal;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public String getMotifRejet() {
        return motifRejet;
    }

    public void setMotifRejet(String motifRejet) {
        this.motifRejet = motifRejet;
    }

    public Long getFournisseurId() {
        return fournisseurId;
    }

    public void setFournisseurId(Long fournisseurId) {
        this.fournisseurId = fournisseurId;
    }

    public Long getAppelOffreId() {
        return appelOffreId;
    }

    public void setAppelOffreId(Long appelOffreId) {
        this.appelOffreId = appelOffreId;
    }

    public List<LigneOffreDTO> getLignes() {
        return lignes;
    }

    public void setLignes(List<LigneOffreDTO> lignes) {
        this.lignes = lignes;
    }
}
