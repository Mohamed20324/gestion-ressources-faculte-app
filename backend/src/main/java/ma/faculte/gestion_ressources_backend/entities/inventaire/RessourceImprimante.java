package ma.faculte.gestion_ressources_backend.entities.inventaire;

import jakarta.persistence.*;

@Entity
@Table(name = "ressources_imprimante")
@PrimaryKeyJoinColumn(name = "id")
public class RessourceImprimante extends Ressource {

    @Column(nullable = true)
    private Integer vitesseImpression;

    @Column(nullable = true)
    private String resolution;

    public RessourceImprimante() {}

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
}
