package ma.faculte.gestion_ressources_backend.repositories.interfaces;

import ma.faculte.gestion_ressources_backend.entities.departement.Departement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/*
 * REPOSITORY DÉPARTEMENT
 *
 * UTILISÉ PAR :
 * - DepartementServiceImpl
 * - BesoinServiceImpl
 * - ReunionServiceImpl
 *
 * LIEN MEMBRE 4 :
 * il utilisera ce repository dans
 * AffectationServiceImpl pour les affectations
 * au niveau du département entier
 */

@Repository
public interface IDepartementRepository
        extends JpaRepository<Departement, Long> {

    Optional<Departement> findByNom(String nom);

    boolean existsByNom(String nom);
}