package ma.faculte.gestion_ressources_backend.repositories.interfaces;

import ma.faculte.gestion_ressources_backend.entities.appel_offre.AppelOffre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface IAppelOffreRepository extends JpaRepository<AppelOffre, Long> {

    List<AppelOffre> findByStatut(String statut);

    List<AppelOffre> findByDateFinAfter(LocalDate date);
}
