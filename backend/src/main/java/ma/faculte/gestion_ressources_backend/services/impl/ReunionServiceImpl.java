package ma.faculte.gestion_ressources_backend.services.impl;

import ma.faculte.gestion_ressources_backend.dto.departement.ReunionDTO;
import ma.faculte.gestion_ressources_backend.entities.besoins.BesoinRessource;
import ma.faculte.gestion_ressources_backend.entities.departement.Departement;
import ma.faculte.gestion_ressources_backend.entities.departement.Reunion;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.ChefDepartement;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Responsable;
import ma.faculte.gestion_ressources_backend.entities.appel_offre.Notification;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.*;
import ma.faculte.gestion_ressources_backend.services.interfaces.INotificationService;
import ma.faculte.gestion_ressources_backend.services.interfaces.IReunionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReunionServiceImpl implements IReunionService {

    @Autowired
    private IReunionRepository reunionRepository;

    @Autowired
    private IDepartementRepository departementRepository;

    @Autowired
    private IChefDepartementRepository chefDepartementRepository;

    @Autowired
    private IBesoinRessourceRepository besoinRessourceRepository;

    @Autowired
    private IResponsableRepository responsableRepository;

    @Autowired
    private INotificationService notificationService;

    @Override
    @Transactional
    public ReunionDTO creerReunion(ReunionDTO dto) {
        Departement dep = departementRepository.findById(dto.getDepartementId())
                .orElseThrow(() -> new RuntimeException("Département introuvable"));
        ChefDepartement chef = chefDepartementRepository.findById(dto.getChefId())
                .orElseThrow(() -> new RuntimeException("Chef de département introuvable"));
        Reunion r = new Reunion();
        r.setDate(dto.getDate());
        r.setHeure(dto.getHeure());
        r.setStatut(dto.getStatut() != null ? dto.getStatut() : Reunion.STATUT_PLANIFIEE);
        r.setDepartement(dep);
        r.setChef(chef);
        return versDto(reunionRepository.save(r));
    }

    @Override
    @Transactional
    public ReunionDTO modifierReunion(Long id, ReunionDTO dto) {
        Reunion r = reunionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réunion introuvable"));
        if (dto.getDate() != null) r.setDate(dto.getDate());
        if (dto.getHeure() != null) r.setHeure(dto.getHeure());
        if (dto.getStatut() != null) r.setStatut(dto.getStatut());
        
        if (dto.getDepartementId() != null) {
            Departement dep = departementRepository.findById(dto.getDepartementId()).orElse(null);
            r.setDepartement(dep);
        }
        if (dto.getChefId() != null) {
            ChefDepartement chef = chefDepartementRepository.findById(dto.getChefId()).orElse(null);
            r.setChef(chef);
        }
        return versDto(reunionRepository.save(r));
    }

    @Override
    @Transactional
    public void supprimerReunion(Long id) {
        reunionRepository.deleteById(id);
    }

    @Override
    @Transactional
    public List<ReunionDTO> listerToutesLesReunions() {
        java.time.LocalDate today = java.time.LocalDate.now();
        List<Reunion> all = reunionRepository.findAll();
        
        for (Reunion r : all) {
            if (r.getDate().isBefore(today) && Reunion.STATUT_PLANIFIEE.equals(r.getStatut())) {
                r.setStatut(Reunion.STATUT_VALIDEE);
                reunionRepository.save(r);
            }
        }
        
        return all.stream()
                .map(this::versDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ReunionDTO demarrerReunion(Long id) {
        Reunion r = reunionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réunion introuvable"));
        if (!Reunion.STATUT_PLANIFIEE.equals(r.getStatut())) {
            throw new RuntimeException("Seule une réunion PLANIFIEE peut être démarrée");
        }
        r.setStatut(Reunion.STATUT_EN_COURS);
        return versDto(reunionRepository.save(r));
    }

    @Override
    @Transactional
    public ReunionDTO validerReunion(Long id) {
        Reunion r = reunionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réunion introuvable"));
        if (!Reunion.STATUT_EN_COURS.equals(r.getStatut())) {
            throw new RuntimeException("La réunion doit être EN_COURS pour être validée");
        }
        r.setStatut(Reunion.STATUT_VALIDEE);
        for (BesoinRessource b : r.getBesoins()) {
            b.setStatut(BesoinRessource.STATUT_VALIDE);
            besoinRessourceRepository.save(b);
        }
        reunionRepository.save(r);
        String msg = "La réunion n°" + id + " a été validée ; les besoins associés passent au statut VALIDE.";
        for (Responsable resp : responsableRepository.findAll()) {
            notificationService.envoyerNotification(resp.getId(), r.getChef().getId(), msg, Notification.TYPE_INFO);
        }
        return versDto(r);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReunionDTO> getByDepartement(Long departementId) {
        return reunionRepository.findByDepartementId(departementId).stream()
                .map(this::versDto)
                .collect(Collectors.toList());
    }

    private ReunionDTO versDto(Reunion r) {
        ReunionDTO d = new ReunionDTO();
        d.setId(r.getId());
        d.setDate(r.getDate());
        d.setHeure(r.getHeure());
        d.setStatut(r.getStatut());
        if (r.getDepartement() != null) {
            d.setDepartementId(r.getDepartement().getId());
        }
        if (r.getChef() != null) {
            d.setChefId(r.getChef().getId());
        }
        return d;
    }
}
