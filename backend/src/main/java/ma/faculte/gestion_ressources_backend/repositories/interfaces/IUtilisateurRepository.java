package ma.faculte.gestion_ressources_backend.repositories.interfaces;

import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/*
 * REPOSITORY UTILISATEUR
 * JpaRepository fournit automatiquement :
 * save(), findById(), findAll(), deleteById()...
 * Les méthodes ci-dessous sont générées automatiquement
 * par Spring Data JPA grâce aux noms des méthodes
 *
 * UTILISÉ PAR : UtilisateurServiceImpl, AuthServiceImpl
 */

@Repository
public interface IUtilisateurRepository
        extends JpaRepository<Utilisateur, Long> {

    /*
     * utilisé pour le login
     * recherche par email unique
     */
    Optional<Utilisateur> findByEmail(String email);

    /*
     * utilisé pour filtrer par rôle
     * ex: findByRole("ENSEIGNANT")
     */
    List<Utilisateur> findByRole(String role);

    /*
     * utilisé pour lister les comptes actifs
     */
    List<Utilisateur> findByActif(boolean actif);

    /*
     * vérifier si email déjà utilisé
     * avant création d'un nouveau compte
     */
    boolean existsByEmail(String email);
}