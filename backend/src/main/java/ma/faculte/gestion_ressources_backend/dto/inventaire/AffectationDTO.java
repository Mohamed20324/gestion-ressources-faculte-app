package ma.faculte.gestion_ressources_backend.dto.inventaire;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class AffectationDTO {

    private Long id;

    @NotNull(message = "La ressource est obligatoire")
    private Long ressourceId;

    @NotNull(message = "Le département est obligatoire")
    private Long departementId;
    private Long enseignantId;
    private boolean affectationCollective;
    private LocalDate dateAffectation;
    private Long expediteurId;
    
    // Resource details for display
    private String ressourceMarque;
    private String ressourceCategorie;
    private String ressourceNumeroInventaire;

    public AffectationDTO() {}

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

    public Long getDepartementId() {
        return departementId;
    }

    public void setDepartementId(Long departementId) {
        this.departementId = departementId;
    }

    public Long getEnseignantId() {
        return enseignantId;
    }

    public void setEnseignantId(Long enseignantId) {
        this.enseignantId = enseignantId;
    }

    public boolean isAffectationCollective() {
        return affectationCollective;
    }

    public void setAffectationCollective(boolean affectationCollective) {
        this.affectationCollective = affectationCollective;
    }

    public LocalDate getDateAffectation() {
        return dateAffectation;
    }

    public void setDateAffectation(LocalDate dateAffectation) {
        this.dateAffectation = dateAffectation;
    }

    public Long getExpediteurId() {
        return expediteurId;
    }

    public void setExpediteurId(Long expediteurId) {
        this.expediteurId = expediteurId;
    }

    public String getRessourceMarque() {
        return ressourceMarque;
    }

    public void setRessourceMarque(String ressourceMarque) {
        this.ressourceMarque = ressourceMarque;
    }

    public String getRessourceCategorie() {
        return ressourceCategorie;
    }

    public void setRessourceCategorie(String ressourceCategorie) {
        this.ressourceCategorie = ressourceCategorie;
    }

    public String getRessourceNumeroInventaire() {
        return ressourceNumeroInventaire;
    }

    public void setRessourceNumeroInventaire(String ressourceNumeroInventaire) {
        this.ressourceNumeroInventaire = ressourceNumeroInventaire;
    }
}
