package ma.faculte.gestion_ressources_backend.entities.besoins;

import jakarta.persistence.*;

/*
 * BESOIN IMPRIMANTE — table fille JOINED
 * Table : besoins_imprimante (clé = id du besoin parent)
 */

@Entity
@Table(name = "besoins_imprimante")
@PrimaryKeyJoinColumn(name = "id")
public class BesoinImprimante extends BesoinRessource {

    @Column(nullable = true)
    private int vitesseImpression;

    @Column(nullable = true)
    private String resolution;

    @Column(nullable = true)
    private String marque;

    public BesoinImprimante() {}

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
}
