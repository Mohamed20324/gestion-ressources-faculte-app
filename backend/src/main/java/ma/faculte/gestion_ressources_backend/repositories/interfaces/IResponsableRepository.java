package ma.faculte.gestion_ressources_backend.repositories.interfaces;

import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Responsable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/*
 * REPOSITORY RESPONSABLE
 *
 * UTILISÉ PAR : UtilisateurServiceImpl
 *
 * LIEN MEMBRE 4 :
 * il utilisera ce repository dans
 * AffectationServiceImpl et DemandeInterventionServiceImpl
 */

@Repository
public interface IResponsableRepository
        extends JpaRepository<Responsable, Long> {

    Optional<Responsable> findByMatricule(String matricule);

    boolean existsByMatricule(String matricule);
}