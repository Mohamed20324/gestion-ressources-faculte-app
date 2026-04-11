package ma.faculte.gestion_ressources_backend.repositories.interfaces;

import ma.faculte.gestion_ressources_backend.entities.utilisateurs.ChefDepartement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
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
     * utilisé pour vérifier les droits lors
     * de la création d'une réunion
     */
    Optional<ChefDepartement> findByDepartementGereId(Long departementId);

    boolean existsByMatricule(String matricule);
}