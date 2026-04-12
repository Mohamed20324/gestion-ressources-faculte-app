package ma.faculte.gestion_ressources_backend.dto.departement.besoins;

public class BesoinOrdinateurDTO extends BesoinRessourceDTO {

    private String cpu;
    private String ram;
    private String disqueDur;
    private String ecran;

    public BesoinOrdinateurDTO() {}

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
