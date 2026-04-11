package ma.faculte.gestion_ressources_backend.dto.departement;

/*
 * DTO DÉPARTEMENT
 * Utilisé pour créer et modifier un département
 *
 * UTILISÉ PAR : DepartementController
 */

public class DepartementDTO {

    private Long id;
    private String nom;
    private Double budget;

    /*
     * on retourne juste le nom du chef
     * pas l'objet complet pour éviter la boucle infinie
     */
    private String nomChef;
    private Long chefId;

    public DepartementDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public Double getBudget() { return budget; }
    public void setBudget(Double budget) { this.budget = budget; }

    public String getNomChef() { return nomChef; }
    public void setNomChef(String nomChef) { this.nomChef = nomChef; }

    public Long getChefId() { return chefId; }
    public void setChefId(Long chefId) { this.chefId = chefId; }
}