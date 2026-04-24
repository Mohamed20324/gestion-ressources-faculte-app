package ma.faculte.gestion_ressources_backend.entities.maintenance;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import ma.faculte.gestion_ressources_backend.entities.inventaire.Ressource;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Enseignant;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Technicien;

import java.time.LocalDate;

@Entity
@Table(name = "signalements_panne")
public class SignalementPanne {

    public static final String STATUT_SIGNALE = "SIGNALE";
    public static final String STATUT_EN_COURS = "EN_COURS";
    public static final String STATUT_CONSTAT = "CONSTAT";
    public static final String STATUT_FOURNISSEUR = "FOURNISSEUR";
    public static final String STATUT_ECHANGE = "ECHANGE";
    public static final String STATUT_RESOLU = "RESOLU";
    public static final String STATUT_FERME = "FERME";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ressource_id", nullable = false)
    private Ressource ressource;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "enseignant_id", nullable = true)
    private Enseignant enseignant;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technicien_id", nullable = true)
    private Technicien technicien;

    @Column(nullable = false, length = 4000)
    private String description;

    @Column(nullable = false)
    private LocalDate dateSignalement;

    @Column(nullable = false)
    private String statut = STATUT_SIGNALE;

    @Column(nullable = true)
    private LocalDate dateLivraisonEchange;

    @Column(nullable = true)
    private String statutEchange; // DEMANDE, ACCEPTEE, LIVREE

    public SignalementPanne() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Ressource getRessource() {
        return ressource;
    }

    public void setRessource(Ressource ressource) {
        this.ressource = ressource;
    }

    public Enseignant getEnseignant() {
        return enseignant;
    }

    public void setEnseignant(Enseignant enseignant) {
        this.enseignant = enseignant;
    }

    public Technicien getTechnicien() {
        return technicien;
    }

    public void setTechnicien(Technicien technicien) {
        this.technicien = technicien;
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
