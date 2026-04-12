package ma.faculte.gestion_ressources_backend.repositories.interfaces;

import ma.faculte.gestion_ressources_backend.entities.inventaire.Affectation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IAffectationRepository extends JpaRepository<Affectation, Long> {

    Optional<Affectation> findByRessource_Id(Long ressourceId);

    List<Affectation> findByDepartement_Id(Long departementId);
}
