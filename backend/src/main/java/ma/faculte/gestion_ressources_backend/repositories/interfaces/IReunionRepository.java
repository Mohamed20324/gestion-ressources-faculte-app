package ma.faculte.gestion_ressources_backend.repositories.interfaces;

import ma.faculte.gestion_ressources_backend.entities.departement.Reunion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IReunionRepository extends JpaRepository<Reunion, Long> {

    @Query("SELECT r FROM Reunion r WHERE r.departement.id = :departementId")
    List<Reunion> findByDepartementId(@Param("departementId") Long departementId);

    List<Reunion> findByStatut(String statut);
}
