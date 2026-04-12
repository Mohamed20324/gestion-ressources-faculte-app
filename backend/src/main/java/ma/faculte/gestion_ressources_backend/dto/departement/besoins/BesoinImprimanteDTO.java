package ma.faculte.gestion_ressources_backend.dto.departement.besoins;

public class BesoinImprimanteDTO extends BesoinRessourceDTO {

    private int vitesseImpression;
    private String resolution;

    public BesoinImprimanteDTO() {}

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
