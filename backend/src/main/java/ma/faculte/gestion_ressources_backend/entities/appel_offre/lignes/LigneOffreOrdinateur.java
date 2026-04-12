package ma.faculte.gestion_ressources_backend.entities.appel_offre.lignes;

import jakarta.persistence.*;

/*
 * LIGNE D'OFFRE — ordinateur (table fille JOINED)
 * Table : lignes_offre_ordinateur
 */

@Entity
@Table(name = "lignes_offre_ordinateur")
@PrimaryKeyJoinColumn(name = "id")
public class LigneOffreOrdinateur extends LigneOffre {

    @Column(nullable = true)
    private String cpu;

    @Column(nullable = true)
    private String ram;

    @Column(nullable = true)
    private String disqueDur;

    @Column(nullable = true)
    private String ecran;

    public LigneOffreOrdinateur() {}

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
}
