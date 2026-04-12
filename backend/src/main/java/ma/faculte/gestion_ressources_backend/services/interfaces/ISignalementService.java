package ma.faculte.gestion_ressources_backend.services.interfaces;

import ma.faculte.gestion_ressources_backend.dto.maintenance.SignalementPanneDTO;

import java.util.List;

public interface ISignalementService {

    SignalementPanneDTO creer(SignalementPanneDTO dto);

    List<SignalementPanneDTO> listerTous();

    SignalementPanneDTO getById(Long id);

    List<SignalementPanneDTO> listerParStatut(String statut);

    SignalementPanneDTO assignerTechnicien(Long signalementId, Long technicienId);

    SignalementPanneDTO fermer(Long signalementId);
}
