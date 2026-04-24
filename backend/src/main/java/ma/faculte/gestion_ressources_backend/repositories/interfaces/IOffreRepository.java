package ma.faculte.gestion_ressources_backend.repositories.interfaces;

import ma.faculte.gestion_ressources_backend.entities.appel_offre.Offre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IOffreRepository extends JpaRepository<Offre, Long> {

    @Query("SELECT o FROM Offre o WHERE o.appelOffre.id = :appelOffreId")
    List<Offre> findByAppelOffreId(@Param("appelOffreId") Long appelOffreId);

    @Query("SELECT o FROM Offre o WHERE o.fournisseur.id = :fournisseurId")
    List<Offre> findByFournisseurId(@Param("fournisseurId") Long fournisseurId);

    List<Offre> findByStatut(String statut);

    @Query("SELECT o FROM Offre o WHERE o.appelOffre.id = :id ORDER BY o.prixTotal ASC")
    List<Offre> findByAppelOffreIdOrderByPrixTotalAsc(@Param("id") Long id);

    @Query("SELECT COUNT(o) FROM Offre o WHERE o.statut = 'ACCEPTEE' AND o.dateLivraison < CURRENT_DATE")
    long countLateDeliveries();
}
