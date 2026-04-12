package ma.faculte.gestion_ressources_backend.entities.besoins;

import jakarta.persistence.*;

/*
 * BESOIN ORDINATEUR — table fille JOINED
 * Table : besoins_ordinateur (clé = id du besoin parent)
 */

@Entity
@Table(name = "besoins_ordinateur")
@PrimaryKeyJoinColumn(name = "id")
public class BesoinOrdinateur extends BesoinRessource {

    @Column(nullable = true)
    private String cpu;

    @Column(nullable = true)
    private String ram;

    @Column(nullable = true)
    private String disqueDur;

    @Column(nullable = true)
    private String ecran;

    public BesoinOrdinateur() {}

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
