package ma.faculte.gestion_ressources_backend.dto.maintenance;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class ConstatDTO {

    private Long id;

    @NotNull(message = "Le signalement est obligatoire")
    private Long signalementId;

    @NotNull(message = "Le technicien est obligatoire")
    private Long technicienId;

    @NotBlank(message = "L'explication est obligatoire")
    private String explication;

    @NotNull(message = "La date d'apparition est obligatoire")
    private LocalDate dateApparition;

    @NotBlank(message = "La fréquence est obligatoire")
    private String frequence;

    @NotBlank(message = "L'ordre (logiciel/matériel) est obligatoire")
    private String ordre;
    private LocalDate dateConstat;
    private boolean envoyeAuResponsable;

    public ConstatDTO() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSignalementId() {
        return signalementId;
    }

    public void setSignalementId(Long signalementId) {
        this.signalementId = signalementId;
    }

    public Long getTechnicienId() {
        return technicienId;
    }

    public void setTechnicienId(Long technicienId) {
        this.technicienId = technicienId;
    }

    public String getExplication() {
        return explication;
    }

    public void setExplication(String explication) {
        this.explication = explication;
    }

    public LocalDate getDateApparition() {
        return dateApparition;
    }

    public void setDateApparition(LocalDate dateApparition) {
        this.dateApparition = dateApparition;
    }

    public String getFrequence() {
        return frequence;
    }

    public void setFrequence(String frequence) {
        this.frequence = frequence;
    }

    public String getOrdre() {
        return ordre;
    }

    public void setOrdre(String ordre) {
        this.ordre = ordre;
    }

    public LocalDate getDateConstat() {
        return dateConstat;
    }

    public void setDateConstat(LocalDate dateConstat) {
        this.dateConstat = dateConstat;
    }

    public boolean isEnvoyeAuResponsable() {
        return envoyeAuResponsable;
    }

    public void setEnvoyeAuResponsable(boolean envoyeAuResponsable) {
        this.envoyeAuResponsable = envoyeAuResponsable;
    }
}
