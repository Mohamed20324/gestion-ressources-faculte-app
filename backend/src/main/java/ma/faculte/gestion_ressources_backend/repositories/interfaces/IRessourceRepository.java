package ma.faculte.gestion_ressources_backend.repositories.interfaces;

import ma.faculte.gestion_ressources_backend.entities.inventaire.Ressource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IRessourceRepository extends JpaRepository<Ressource, Long> {

    Optional<Ressource> findByNumeroInventaire(String numeroInventaire);

    List<Ressource> findByStatut(String statut);

    List<Ressource> findByTypeRessource_Id(Long typeRessourceId);

    List<Ressource> findByDepartement_Id(Long departementId);
    List<Ressource> findByOffreOrigine_Id(Long offreId);
    void deleteByOffreOrigine_Id(Long offreId);
}
