package ma.faculte.gestion_ressources_backend.entities.referentiel;

import jakarta.persistence.*;

/*
 * TYPE DE RESSOURCE — table de référence dynamique
 * Table créée : types_ressources
 *
 * Permet au Responsable d'ajouter de nouveaux types
 * de ressources depuis l'interface sans modifier le code
 *
 * Types standards créés au démarrage :
 * - code: ORDINATEUR  libelle: Ordinateur  estStandard: true
 * - code: IMPRIMANTE  libelle: Imprimante  estStandard: true
 *
 * Pour tout autre type (projecteur, scanner...)
 * le responsable l'ajoute via :
 * POST /api/types-ressources
 *
 * LIEN AVEC AUTRES MEMBRES :
 * - Membre 4 utilise TypeRessource dans Ressource.java
 *   pour typer chaque ressource de l'inventaire
 * - Membre 3 (toi) utilise TypeRessource dans
 *   BesoinRessource.java et LigneOffre.java
 */

@Entity
@Table(name = "types_ressources")
public class TypeRessource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * code est unique et utilisé comme identifiant métier
     * exemples : ORDINATEUR / IMPRIMANTE / PROJECTEUR
     */
    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String libelle;

    /*
     * estStandard = true uniquement pour ORDINATEUR et IMPRIMANTE
     * ces deux types ont des tables filles dédiées
     * BesoinOrdinateur, BesoinImprimante, LigneOffreOrdinateur...
     * les autres types utilisent descriptionTechnique (champ libre)
     */
    @Column(nullable = false)
    private boolean estStandard = false;

    @Column(nullable = false)
    private boolean actif = true;

    // =====================
    // CONSTRUCTEURS
    // =====================

    public TypeRessource() {}

    public TypeRessource(String code, String libelle, boolean estStandard) {
        this.code = code;
        this.libelle = libelle;
        this.estStandard = estStandard;
        this.actif = true;
    }

    // =====================
    // GETTERS ET SETTERS
    // =====================

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getLibelle() { return libelle; }
    public void setLibelle(String libelle) { this.libelle = libelle; }

    public boolean isEstStandard() { return estStandard; }
    public void setEstStandard(boolean estStandard) { this.estStandard = estStandard; }

    public boolean isActif() { return actif; }
    public void setActif(boolean actif) { this.actif = actif; }
}