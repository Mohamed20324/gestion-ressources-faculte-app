package ma.faculte.gestion_ressources_backend.entities.maintenance;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Technicien;

import java.time.LocalDate;

@Entity
@Table(name = "constats")
public class Constat {

    public static final String FREQ_RARE = "RARE";
    public static final String FREQ_FREQUENTE = "FREQUENTE";
    public static final String FREQ_PERMANENTE = "PERMANENTE";

    public static final String ORDRE_LOGICIEL = "LOGICIEL";
    public static final String ORDRE_MATERIEL = "MATERIEL";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "signalement_id", nullable = false, unique = true)
    private SignalementPanne signalement;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "technicien_id", nullable = true)
    private Technicien technicien;

    @Column(nullable = false, length = 4000)
    private String explication;

    @Column(nullable = false)
    private LocalDate dateApparition;

    @Column(nullable = false)
    private String frequence;

    @Column(nullable = false)
    private String ordre;

    @Column(nullable = false)
    private LocalDate dateConstat;

    @Column(nullable = false)
    private boolean envoyeAuResponsable = false;

    public Constat() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SignalementPanne getSignalement() {
        return signalement;
    }

    public void setSignalement(SignalementPanne signalement) {
        this.signalement = signalement;
    }

    public Technicien getTechnicien() {
        return technicien;
    }

    public void setTechnicien(Technicien technicien) {
        this.technicien = technicien;
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
