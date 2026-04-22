package ma.faculte.gestion_ressources_backend.dto.appel_offre;

import ma.faculte.gestion_ressources_backend.dto.departement.besoins.BesoinRessourceDTO;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class AppelOffreDTO {

    private Long id;
    private String reference;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String statut;
    private Long responsableId;
    private List<Long> besoinIds = new ArrayList<>();
    private List<BesoinRessourceDTO> besoins = new ArrayList<>();

    public AppelOffreDTO() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public LocalDate getDateDebut() {
        return dateDebut;
    }

    public void setDateDebut(LocalDate dateDebut) {
        this.dateDebut = dateDebut;
    }

    public LocalDate getDateFin() {
        return dateFin;
    }

    public void setDateFin(LocalDate dateFin) {
        this.dateFin = dateFin;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public Long getResponsableId() {
        return responsableId;
    }

    public void setResponsableId(Long responsableId) {
        this.responsableId = responsableId;
    }

    public List<Long> getBesoinIds() {
        return besoinIds;
    }

    public void setBesoinIds(List<Long> besoinIds) {
        this.besoinIds = besoinIds;
    }

    public List<BesoinRessourceDTO> getBesoins() {
        return besoins;
    }

    public void setBesoins(List<BesoinRessourceDTO> besoins) {
        this.besoins = besoins;
    }
}
