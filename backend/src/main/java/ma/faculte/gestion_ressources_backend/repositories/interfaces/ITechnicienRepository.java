package ma.faculte.gestion_ressources_backend.repositories.interfaces;

import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Technicien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/*
 * REPOSITORY TECHNICIEN
 *
 * LIEN MEMBRE 4 :
 * il utilisera ce repository dans
 * SignalementServiceImpl et ConstatServiceImpl
 * pour assigner un technicien à un signalement
 */

@Repository
public interface ITechnicienRepository
        extends JpaRepository<Technicien, Long> {

    Optional<Technicien> findByMatricule(String matricule);

    boolean existsByMatricule(String matricule);
}