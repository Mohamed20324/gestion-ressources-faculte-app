package ma.faculte.gestion_ressources_backend.entities.appel_offre;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import ma.faculte.gestion_ressources_backend.entities.appel_offre.lignes.LigneOffre;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Fournisseur;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/*
 * OFFRE FOURNISSEUR pour un appel d'offres
 * Table : offres
 */

@Entity
@Table(name = "offres")
public class Offre {

    public static final String STATUT_SOUMISE = "SOUMISE";
    public static final String STATUT_ACCEPTEE = "ACCEPTEE";
    public static final String STATUT_REJETEE = "REJETEE";
    public static final String STATUT_ELIMINEE = "ELIMINEE";
    public static final String STATUT_LIVREE = "LIVREE";
    public static final String STATUT_LIVREE_RETARD = "LIVREE_RETARD";
    public static final String STATUT_ANNULEE = "ANNULEE";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate dateSoumission;

    @Column(nullable = true)
    private LocalDate dateLivraison;

    @Column(nullable = false)
    private int dureeGarantie;

    @Column(nullable = true)
    private Double prixTotal;

    @Column(nullable = false)
    private String statut;

    @Column(nullable = true, length = 2000)
    private String motifRejet;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fournisseur_id", nullable = false)
    private Fournisseur fournisseur;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "appel_offre_id", nullable = false)
    private AppelOffre appelOffre;

    @JsonIgnore
    @OneToMany(mappedBy = "offre", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LigneOffre> lignes = new ArrayList<>();

    public Offre() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDateSoumission() {
        return dateSoumission;
    }

    public void setDateSoumission(LocalDate dateSoumission) {
        this.dateSoumission = dateSoumission;
    }

    public LocalDate getDateLivraison() {
        return dateLivraison;
    }

    public void setDateLivraison(LocalDate dateLivraison) {
        this.dateLivraison = dateLivraison;
    }

    public int getDureeGarantie() {
        return dureeGarantie;
    }

    public void setDureeGarantie(int dureeGarantie) {
        this.dureeGarantie = dureeGarantie;
    }

    public Double getPrixTotal() {
        return prixTotal;
    }

    public void setPrixTotal(Double prixTotal) {
        this.prixTotal = prixTotal;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public String getMotifRejet() {
        return motifRejet;
    }

    public void setMotifRejet(String motifRejet) {
        this.motifRejet = motifRejet;
    }

    public Fournisseur getFournisseur() {
        return fournisseur;
    }

    public void setFournisseur(Fournisseur fournisseur) {
        this.fournisseur = fournisseur;
    }

    public AppelOffre getAppelOffre() {
        return appelOffre;
    }

    public void setAppelOffre(AppelOffre appelOffre) {
        this.appelOffre = appelOffre;
    }

    public List<LigneOffre> getLignes() {
        return lignes;
    }

    public void setLignes(List<LigneOffre> lignes) {
        this.lignes = lignes;
    }
}
