package ma.faculte.gestion_ressources_backend.services.interfaces;

import ma.faculte.gestion_ressources_backend.dto.utilisateurs.*;

import java.util.List;

public interface IUtilisateurService {

    UtilisateurDTO creerUtilisateur(UtilisateurDTO dto);

    UtilisateurDTO modifierUtilisateur(Long id, UtilisateurDTO dto);

    void supprimerUtilisateur(Long id);

    UtilisateurDTO getById(Long id);

    List<UtilisateurDTO> getAll();

    List<UtilisateurDTO> getByRole(String role);

    FournisseurDTO inscrireFournisseur(InscriptionFournisseurDTO dto);

    UtilisateurDTO creerEnseignant(EnseignantDTO dto);

    UtilisateurDTO creerChefDepartement(EnseignantDTO dto);

    UtilisateurDTO creerResponsable(EnseignantDTO dto);

    UtilisateurDTO creerTechnicien(EnseignantDTO dto);

    UtilisateurDTO modifierUtilisateur(Long id, EnseignantDTO dto);

    FournisseurDTO completerInfosFournisseur(Long id, FournisseurDTO dto);

    void changerMotDePasse(Long id, String nouveauMotDePasse);
    List<UtilisateurDTO> getEnseignantsParDepartement(Long departementId);
}
