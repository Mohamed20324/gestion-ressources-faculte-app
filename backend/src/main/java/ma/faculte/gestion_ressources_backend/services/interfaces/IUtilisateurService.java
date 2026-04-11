package ma.faculte.gestion_ressources_backend.services.interfaces;

import ma.faculte.gestion_ressources_backend.dto.utilisateurs.*;
import java.util.List;

/*
 * INTERFACE SERVICE UTILISATEUR
 * Définit le contrat que UtilisateurServiceImpl doit respecter
 * Toujours injecter l'interface dans les controllers
 * jamais l'implémentation directement
 */

public interface IUtilisateurService {

    /*
     * création des utilisateurs internes
     * réservé au Responsable uniquement
     */
    UtilisateurDTO creerEnseignant(EnseignantDTO dto);
    UtilisateurDTO creerChefDepartement(EnseignantDTO dto);
    UtilisateurDTO creerResponsable(EnseignantDTO dto);
    UtilisateurDTO creerTechnicien(EnseignantDTO dto);

    UtilisateurDTO modifierUtilisateur(Long id, EnseignantDTO dto);
    void supprimerUtilisateur(Long id);

    UtilisateurDTO getById(Long id);
    List<UtilisateurDTO> getAll();
    List<UtilisateurDTO> getByRole(String role);

    /*
     * compléter les infos du fournisseur après première livraison
     * appelé par Membre 4 via :
     * PUT /api/utilisateurs/fournisseur/{id}/completer
     */
    FournisseurDTO completerInfosFournisseur(Long id, FournisseurDTO dto);
    FournisseurDTO inscrireFournisseur(InscriptionFournisseurDTO dto);
}
