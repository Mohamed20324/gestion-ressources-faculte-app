package ma.faculte.gestion_ressources_backend.entities.besoins;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import ma.faculte.gestion_ressources_backend.entities.appel_offre.AppelOffre;
import ma.faculte.gestion_ressources_backend.entities.departement.Departement;
import ma.faculte.gestion_ressources_backend.entities.departement.Reunion;
import ma.faculte.gestion_ressources_backend.entities.referentiel.TypeRessource;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Enseignant;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/*
 * BESOIN DE RESSOURCE — table mère (JOINED)
 * Tables : besoins_ressource + tables filles (ordinateur, imprimante)
 */

@Entity
@Table(name = "besoins_ressource")
@Inheritance(strategy = InheritanceType.JOINED)
public class BesoinRessource {

    public static final String STATUT_EN_ATTENTE = "EN_ATTENTE";
    public static final String STATUT_VALIDE = "VALIDE";
    public static final String STATUT_ENVOYE = "ENVOYE";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "type_ressource_id", nullable = false)
    private TypeRessource typeRessource;

    @Column(nullable = false)
    private int quantite;

    @Column(nullable = true, length = 2000)
    private String description;

    /*
     * Détails libres si le type n'est pas standard (projecteur, etc.)
     */
    @Column(nullable = true, length = 2000)
    private String descriptionTechnique;

    @Column(nullable = false)
    private String statut;

    @Column(nullable = false)
    private boolean estCollectif = false;

    @Column(nullable = false)
    private LocalDate dateCreation;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enseignant_id", nullable = true)
    private Enseignant enseignant;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "departement_id", nullable = false)
    private Departement departement;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reunion_id", nullable = false)
    private Reunion reunion;

    @JsonIgnore
    @ManyToMany(mappedBy = "besoins")
    private List<AppelOffre> appelsOffre = new ArrayList<>();

    public BesoinRessource() {}

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

    public TypeRessource getTypeRessource() {
        return typeRessource;
    }

    public void setTypeRessource(TypeRessource typeRessource) {
        this.typeRessource = typeRessource;
    }

    public int getQuantite() {
        return quantite;
    }

    public void setQuantite(int quantite) {
        this.quantite = quantite;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDescriptionTechnique() {
        return descriptionTechnique;
    }

    public void setDescriptionTechnique(String descriptionTechnique) {
        this.descriptionTechnique = descriptionTechnique;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public boolean isEstCollectif() {
        return estCollectif;
    }

    public void setEstCollectif(boolean estCollectif) {
        this.estCollectif = estCollectif;
    }

    public LocalDate getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDate dateCreation) {
        this.dateCreation = dateCreation;
    }

    public Enseignant getEnseignant() {
        return enseignant;
    }

    public void setEnseignant(Enseignant enseignant) {
        this.enseignant = enseignant;
    }

    public Departement getDepartement() {
        return departement;
    }

    public void setDepartement(Departement departement) {
        this.departement = departement;
    }

    public Reunion getReunion() {
        return reunion;
    }

    public void setReunion(Reunion reunion) {
        this.reunion = reunion;
    }

    public List<AppelOffre> getAppelsOffre() {
        return appelsOffre;
    }

    public void setAppelsOffre(List<AppelOffre> appelsOffre) {
        this.appelsOffre = appelsOffre;
    }
}
