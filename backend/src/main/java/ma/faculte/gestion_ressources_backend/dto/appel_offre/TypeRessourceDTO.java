package ma.faculte.gestion_ressources_backend.dto.appel_offre;

public class TypeRessourceDTO {

    private Long id;
    private String code;
    private String libelle;
    private boolean estStandard;
    private boolean actif;

    public TypeRessourceDTO() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getLibelle() {
        return libelle;
    }

    public void setLibelle(String libelle) {
        this.libelle = libelle;
    }

    public boolean isEstStandard() {
        return estStandard;
    }

    public void setEstStandard(boolean estStandard) {
        this.estStandard = estStandard;
    }

    public boolean isActif() {
        return actif;
    }

    public void setActif(boolean actif) {
        this.actif = actif;
    }
}
