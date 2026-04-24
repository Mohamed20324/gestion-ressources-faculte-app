package ma.faculte.gestion_ressources_backend.dto.departement.besoins;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class BesoinRessourceDTO {

    private Long id;

    @NotNull(message = "Le type de ressource est obligatoire")
    private Long typeRessourceId;

    @Min(value = 1, message = "La quantité doit être au moins 1")
    private int quantite;
    private String description;
    private String descriptionTechnique;
    private String statut;
    private boolean estCollectif;
    private Long enseignantId;

    @NotNull(message = "Le département est obligatoire")
    private Long departementId;

    private Long reunionId;

    /**
     * STANDARD | ORDINATEUR | IMPRIMANTE — détermine la sous-entité persistée.
     */
    private String categorie = "STANDARD";

    private String cpu;
    private String ram;
    private String disqueDur;
    private String ecran;
    private int vitesseImpression;
    private String resolution;
    private String marque;
    private Long appelOffreId;

    public BesoinRessourceDTO() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTypeRessourceId() {
        return typeRessourceId;
    }

    public void setTypeRessourceId(Long typeRessourceId) {
        this.typeRessourceId = typeRessourceId;
    }

    public int getQuantite() {
        return quantite;
    }

    public void setQuantite(int quantite) {
        this.quantite = quantite;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDescriptionTechnique() {
        return descriptionTechnique;
    }

    public void setDescriptionTechnique(String descriptionTechnique) {
        this.descriptionTechnique = descriptionTechnique;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public boolean isEstCollectif() {
        return estCollectif;
    }

    public void setEstCollectif(boolean estCollectif) {
        this.estCollectif = estCollectif;
    }

    public Long getEnseignantId() {
        return enseignantId;
    }

    public void setEnseignantId(Long enseignantId) {
        this.enseignantId = enseignantId;
    }

    public Long getDepartementId() {
        return departementId;
    }

    public void setDepartementId(Long departementId) {
        this.departementId = departementId;
    }

    public Long getReunionId() {
        return reunionId;
    }

    public void setReunionId(Long reunionId) {
        this.reunionId = reunionId;
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

    public int getVitesseImpression() {
        return vitesseImpression;
    }

    public void setVitesseImpression(int vitesseImpression) {
        this.vitesseImpression = vitesseImpression;
    }

    public String getResolution() {
        return resolution;
    }

    public void setResolution(String resolution) {
        this.resolution = resolution;
    }

    public String getMarque() {
        return marque;
    }

    public void setMarque(String marque) {
        this.marque = marque;
    }

    public Long getAppelOffreId() {
        return appelOffreId;
    }

    public void setAppelOffreId(Long appelOffreId) {
        this.appelOffreId = appelOffreId;
    }
}
