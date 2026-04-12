package ma.faculte.gestion_ressources_backend.entities.appel_offre.lignes;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import ma.faculte.gestion_ressources_backend.entities.appel_offre.Offre;
import ma.faculte.gestion_ressources_backend.entities.besoins.BesoinRessource;
import ma.faculte.gestion_ressources_backend.entities.referentiel.TypeRessource;

/*
 * LIGNE D'OFFRE — table mère (JOINED)
 * Table : lignes_offre
 */

@Entity
@Table(name = "lignes_offre")
@Inheritance(strategy = InheritanceType.JOINED)
public class LigneOffre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "type_ressource_id", nullable = false)
    private TypeRessource typeRessource;

    @Column(nullable = true)
    private String marque;

    @Column(nullable = false)
    private Double prixUnitaire;

    @Column(nullable = false)
    private int quantite;

    /*
     * Calculé automatiquement : prixUnitaire × quantite
     */
    @Column(nullable = false)
    private Double sousTotal;

    @Column(nullable = true, length = 2000)
    private String descriptionTechnique;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "offre_id", nullable = false)
    private Offre offre;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "besoin_id", nullable = false)
    private BesoinRessource besoin;

    public LigneOffre() {}

    @PrePersist
    @PreUpdate
    protected void calculerSousTotal() {
        double pu = prixUnitaire != null ? prixUnitaire : 0.0;
        sousTotal = pu * quantite;
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

    public String getMarque() {
        return marque;
    }

    public void setMarque(String marque) {
        this.marque = marque;
    }

    public Double getPrixUnitaire() {
        return prixUnitaire;
    }

    public void setPrixUnitaire(Double prixUnitaire) {
        this.prixUnitaire = prixUnitaire;
    }

    public int getQuantite() {
        return quantite;
    }

    public void setQuantite(int quantite) {
        this.quantite = quantite;
    }

    public Double getSousTotal() {
        return sousTotal;
    }

    public void setSousTotal(Double sousTotal) {
        this.sousTotal = sousTotal;
    }

    public String getDescriptionTechnique() {
        return descriptionTechnique;
    }

    public void setDescriptionTechnique(String descriptionTechnique) {
        this.descriptionTechnique = descriptionTechnique;
    }

    public Offre getOffre() {
        return offre;
    }

    public void setOffre(Offre offre) {
        this.offre = offre;
    }

    public BesoinRessource getBesoin() {
        return besoin;
    }

    public void setBesoin(BesoinRessource besoin) {
        this.besoin = besoin;
    }
}
