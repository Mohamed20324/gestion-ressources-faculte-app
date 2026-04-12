package ma.faculte.gestion_ressources_backend.entities.departement;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import ma.faculte.gestion_ressources_backend.entities.besoins.BesoinRessource;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.ChefDepartement;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/*
 * RÉUNION DE CONCERTATION
 * Table : reunions
 * Workflow du statut : PLANIFIEE → EN_COURS → VALIDEE
 */

@Entity
@Table(name = "reunions")
public class Reunion {

    public static final String STATUT_PLANIFIEE = "PLANIFIEE";
    public static final String STATUT_EN_COURS = "EN_COURS";
    public static final String STATUT_VALIDEE = "VALIDEE";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private String heure;

    @Column(nullable = false)
    private String statut;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "departement_id", nullable = false)
    private Departement departement;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "chef_id", nullable = false)
    private ChefDepartement chef;

    @JsonIgnore
    @OneToMany(mappedBy = "reunion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BesoinRessource> besoins = new ArrayList<>();

    public Reunion() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getHeure() {
        return heure;
    }

    public void setHeure(String heure) {
        this.heure = heure;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public Departement getDepartement() {
        return departement;
    }

    public void setDepartement(Departement departement) {
        this.departement = departement;
    }

    public ChefDepartement getChef() {
        return chef;
    }

    public void setChef(ChefDepartement chef) {
        this.chef = chef;
    }

    public List<BesoinRessource> getBesoins() {
        return besoins;
    }

    public void setBesoins(List<BesoinRessource> besoins) {
        this.besoins = besoins;
    }
}
