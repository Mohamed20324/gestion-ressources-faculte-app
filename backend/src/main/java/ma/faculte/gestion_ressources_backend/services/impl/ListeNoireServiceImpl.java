package ma.faculte.gestion_ressources_backend.services.impl;

import ma.faculte.gestion_ressources_backend.dto.appel_offre.ListeNoireDTO;
import ma.faculte.gestion_ressources_backend.entities.appel_offre.ListeNoire;
import ma.faculte.gestion_ressources_backend.entities.appel_offre.Notification;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Fournisseur;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Responsable;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IFournisseurRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IListeNoireRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IResponsableRepository;
import ma.faculte.gestion_ressources_backend.services.interfaces.IListeNoireService;
import ma.faculte.gestion_ressources_backend.services.interfaces.INotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ListeNoireServiceImpl implements IListeNoireService {

    @Autowired
    private IListeNoireRepository listeNoireRepository;

    @Autowired
    private IFournisseurRepository fournisseurRepository;

    @Autowired
    private IResponsableRepository responsableRepository;

    @Autowired
    private INotificationService notificationService;

    private Responsable premierResponsable() {
        return responsableRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Aucun responsable enregistré"));
    }

    @Override
    @Transactional
    public ListeNoireDTO ajouterFournisseur(Long fournisseurId, String motif) {
        if (listeNoireRepository.existsByFournisseur_Id(fournisseurId)) {
            throw new RuntimeException("Ce fournisseur est déjà en liste noire");
        }
        Fournisseur f = fournisseurRepository.findById(fournisseurId)
                .orElseThrow(() -> new RuntimeException("Fournisseur introuvable"));
        Responsable resp = premierResponsable();
        ListeNoire ln = new ListeNoire();
        ln.setMotif(motif);
        ln.setFournisseur(f);
        ln.setResponsable(resp);
        f.setEstListeNoire(true);
        fournisseurRepository.save(f);
        ListeNoire saved = listeNoireRepository.save(ln);
        notificationService.envoyerNotification(f.getId(),
                resp.getId(),
                "Votre entreprise a été ajoutée à la liste noire. Motif : " + motif,
                Notification.TYPE_INFO);
        return versDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean estListeNoire(Long fournisseurId) {
        return listeNoireRepository.existsByFournisseur_Id(fournisseurId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ListeNoireDTO> getAll() {
        return listeNoireRepository.findAll().stream()
                .map(this::versDto)
                .collect(Collectors.toList());
    }

    private ListeNoireDTO versDto(ListeNoire ln) {
        ListeNoireDTO d = new ListeNoireDTO();
        d.setId(ln.getId());
        d.setMotif(ln.getMotif());
        d.setDateAjout(ln.getDateAjout());
        d.setFournisseurId(ln.getFournisseur().getId());
        d.setNomSociete(ln.getFournisseur().getNomSociete());
        d.setResponsableId(ln.getResponsable().getId());
        return d;
    }
}
