package ma.faculte.gestion_ressources_backend.entities.inventaire;

import jakarta.persistence.*;

@Entity
@Table(name = "ressources_ordinateur")
@PrimaryKeyJoinColumn(name = "id")
public class RessourceOrdinateur extends Ressource {

    @Column(nullable = true)
    private String cpu;

    @Column(nullable = true)
    private String ram;

    @Column(nullable = true)
    private String disqueDur;

    @Column(nullable = true)
    private String ecran;

    public RessourceOrdinateur() {}

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
