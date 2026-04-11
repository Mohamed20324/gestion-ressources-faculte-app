package ma.faculte.gestion_ressources_backend.repositories.interfaces;

import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Enseignant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/*
 * REPOSITORY ENSEIGNANT
 *
 * UTILISÉ PAR : UtilisateurServiceImpl, BesoinServiceImpl
 *
 * LIEN MEMBRE 4 :
 * il utilisera ce repository pour récupérer
 * les enseignants dans AffectationServiceImpl
 */

@Repository
public interface IEnseignantRepository
        extends JpaRepository<Enseignant, Long> {

    /*
     * récupérer tous les enseignants d'un département
     * utilisé par le chef pour voir son équipe
     */
    List<Enseignant> findByDepartementId(Long departementId);

    /*
     * recherche par matricule unique
     */
    Optional<Enseignant> findByMatricule(String matricule);

    /*
     * vérifier si matricule déjà utilisé
     */
    boolean existsByMatricule(String matricule);
}