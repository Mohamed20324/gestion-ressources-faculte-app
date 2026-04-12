package ma.faculte.gestion_ressources_backend.dto.appel_offre.lignes;

public class LigneOffreDTO {

    public static final String VARIANTE_STANDARD = "STANDARD";
    public static final String VARIANTE_ORDINATEUR = "ORDINATEUR";
    public static final String VARIANTE_IMPRIMANTE = "IMPRIMANTE";

    private Long typeRessourceId;
    private String marque;
    private Double prixUnitaire;
    private int quantite;
    private String descriptionTechnique;
    private Long besoinId;
    private String variante = VARIANTE_STANDARD;

    private String cpu;
    private String ram;
    private String disqueDur;
    private String ecran;

    private int vitesseImpression;
    private String resolution;

    public LigneOffreDTO() {}

    public Long getTypeRessourceId() {
        return typeRessourceId;
    }

    public void setTypeRessourceId(Long typeRessourceId) {
        this.typeRessourceId = typeRessourceId;
    }

    public String getMarque() {
        return marque;
    }

    public void setMarque(String marque) {
        this.marque = marque;
    }

    public Double getPrixUnitaire() {
        return prixUnitaire;
    }

    public void setPrixUnitaire(Double prixUnitaire) {
        this.prixUnitaire = prixUnitaire;
    }

    public int getQuantite() {
        return quantite;
    }

    public void setQuantite(int quantite) {
        this.quantite = quantite;
    }

    public String getDescriptionTechnique() {
        return descriptionTechnique;
    }

    public void setDescriptionTechnique(String descriptionTechnique) {
        this.descriptionTechnique = descriptionTechnique;
    }

    public Long getBesoinId() {
        return besoinId;
    }

    public void setBesoinId(Long besoinId) {
        this.besoinId = besoinId;
    }

    public String getVariante() {
        return variante;
    }

    public void setVariante(String variante) {
        this.variante = variante;
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
}
