package ma.faculte.gestion_ressources_backend.repositories.interfaces;

import ma.faculte.gestion_ressources_backend.entities.besoins.BesoinRessource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IBesoinRessourceRepository extends JpaRepository<BesoinRessource, Long> {

    @Query("SELECT b FROM BesoinRessource b WHERE b.departement.id = :departementId")
    List<BesoinRessource> findByDepartementId(@Param("departementId") Long departementId);

    List<BesoinRessource> findByStatut(String statut);

    @Query("SELECT b FROM BesoinRessource b WHERE b.enseignant.id = :enseignantId")
    List<BesoinRessource> findByEnseignantId(@Param("enseignantId") Long enseignantId);

    @Query("SELECT b FROM BesoinRessource b WHERE b.reunion.id = :reunionId")
    List<BesoinRessource> findByReunionId(@Param("reunionId") Long reunionId);
}
