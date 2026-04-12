package ma.faculte.gestion_ressources_backend.repositories.interfaces;

import ma.faculte.gestion_ressources_backend.entities.appel_offre.ListeNoire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IListeNoireRepository extends JpaRepository<ListeNoire, Long> {

    boolean existsByFournisseur_Id(Long fournisseurId);

    Optional<ListeNoire> findByFournisseur_Id(Long fournisseurId);
}
