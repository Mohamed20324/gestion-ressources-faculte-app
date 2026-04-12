package ma.faculte.gestion_ressources_backend.dto.utilisateurs;

import java.time.LocalDate;

public class ChefDepartementDTO extends EnseignantDTO {

    private LocalDate dateNomination;
    private Long departementGereId;

    public ChefDepartementDTO() {}

    public LocalDate getDateNomination() {
        return dateNomination;
    }

    public void setDateNomination(LocalDate dateNomination) {
        this.dateNomination = dateNomination;
    }

    public Long getDepartementGereId() {
        return departementGereId;
    }

    public void setDepartementGereId(Long departementGereId) {
        this.departementGereId = departementGereId;
    }
}
