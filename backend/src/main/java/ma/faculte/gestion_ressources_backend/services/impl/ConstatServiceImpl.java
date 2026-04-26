package ma.faculte.gestion_ressources_backend.services.impl;

import ma.faculte.gestion_ressources_backend.dto.maintenance.ConstatDTO;
import ma.faculte.gestion_ressources_backend.entities.appel_offre.Notification;
import ma.faculte.gestion_ressources_backend.entities.maintenance.Constat;
import ma.faculte.gestion_ressources_backend.entities.maintenance.SignalementPanne;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Responsable;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Technicien;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IConstatRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IResponsableRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.ISignalementPanneRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.ITechnicienRepository;
import ma.faculte.gestion_ressources_backend.services.interfaces.IConstatService;
import ma.faculte.gestion_ressources_backend.services.interfaces.INotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class ConstatServiceImpl implements IConstatService {

    @Autowired
    private IConstatRepository constatRepository;

    @Autowired
    private ISignalementPanneRepository signalementRepository;

    @Autowired
    private ITechnicienRepository technicienRepository;

    @Autowired
    private IResponsableRepository responsableRepository;

    @Autowired
    private INotificationService notificationService;

    @Override
    @Transactional
    public ConstatDTO rediger(ConstatDTO dto) {
        SignalementPanne s = signalementRepository.findById(dto.getSignalementId())
                .orElseThrow(() -> new RuntimeException("Signalement introuvable"));
        if (constatRepository.findBySignalement_Id(s.getId()).isPresent()) {
            throw new RuntimeException("Un constat existe déjà pour ce signalement");
        }
        Technicien t = technicienRepository.findById(dto.getTechnicienId())
                .orElseThrow(() -> new RuntimeException("Technicien introuvable"));

        Constat c = new Constat();
        c.setSignalement(s);
        c.setTechnicien(t);
        c.setExplication(dto.getExplication());
        c.setDateApparition(dto.getDateApparition());
        c.setFrequence(dto.getFrequence());
        c.setOrdre(dto.getOrdre());
        c.setDateConstat(dto.getDateConstat() != null ? dto.getDateConstat() : LocalDate.now());
        c.setEnvoyeAuResponsable(dto.isEnvoyeAuResponsable());

        s.setStatut(SignalementPanne.STATUT_CONSTAT);
        s.setTechnicien(t);
        signalementRepository.save(s);

        Constat sauve = constatRepository.save(c);

        if (dto.isEnvoyeAuResponsable()) {
            Responsable resp = responsableRepository.findAll().stream()
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Aucun responsable enregistré"));
            String msg = "Nouveau constat de panne (signalement #" + s.getId() + ") : "
                    + truncate(dto.getExplication(), 200);
            notificationService.envoyerNotification(resp.getId(), t.getId(), msg, Notification.TYPE_INFO);
            sauve.setEnvoyeAuResponsable(true);
            constatRepository.save(sauve);
        }

        return versDto(sauve);
    }

    @Override
    @Transactional
    public ConstatDTO modifier(Long id, ConstatDTO dto) {
        Constat c = constatRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Constat introuvable"));
        
        c.setExplication(dto.getExplication());
        c.setDateApparition(dto.getDateApparition());
        c.setFrequence(dto.getFrequence());
        c.setOrdre(dto.getOrdre());
        c.setEnvoyeAuResponsable(dto.isEnvoyeAuResponsable());

        if (dto.isEnvoyeAuResponsable()) {
            Responsable resp = responsableRepository.findAll().stream()
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Aucun responsable enregistré"));
            String msg = "Mise à jour du constat de panne (signalement #" + c.getSignalement().getId() + ") : "
                    + truncate(dto.getExplication(), 200);
            notificationService.envoyerNotification(resp.getId(), c.getTechnicien().getId(), msg, Notification.TYPE_INFO);
        }

        return versDto(constatRepository.save(c));
    }

    @Override
    @Transactional(readOnly = true)
    public ConstatDTO getById(Long id) {
        Constat c = constatRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Constat introuvable"));
        return versDto(c);
    }

    @Override
    @Transactional(readOnly = true)
    public ConstatDTO getBySignalementId(Long signalementId) {
        Constat c = constatRepository.findBySignalement_Id(signalementId)
                .orElseThrow(() -> new RuntimeException("Aucun constat pour ce signalement"));
        return versDto(c);
    }

    private static String truncate(String s, int max) {
        if (s == null) {
            return "";
        }
        return s.length() <= max ? s : s.substring(0, max) + "...";
    }

    private ConstatDTO versDto(Constat c) {
        ConstatDTO d = new ConstatDTO();
        d.setId(c.getId());
        d.setSignalementId(c.getSignalement().getId());
        d.setTechnicienId(c.getTechnicien().getId());
        d.setExplication(c.getExplication());
        d.setDateApparition(c.getDateApparition());
        d.setFrequence(c.getFrequence());
        d.setOrdre(c.getOrdre());
        d.setDateConstat(c.getDateConstat());
        d.setEnvoyeAuResponsable(c.isEnvoyeAuResponsable());
        
        // Enrichissement du DTO pour l'affichage Responsable
        if (c.getTechnicien() != null) {
            d.setTechnicienNom(c.getTechnicien().getNom() + " " + c.getTechnicien().getPrenom());
        }
        
        if (c.getSignalement() != null && c.getSignalement().getRessource() != null) {
            var res = c.getSignalement().getRessource();
            d.setRessourceNom(res.getMarque() + " (Inv: " + res.getNumeroInventaire() + ")");
            d.setSousGarantie(res.getDateFinGarantie() != null && res.getDateFinGarantie().isAfter(LocalDate.now()));
        }
        
        return d;
    }
    @Override
    @Transactional(readOnly = true)
    public java.util.List<ConstatDTO> getAll() {
        return constatRepository.findAll().stream()
                .map(this::versDto)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional
    public ConstatDTO envoyerAuFournisseur(Long constatId) {
        Constat c = constatRepository.findById(constatId)
                .orElseThrow(() -> new RuntimeException("Constat introuvable"));
        
        SignalementPanne s = c.getSignalement();
        s.setStatut(SignalementPanne.STATUT_FOURNISSEUR);
        signalementRepository.save(s);

        s.getRessource().setStatut(ma.faculte.gestion_ressources_backend.entities.inventaire.Ressource.STATUT_MAINTENANCE);
        
        // Notify supplier
        if (s.getRessource().getFournisseur() != null) {
            Responsable resp = responsableRepository.findAll().stream().findFirst().orElse(null);
            Long expediteurId = resp != null ? resp.getId() : 1L;
            String msg = "Demande de réparation pour la ressource " + s.getRessource().getMarque() 
                       + " (Inv: " + s.getRessource().getNumeroInventaire() + "). Constat: " + c.getExplication();
            notificationService.envoyerNotification(s.getRessource().getFournisseur().getId(), expediteurId, msg, Notification.TYPE_AVERTISSEMENT);
        }

        return versDto(c);
    }

    @Override
    @Transactional
    public ConstatDTO demanderEchange(Long constatId) {
        Constat c = constatRepository.findById(constatId)
                .orElseThrow(() -> new RuntimeException("Constat introuvable"));
        
        SignalementPanne s = c.getSignalement();
        s.setStatut(SignalementPanne.STATUT_ECHANGE);
        signalementRepository.save(s);

        s.getRessource().setStatut(ma.faculte.gestion_ressources_backend.entities.inventaire.Ressource.STATUT_REFORME);
        
        // Notify supplier
        if (s.getRessource().getFournisseur() != null) {
            Responsable resp = responsableRepository.findAll().stream().findFirst().orElse(null);
            Long expediteurId = resp != null ? resp.getId() : 1L;
            String msg = "Demande d'ÉCHANGE SOUS GARANTIE pour la ressource " + s.getRessource().getMarque() 
                       + " (Inv: " + s.getRessource().getNumeroInventaire() + "). Constat: " + c.getExplication();
            notificationService.envoyerNotification(s.getRessource().getFournisseur().getId(), expediteurId, msg, Notification.TYPE_AVERTISSEMENT);
        }

        return versDto(c);
    }
}
