package ma.faculte.gestion_ressources_backend.dto.maintenance;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class SignalementPanneDTO {

    private Long id;

    @NotNull(message = "La ressource est obligatoire")
    private Long ressourceId;

    @NotNull(message = "L'enseignant est obligatoire")
    private Long enseignantId;
    private Long technicienId;

    @NotBlank(message = "La description est obligatoire")
    private String description;
    private LocalDate dateSignalement;
    private String statut;
    private LocalDate dateLivraisonEchange;
    private String statutEchange;

    public SignalementPanneDTO() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRessourceId() {
        return ressourceId;
    }

    public void setRessourceId(Long ressourceId) {
        this.ressourceId = ressourceId;
    }

    public Long getEnseignantId() {
        return enseignantId;
    }

    public void setEnseignantId(Long enseignantId) {
        this.enseignantId = enseignantId;
    }

    public Long getTechnicienId() {
        return technicienId;
    }

    public void setTechnicienId(Long technicienId) {
        this.technicienId = technicienId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getDateSignalement() {
        return dateSignalement;
    }

    public void setDateSignalement(LocalDate dateSignalement) {
        this.dateSignalement = dateSignalement;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public LocalDate getDateLivraisonEchange() {
        return dateLivraisonEchange;
    }

    public void setDateLivraisonEchange(LocalDate dateLivraisonEchange) {
        this.dateLivraisonEchange = dateLivraisonEchange;
    }

    public String getStatutEchange() {
        return statutEchange;
    }

    public void setStatutEchange(String statutEchange) {
        this.statutEchange = statutEchange;
    }
}
