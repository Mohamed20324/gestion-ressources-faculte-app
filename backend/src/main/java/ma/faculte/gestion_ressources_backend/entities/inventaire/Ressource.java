package ma.faculte.gestion_ressources_backend.entities.inventaire;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import ma.faculte.gestion_ressources_backend.entities.appel_offre.Offre;
import ma.faculte.gestion_ressources_backend.entities.referentiel.TypeRessource;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Fournisseur;

import java.time.LocalDate;

@Entity
@Table(name = "ressources")
@Inheritance(strategy = InheritanceType.JOINED)
public class Ressource {

    public static final String STATUT_DISPONIBLE = "DISPONIBLE";
    public static final String STATUT_AFFECTEE = "AFFECTEE";
    public static final String STATUT_MAINTENANCE = "MAINTENANCE";
    public static final String STATUT_REFORME = "REFORME";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String numeroInventaire;

    @Column(nullable = true)
    private String codeBarres;

    @Column(nullable = true)
    private String marque;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "type_ressource_id", nullable = false)
    private TypeRessource typeRessource;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fournisseur_id", nullable = true)
    private Fournisseur fournisseur;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offre_id", nullable = true)
    private Offre offreOrigine;

    @Column(nullable = false)
    private LocalDate dateReception;

    @Column(nullable = false)
    private String statut = STATUT_DISPONIBLE;

    public Ressource() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumeroInventaire() {
        return numeroInventaire;
    }

    public void setNumeroInventaire(String numeroInventaire) {
        this.numeroInventaire = numeroInventaire;
    }

    public String getCodeBarres() {
        return codeBarres;
    }

    public void setCodeBarres(String codeBarres) {
        this.codeBarres = codeBarres;
    }

    public String getMarque() {
        return marque;
    }

    public void setMarque(String marque) {
        this.marque = marque;
    }

    public TypeRessource getTypeRessource() {
        return typeRessource;
    }

    public void setTypeRessource(TypeRessource typeRessource) {
        this.typeRessource = typeRessource;
    }

    public Fournisseur getFournisseur() {
        return fournisseur;
    }

    public void setFournisseur(Fournisseur fournisseur) {
        this.fournisseur = fournisseur;
    }

    public Offre getOffreOrigine() {
        return offreOrigine;
    }

    public void setOffreOrigine(Offre offreOrigine) {
        this.offreOrigine = offreOrigine;
    }

    public LocalDate getDateReception() {
        return dateReception;
    }

    public void setDateReception(LocalDate dateReception) {
        this.dateReception = dateReception;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }
}
