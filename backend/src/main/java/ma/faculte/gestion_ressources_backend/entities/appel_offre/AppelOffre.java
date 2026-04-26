package ma.faculte.gestion_ressources_backend.entities.appel_offre;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import ma.faculte.gestion_ressources_backend.entities.besoins.BesoinRessource;
import ma.faculte.gestion_ressources_backend.entities.departement.Departement;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Responsable;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/*
 * APPEL D'OFFRES
 * Table : appels_offre
 */

@Entity
@Table(name = "appels_offre")
public class AppelOffre {

    public static final String STATUT_BROUILLON = "BROUILLON";
    public static final String STATUT_OUVERT = "OUVERT";
    public static final String STATUT_CLOTURE = "CLOTURE";
    public static final String STATUT_TRAITE = "TRAITE";
    public static final String STATUT_ANNULE = "ANNULE";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String reference;

    @Column(nullable = false)
    private LocalDate dateDebut;

    @Column(nullable = false)
    private LocalDate dateFin;

    @Column(nullable = false)
    private String statut;

    @Column(nullable = false)
    private LocalDate dateCreation;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departement_id", nullable = true)
    private Departement departement;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "responsable_id", nullable = false)
    private Responsable responsable;

    @JsonIgnore
    @ManyToMany
    @JoinTable(
            name = "appel_offre_besoins",
            joinColumns = @JoinColumn(name = "appel_offre_id"),
            inverseJoinColumns = @JoinColumn(name = "besoin_id")
    )
    private List<BesoinRessource> besoins = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "appelOffre", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Offre> offres = new ArrayList<>();

    public AppelOffre() {}

    @PrePersist
    protected void onCreate() {
        if (dateCreation == null) {
            dateCreation = LocalDate.now();
        }
    }

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

    public LocalDate getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDate dateCreation) {
        this.dateCreation = dateCreation;
    }

    public Responsable getResponsable() {
        return responsable;
    }

    public void setResponsable(Responsable responsable) {
        this.responsable = responsable;
    }

    public Departement getDepartement() {
        return departement;
    }

    public void setDepartement(Departement departement) {
        this.departement = departement;
    }

    public List<BesoinRessource> getBesoins() {
        return besoins;
    }

    public void setBesoins(List<BesoinRessource> besoins) {
        this.besoins = besoins;
    }

    public List<Offre> getOffres() {
        return offres;
    }

    public void setOffres(List<Offre> offres) {
        this.offres = offres;
    }
}
