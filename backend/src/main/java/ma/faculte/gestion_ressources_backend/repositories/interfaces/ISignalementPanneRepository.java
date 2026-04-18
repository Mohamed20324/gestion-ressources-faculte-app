package ma.faculte.gestion_ressources_backend.repositories.interfaces;

import ma.faculte.gestion_ressources_backend.entities.maintenance.SignalementPanne;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ISignalementPanneRepository extends JpaRepository<SignalementPanne, Long> {

    List<SignalementPanne> findByRessource_Id(Long ressourceId);

    List<SignalementPanne> findByTechnicien_Id(Long technicienId);

    List<SignalementPanne> findByStatut(String statut);
    List<SignalementPanne> findByEnseignant_Id(Long enseignantId);
}
