package QwaBar4.bank.Model;

import QwaBar4.bank.Model.AnonymizedMapping;
import org.springframework.data.jpa.repository.JpaRepository; 
import org.springframework.stereotype.Repository;
import java.util.Optional;


@Repository
public interface AnonymizedMappingRepository extends JpaRepository<AnonymizedMapping, Long> {
    Optional<AnonymizedMapping> findByAnonymizedValue(String anonymizedValue);
    Optional<AnonymizedMapping> findByOriginalHash(String originalHash);
}
