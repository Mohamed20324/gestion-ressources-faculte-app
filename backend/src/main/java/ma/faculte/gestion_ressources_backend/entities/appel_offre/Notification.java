package ma.faculte.gestion_ressources_backend.entities.appel_offre;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Responsable;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Utilisateur;

import java.time.LocalDate;

/*
 * NOTIFICATION utilisateur
 * Table : notifications
 */

@Entity
@Table(name = "notifications")
public class Notification {

    public static final String TYPE_ACCEPTATION = "ACCEPTATION";
    public static final String TYPE_REJET = "REJET";
    public static final String TYPE_ELIMINATION = "ELIMINATION";
    public static final String TYPE_INFO = "INFO";
    public static final String TYPE_AVERTISSEMENT = "AVERTISSEMENT";
    public static final String TYPE_AFFECTATION = "AFFECTATION";
    public static final String TYPE_REPONSE_FOURNISSEUR = "REPONSE_FOURNISSEUR";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 4000)
    private String message;

    @Column(nullable = false)
    private LocalDate dateEnvoi;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private boolean lu = false;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "destinataire_id", nullable = false)
    private Utilisateur destinataire;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "expediteur_id", nullable = false)
    private Utilisateur expediteur;

    public Notification() {}

    @PrePersist
    protected void onCreate() {
        if (dateEnvoi == null) {
            dateEnvoi = LocalDate.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDate getDateEnvoi() {
        return dateEnvoi;
    }

    public void setDateEnvoi(LocalDate dateEnvoi) {
        this.dateEnvoi = dateEnvoi;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public boolean isLu() {
        return lu;
    }

    public void setLu(boolean lu) {
        this.lu = lu;
    }

    public Utilisateur getDestinataire() {
        return destinataire;
    }

    public void setDestinataire(Utilisateur destinataire) {
        this.destinataire = destinataire;
    }

    public Utilisateur getExpediteur() {
        return expediteur;
    }

    public void setExpediteur(Utilisateur expediteur) {
        this.expediteur = expediteur;
    }
}
