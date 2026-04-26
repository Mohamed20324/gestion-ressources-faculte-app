package ma.faculte.gestion_ressources_backend.dto.inventaire;

import java.time.LocalDate;

public class RessourceDTO {

    private Long id;
    private String numeroInventaire;
    private String codeBarres;
    private String marque;
    private Long typeRessourceId;
    private Long fournisseurId;
    private Long offreOrigineId;
    private LocalDate dateReception;
    private String statut;
    private Long departementId;
    private String fournisseurNom;
    private String departementDemandeurNom;
    private String enseignantDemandeurNom;
    private LocalDate dateFinGarantie;

    /** STANDARD, ORDINATEUR, IMPRIMANTE */
    private String categorie;

    private String cpu;
    private String ram;
    private String disqueDur;
    private String ecran;
    private Integer vitesseImpression;
    private String resolution;

    public RessourceDTO() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumeroInventaire() {
        return numeroInventaire;
    }

    public void setNumeroInventaire(String numeroInventaire) {
        this.numeroInventaire = numeroInventaire;
    }

    public String getCodeBarres() {
        return codeBarres;
    }

    public void setCodeBarres(String codeBarres) {
        this.codeBarres = codeBarres;
    }

    public String getMarque() {
        return marque;
    }

    public void setMarque(String marque) {
        this.marque = marque;
    }

    public Long getTypeRessourceId() {
        return typeRessourceId;
    }

    public void setTypeRessourceId(Long typeRessourceId) {
        this.typeRessourceId = typeRessourceId;
    }

    public Long getFournisseurId() {
        return fournisseurId;
    }

    public void setFournisseurId(Long fournisseurId) {
        this.fournisseurId = fournisseurId;
    }

    public Long getOffreOrigineId() {
        return offreOrigineId;
    }

    public void setOffreOrigineId(Long offreOrigineId) {
        this.offreOrigineId = offreOrigineId;
    }

    public LocalDate getDateReception() {
        return dateReception;
    }

    public void setDateReception(LocalDate dateReception) {
        this.dateReception = dateReception;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public String getCategorie() {
        return categorie;
    }

    public void setCategorie(String categorie) {
        this.categorie = categorie;
    }

    public String getCpu() {
        return cpu;
    }

    public void setCpu(String cpu) {
        this.cpu = cpu;
    }

    public String getRam() {
        return ram;
    }

    public void setRam(String ram) {
        this.ram = ram;
    }

    public String getDisqueDur() {
        return disqueDur;
    }

    public void setDisqueDur(String disqueDur) {
        this.disqueDur = disqueDur;
    }

    public String getEcran() {
        return ecran;
    }

    public void setEcran(String ecran) {
        this.ecran = ecran;
    }

    public Integer getVitesseImpression() {
        return vitesseImpression;
    }

    public void setVitesseImpression(Integer vitesseImpression) {
        this.vitesseImpression = vitesseImpression;
    }

    public String getResolution() {
        return resolution;
    }

    public void setResolution(String resolution) {
        this.resolution = resolution;
    }

    public Long getDepartementId() {
        return departementId;
    }

    public void setDepartementId(Long departementId) {
        this.departementId = departementId;
    }

    public String getFournisseurNom() {
        return fournisseurNom;
    }

    public void setFournisseurNom(String fournisseurNom) {
        this.fournisseurNom = fournisseurNom;
    }

    public String getDepartementDemandeurNom() {
        return departementDemandeurNom;
    }

    public void setDepartementDemandeurNom(String departementDemandeurNom) {
        this.departementDemandeurNom = departementDemandeurNom;
    }

    public String getEnseignantDemandeurNom() {
        return enseignantDemandeurNom;
    }

    public void setEnseignantDemandeurNom(String enseignantDemandeurNom) {
        this.enseignantDemandeurNom = enseignantDemandeurNom;
    }

    public LocalDate getDateFinGarantie() {
        return dateFinGarantie;
    }

    public void setDateFinGarantie(LocalDate dateFinGarantie) {
        this.dateFinGarantie = dateFinGarantie;
    }
}
