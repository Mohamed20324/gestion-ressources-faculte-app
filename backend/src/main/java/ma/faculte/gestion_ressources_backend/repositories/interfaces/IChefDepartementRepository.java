package ma.faculte.gestion_ressources_backend.repositories.interfaces;

import ma.faculte.gestion_ressources_backend.entities.utilisateurs.ChefDepartement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/*
 * REPOSITORY CHEF DÉPARTEMENT
 *
 * UTILISÉ PAR : UtilisateurServiceImpl, ReunionServiceImpl
 */

@Repository
public interface IChefDepartementRepository
        extends JpaRepository<ChefDepartement, Long> {

    /*
     * trouver le chef d'un département donné
     */
    Optional<ChefDepartement> findByDepartementGereId(Long departementId);

    boolean existsByMatricule(String matricule);

    /*
     * Charger tous les chefs avec leur département géré (JOIN FETCH)
     * Évite le problème de lazy loading hors transaction
     */
    @Query("SELECT c FROM ChefDepartement c LEFT JOIN FETCH c.departementGere")
    List<ChefDepartement> findAllWithDepartement();

    /*
     * Charger un chef par ID avec son département géré
     */
    @Query("SELECT c FROM ChefDepartement c LEFT JOIN FETCH c.departementGere WHERE c.id = :id")
    Optional<ChefDepartement> findByIdWithDepartement(Long id);
}