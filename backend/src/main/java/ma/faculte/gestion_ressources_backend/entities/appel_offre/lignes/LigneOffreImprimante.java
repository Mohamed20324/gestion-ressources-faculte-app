package ma.faculte.gestion_ressources_backend.entities.appel_offre.lignes;

import jakarta.persistence.*;

/*
 * LIGNE D'OFFRE — imprimante (table fille JOINED)
 * Table : lignes_offre_imprimante
 */

@Entity
@Table(name = "lignes_offre_imprimante")
@PrimaryKeyJoinColumn(name = "id")
public class LigneOffreImprimante extends LigneOffre {

    @Column(nullable = true)
    private int vitesseImpression;

    @Column(nullable = true)
    private String resolution;

    public LigneOffreImprimante() {}

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
