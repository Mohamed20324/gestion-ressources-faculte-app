package ma.faculte.gestion_ressources_backend.repositories.interfaces;

import ma.faculte.gestion_ressources_backend.entities.intervention.DemandeIntervention;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IDemandeInterventionRepository extends JpaRepository<DemandeIntervention, Long> {

    List<DemandeIntervention> findByFournisseur_IdOrderByDateDemandeDesc(Long fournisseurId);

    List<DemandeIntervention> findByResponsable_IdOrderByDateDemandeDesc(Long responsableId);
}
