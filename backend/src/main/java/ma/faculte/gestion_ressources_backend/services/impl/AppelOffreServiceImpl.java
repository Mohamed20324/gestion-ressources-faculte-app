package ma.faculte.gestion_ressources_backend.services.impl;

import ma.faculte.gestion_ressources_backend.dto.appel_offre.AppelOffreDTO;
import ma.faculte.gestion_ressources_backend.dto.departement.besoins.BesoinRessourceDTO;
import ma.faculte.gestion_ressources_backend.entities.appel_offre.AppelOffre;
import ma.faculte.gestion_ressources_backend.entities.besoins.BesoinImprimante;
import ma.faculte.gestion_ressources_backend.entities.besoins.BesoinOrdinateur;
import ma.faculte.gestion_ressources_backend.entities.besoins.BesoinRessource;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Responsable;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IAppelOffreRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IBesoinRessourceRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IResponsableRepository;
import ma.faculte.gestion_ressources_backend.services.interfaces.IAppelOffreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppelOffreServiceImpl implements IAppelOffreService {

    @Autowired
    private IAppelOffreRepository appelOffreRepository;

    @Autowired
    private IBesoinRessourceRepository besoinRessourceRepository;

    @Autowired
    private IResponsableRepository responsableRepository;

    @Override
    @Transactional
    public AppelOffreDTO creerAppelOffre(AppelOffreDTO dto) {
        if (appelOffreRepository.findAll().stream()
                .anyMatch(a -> a.getReference().equalsIgnoreCase(dto.getReference()))) {
            throw new RuntimeException("Référence d'appel d'offres déjà utilisée");
        }
        Responsable resp = responsableRepository.findById(dto.getResponsableId())
                .orElseThrow(() -> new RuntimeException("Responsable introuvable"));
        AppelOffre ao = new AppelOffre();
        ao.setReference(dto.getReference());
        ao.setDateDebut(dto.getDateDebut());
        ao.setDateFin(dto.getDateFin());
        ao.setStatut(dto.getStatut() != null ? dto.getStatut() : AppelOffre.STATUT_OUVERT);
        ao.setResponsable(resp);
        ao = appelOffreRepository.save(ao);
        if (dto.getBesoinIds() != null && !dto.getBesoinIds().isEmpty()) {
            ajouterBesoins(ao.getId(), dto.getBesoinIds());
            ao = appelOffreRepository.findById(ao.getId()).orElseThrow();
        }
        return versDto(ao);
    }

    @Override
    @Transactional
    public AppelOffreDTO ajouterBesoins(Long id, List<Long> besoinIds) {
        AppelOffre ao = appelOffreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appel d'offres introuvable"));
        if (besoinIds == null) {
            return versDto(ao);
        }
        for (Long bid : besoinIds) {
            BesoinRessource b = besoinRessourceRepository.findById(bid)
                    .orElseThrow(() -> new RuntimeException("Besoin introuvable : " + bid));
            if (!ao.getBesoins().contains(b)) {
                ao.getBesoins().add(b);
                b.getAppelsOffre().add(ao);
            }
        }
        return versDto(appelOffreRepository.save(ao));
    }

    @Override
    @Transactional
    public AppelOffreDTO cloturerAppelOffre(Long id) {
        AppelOffre ao = appelOffreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appel d'offres introuvable"));
        ao.setStatut(AppelOffre.STATUT_CLOTURE);
        return versDto(appelOffreRepository.save(ao));
    }

    @Override
    @Transactional(readOnly = true)
    public AppelOffreDTO getById(Long id) {
        AppelOffre ao = appelOffreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appel d'offres introuvable"));
        return versDto(ao);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppelOffreDTO> getAllOuverts() {
        return appelOffreRepository.findByStatut(AppelOffre.STATUT_OUVERT).stream()
                .map(this::versDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppelOffreDTO> getAll() {
        return appelOffreRepository.findAll().stream()
                .map(this::versDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AppelOffreDTO publierAppelOffre(Long id) {
        AppelOffre ao = appelOffreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appel d'offres introuvable"));
        ao.setStatut(AppelOffre.STATUT_OUVERT);
        return versDto(appelOffreRepository.save(ao));
    }

    @Override
    @Transactional
    public void supprimerAppelOffre(Long id) {
        AppelOffre ao = appelOffreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appel d'offres introuvable"));
        // Remove links to needs before deleting
        for (BesoinRessource b : ao.getBesoins()) {
            b.getAppelsOffre().remove(ao);
        }
        ao.getBesoins().clear();
        appelOffreRepository.delete(ao);
    }

    @Override
    @Transactional
    public AppelOffreDTO retirerBesoin(Long aoId, Long besoinId) {
        AppelOffre ao = appelOffreRepository.findById(aoId)
                .orElseThrow(() -> new RuntimeException("Appel d'offres introuvable"));
        BesoinRessource b = besoinRessourceRepository.findById(besoinId)
                .orElseThrow(() -> new RuntimeException("Besoin introuvable"));
        
        ao.getBesoins().remove(b);
        b.getAppelsOffre().remove(ao);
        
        return versDto(appelOffreRepository.save(ao));
    }

    private AppelOffreDTO versDto(AppelOffre ao) {
        AppelOffreDTO d = new AppelOffreDTO();
        d.setId(ao.getId());
        d.setReference(ao.getReference());
        d.setDateDebut(ao.getDateDebut());
        d.setDateFin(ao.getDateFin());
        d.setStatut(ao.getStatut());
        d.setResponsableId(ao.getResponsable().getId());
        d.setBesoinIds(ao.getBesoins().stream().map(BesoinRessource::getId).collect(Collectors.toList()));
        
        // Populate full needs details
        d.setBesoins(ao.getBesoins().stream().map(this::mapBesoinToDto).collect(Collectors.toList()));
        
        return d;
    }

    private BesoinRessourceDTO mapBesoinToDto(BesoinRessource b) {
        BesoinRessourceDTO d = new BesoinRessourceDTO();
        d.setId(b.getId());
        d.setTypeRessourceId(b.getTypeRessource().getId());
        d.setQuantite(b.getQuantite());
        d.setDescription(b.getDescription());
        d.setStatut(b.getStatut());
        d.setDepartementId(b.getDepartement() != null ? b.getDepartement().getId() : null);
        d.setReunionId(b.getReunion() != null ? b.getReunion().getId() : null);
        
        // Handle specific types (Ordinateur, Imprimante)
        if (b instanceof BesoinOrdinateur bo) {
            d.setCategorie("ORDINATEUR");
            d.setCpu(bo.getCpu());
            d.setRam(bo.getRam());
            d.setDisqueDur(bo.getDisqueDur());
            d.setEcran(bo.getEcran());
            d.setMarque(bo.getMarque());
        } else if (b instanceof BesoinImprimante bi) {
            d.setCategorie("IMPRIMANTE");
            d.setVitesseImpression(bi.getVitesseImpression());
            d.setResolution(bi.getResolution());
            d.setMarque(bi.getMarque());
        } else {
            d.setCategorie("STANDARD");
        }
        
        return d;
    }
}
