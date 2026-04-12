package ma.faculte.gestion_ressources_backend.entities.appel_offre;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Fournisseur;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Responsable;

import java.time.LocalDate;

/*
 * LISTE NOIRE — fournisseur exclu
 * Table : liste_noire
 */

@Entity
@Table(name = "liste_noire")
public class ListeNoire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 2000)
    private String motif;

    @Column(nullable = false)
    private LocalDate dateAjout;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fournisseur_id", nullable = false, unique = true)
    private Fournisseur fournisseur;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "responsable_id", nullable = false)
    private Responsable responsable;

    public ListeNoire() {}

    @PrePersist
    protected void onCreate() {
        if (dateAjout == null) {
            dateAjout = LocalDate.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMotif() {
        return motif;
    }

    public void setMotif(String motif) {
        this.motif = motif;
    }

    public LocalDate getDateAjout() {
        return dateAjout;
    }

    public void setDateAjout(LocalDate dateAjout) {
        this.dateAjout = dateAjout;
    }

    public Fournisseur getFournisseur() {
        return fournisseur;
    }

    public void setFournisseur(Fournisseur fournisseur) {
        this.fournisseur = fournisseur;
    }

    public Responsable getResponsable() {
        return responsable;
    }

    public void setResponsable(Responsable responsable) {
        this.responsable = responsable;
    }
}
