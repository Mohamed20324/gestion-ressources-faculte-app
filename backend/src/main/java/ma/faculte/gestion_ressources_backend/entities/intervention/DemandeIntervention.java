package ma.faculte.gestion_ressources_backend.entities.intervention;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import ma.faculte.gestion_ressources_backend.entities.inventaire.Ressource;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Fournisseur;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Responsable;

import java.time.LocalDate;

@Entity
@Table(name = "demandes_intervention")
public class DemandeIntervention {

    public static final String STATUT_ENVOYEE = "ENVOYEE";
    public static final String STATUT_ACCEPTEE = "ACCEPTEE";
    public static final String STATUT_REFUSEE = "REFUSEE";
    public static final String STATUT_TERMINEE = "TERMINEE";
    public static final String STATUT_ANNULEE = "ANNULEE";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "responsable_id", nullable = false)
    private Responsable responsable;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fournisseur_id", nullable = false)
    private Fournisseur fournisseur;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ressource_id", nullable = true)
    private Ressource ressource;

    @Column(nullable = false, length = 500)
    private String objet;

    @Column(nullable = false, length = 4000)
    private String description;

    @Column(nullable = false)
    private LocalDate dateDemande;

    @Column(nullable = false)
    private String statut = STATUT_ENVOYEE;

    public DemandeIntervention() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Responsable getResponsable() {
        return responsable;
    }

    public void setResponsable(Responsable responsable) {
        this.responsable = responsable;
    }

    public Fournisseur getFournisseur() {
        return fournisseur;
    }

    public void setFournisseur(Fournisseur fournisseur) {
        this.fournisseur = fournisseur;
    }

    public Ressource getRessource() {
        return ressource;
    }

    public void setRessource(Ressource ressource) {
        this.ressource = ressource;
    }

    public String getObjet() {
        return objet;
    }

    public void setObjet(String objet) {
        this.objet = objet;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getDateDemande() {
        return dateDemande;
    }

    public void setDateDemande(LocalDate dateDemande) {
        this.dateDemande = dateDemande;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }
}
