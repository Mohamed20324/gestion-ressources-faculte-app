package ma.faculte.gestion_ressources_backend.services.impl;

import ma.faculte.gestion_ressources_backend.dto.appel_offre.lignes.LigneOffreDTO;
import ma.faculte.gestion_ressources_backend.dto.appel_offre.OffreDTO;
import ma.faculte.gestion_ressources_backend.entities.appel_offre.AppelOffre;
import ma.faculte.gestion_ressources_backend.entities.appel_offre.Offre;
import ma.faculte.gestion_ressources_backend.entities.appel_offre.lignes.LigneOffre;
import ma.faculte.gestion_ressources_backend.entities.appel_offre.lignes.LigneOffreImprimante;
import ma.faculte.gestion_ressources_backend.entities.appel_offre.lignes.LigneOffreOrdinateur;
import ma.faculte.gestion_ressources_backend.entities.besoins.BesoinRessource;
import ma.faculte.gestion_ressources_backend.entities.referentiel.TypeRessource;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Fournisseur;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.*;
import ma.faculte.gestion_ressources_backend.services.interfaces.INotificationService;
import ma.faculte.gestion_ressources_backend.services.interfaces.IOffreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OffreServiceImpl implements IOffreService {

    @Autowired
    private IOffreRepository offreRepository;

    @Autowired
    private IAppelOffreRepository appelOffreRepository;

    @Autowired
    private IFournisseurRepository fournisseurRepository;

    @Autowired
    private ITypeRessourceRepository typeRessourceRepository;

    @Autowired
    private IBesoinRessourceRepository besoinRessourceRepository;

    @Autowired
    private INotificationService notificationService;

    @Override
    @Transactional
    public OffreDTO soumettreOffre(OffreDTO dto) {
        AppelOffre ao = appelOffreRepository.findById(dto.getAppelOffreId())
                .orElseThrow(() -> new RuntimeException("Appel d'offres introuvable"));
        if (!AppelOffre.STATUT_OUVERT.equals(ao.getStatut())) {
            throw new RuntimeException("Les offres ne sont acceptées que pour un appel OUVERT");
        }
        Fournisseur f = fournisseurRepository.findById(dto.getFournisseurId())
                .orElseThrow(() -> new RuntimeException("Fournisseur introuvable"));
        if (f.isEstListeNoire()) {
            throw new RuntimeException("Fournisseur exclu (liste noire)");
        }
        Offre offre = new Offre();
        offre.setDateSoumission(dto.getDateSoumission() != null ? dto.getDateSoumission() : LocalDate.now());
        offre.setDateLivraison(dto.getDateLivraison());
        offre.setDureeGarantie(dto.getDureeGarantie());
        offre.setStatut(Offre.STATUT_SOUMISE);
        offre.setAppelOffre(ao);
        offre.setFournisseur(f);

        double total = 0;
        if (dto.getLignes() != null) {
            for (LigneOffreDTO ld : dto.getLignes()) {
                LigneOffre ligne = creerLigne(ld);
                TypeRessource tr = typeRessourceRepository.findById(ld.getTypeRessourceId())
                        .orElseThrow(() -> new RuntimeException("Type de ressource introuvable"));
                BesoinRessource besoin = besoinRessourceRepository.findById(ld.getBesoinId())
                        .orElseThrow(() -> new RuntimeException("Besoin introuvable"));
                ligne.setTypeRessource(tr);
                ligne.setBesoin(besoin);
                ligne.setOffre(offre);
                offre.getLignes().add(ligne);
                double pu = ligne.getPrixUnitaire() != null ? ligne.getPrixUnitaire() : 0;
                total += pu * ligne.getQuantite();
            }
        }
        if (dto.getPrixTotal() != null) {
            offre.setPrixTotal(dto.getPrixTotal());
        } else {
            offre.setPrixTotal(total);
        }
        return versDto(offreRepository.save(offre));
    }

    private LigneOffre creerLigne(LigneOffreDTO ld) {
        LigneOffre ligne;
        if (LigneOffreDTO.VARIANTE_ORDINATEUR.equals(ld.getVariante())) {
            LigneOffreOrdinateur lo = new LigneOffreOrdinateur();
            lo.setCpu(ld.getCpu());
            lo.setRam(ld.getRam());
            lo.setDisqueDur(ld.getDisqueDur());
            lo.setEcran(ld.getEcran());
            ligne = lo;
        } else if (LigneOffreDTO.VARIANTE_IMPRIMANTE.equals(ld.getVariante())) {
            LigneOffreImprimante li = new LigneOffreImprimante();
            li.setVitesseImpression(ld.getVitesseImpression());
            li.setResolution(ld.getResolution());
            ligne = li;
        } else {
            ligne = new LigneOffre();
        }
        ligne.setMarque(ld.getMarque());
        ligne.setPrixUnitaire(ld.getPrixUnitaire());
        ligne.setQuantite(ld.getQuantite());
        ligne.setDescriptionTechnique(ld.getDescriptionTechnique());
        return ligne;
    }

    @Override
    @Transactional
    public OffreDTO accepterOffre(Long id) {
        Offre retenue = offreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offre introuvable"));
        AppelOffre ao = retenue.getAppelOffre();
        List<Offre> toutes = offreRepository.findByAppelOffreId(ao.getId());
        for (Offre o : toutes) {
            if (o.getId().equals(retenue.getId())) {
                o.setStatut(Offre.STATUT_ACCEPTEE);
                notificationService.envoyerAcceptation(o.getFournisseur().getId());
            } else if (Offre.STATUT_SOUMISE.equals(o.getStatut())) {
                o.setStatut(Offre.STATUT_REJETEE);
                notificationService.envoyerRejet(o.getFournisseur().getId(),
                        "Une autre offre a été retenue pour cet appel d'offres.");
            }
            offreRepository.save(o);
        }
        ao.setStatut(AppelOffre.STATUT_TRAITE);
        appelOffreRepository.save(ao);
        Offre miseAJour = offreRepository.findById(id).orElseThrow();
        return versDto(miseAJour);
    }

    @Override
    @Transactional
    public OffreDTO rejeterOffre(Long id, String motif) {
        Offre o = offreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offre introuvable"));
        o.setStatut(Offre.STATUT_REJETEE);
        o.setMotifRejet(motif);
        notificationService.envoyerRejet(o.getFournisseur().getId(), motif);
        return versDto(offreRepository.save(o));
    }

    @Override
    @Transactional
    public OffreDTO eliminerOffre(Long id, String motif) {
        Offre o = offreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offre introuvable"));
        o.setStatut(Offre.STATUT_ELIMINEE);
        o.setMotifRejet(motif);
        notificationService.envoyerNotification(o.getFournisseur().getId(),
                "Votre offre a été éliminée."
                        + (motif != null ? " Motif : " + motif : ""),
                ma.faculte.gestion_ressources_backend.entities.appel_offre.Notification.TYPE_ELIMINATION);
        return versDto(offreRepository.save(o));
    }

    @Override
    @Transactional(readOnly = true)
    public List<OffreDTO> getMoinsDisant(Long appelOffreId) {
        return offreRepository.findByAppelOffreIdOrderByPrixTotalAsc(appelOffreId).stream()
                .filter(o -> !o.getFournisseur().isEstListeNoire())
                .sorted(Comparator.comparing(Offre::getPrixTotal,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .map(this::versDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OffreDTO> getOffresByAppelOffre(Long appelOffreId) {
        return offreRepository.findByAppelOffreId(appelOffreId).stream()
                .map(this::versDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OffreDTO> getAllOffres() {
        return offreRepository.findAll().stream()
                .map(this::versDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OffreDTO> getByFournisseur(Long fournisseurId) {
        return offreRepository.findByFournisseurId(fournisseurId).stream()
                .map(this::versDto)
                .collect(Collectors.toList());
    }

    private OffreDTO versDto(Offre o) {
        OffreDTO d = new OffreDTO();
        d.setId(o.getId());
        d.setDateSoumission(o.getDateSoumission());
        d.setDateLivraison(o.getDateLivraison());
        d.setDureeGarantie(o.getDureeGarantie());
        d.setPrixTotal(o.getPrixTotal());
        d.setStatut(o.getStatut());
        d.setMotifRejet(o.getMotifRejet());
        d.setFournisseurId(o.getFournisseur().getId());
        d.setFournisseurNom(o.getFournisseur().getNomSociete());
        d.setAppelOffreId(o.getAppelOffre().getId());
        d.setAppelOffreReference(o.getAppelOffre().getReference());
        d.setAppelOffreStatut(o.getAppelOffre().getStatut());
        
        if (o.getLignes() != null) {
            d.setLignes(o.getLignes().stream().map(l -> {
                LigneOffreDTO ld = new LigneOffreDTO();
                ld.setId(l.getId());
                ld.setQuantite(l.getQuantite());
                ld.setPrixUnitaire(l.getPrixUnitaire());
                ld.setMarque(l.getMarque());
                ld.setTypeRessourceId(l.getTypeRessource().getId());
                ld.setBesoinId(l.getBesoin().getId());
                if (l instanceof LigneOffreOrdinateur) {
                    LigneOffreOrdinateur lo = (LigneOffreOrdinateur) l;
                    ld.setVariante(LigneOffreDTO.VARIANTE_ORDINATEUR);
                    ld.setCpu(lo.getCpu());
                    ld.setRam(lo.getRam());
                    ld.setDisqueDur(lo.getDisqueDur());
                    ld.setEcran(lo.getEcran());
                } else if (l instanceof LigneOffreImprimante) {
                    LigneOffreImprimante li = (LigneOffreImprimante) l;
                    ld.setVariante(LigneOffreDTO.VARIANTE_IMPRIMANTE);
                    ld.setVitesseImpression(li.getVitesseImpression());
                    ld.setResolution(li.getResolution());
                }
                return ld;
            }).collect(Collectors.toList()));
        }
        
        return d;
    }
}
