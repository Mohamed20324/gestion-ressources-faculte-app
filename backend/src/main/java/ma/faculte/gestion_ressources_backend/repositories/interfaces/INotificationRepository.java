package ma.faculte.gestion_ressources_backend.repositories.interfaces;

import ma.faculte.gestion_ressources_backend.entities.appel_offre.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface INotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n WHERE n.destinataire.id = :userId")
    List<Notification> findByDestinataireId(@Param("userId") Long userId);

    @Query("SELECT n FROM Notification n WHERE n.destinataire.id = :userId AND n.lu = :lu")
    List<Notification> findByDestinataireIdAndLu(@Param("userId") Long userId, @Param("lu") boolean lu);
}
