package ma.faculte.gestion_ressources_backend.repositories.interfaces;

import ma.faculte.gestion_ressources_backend.entities.maintenance.Constat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IConstatRepository extends JpaRepository<Constat, Long> {

    Optional<Constat> findBySignalement_Id(Long signalementId);
    java.util.List<Constat> findByTechnicien_Id(Long technicienId);
}
