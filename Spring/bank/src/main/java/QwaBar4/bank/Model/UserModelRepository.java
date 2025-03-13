package QwaBar4.bank.Model;

import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Transactional
public interface UserModelRepository extends JpaRepository<UserModel, Long> {

    @Query("SELECT u FROM UserModel u WHERE lower(u.username) = lower(:username)")
    Optional<UserModel> findByUsername(@Param("username") String username); // Removed @Lock

    boolean existsByUsernameIgnoreCase(String username);
    boolean existsByEmailIgnoreCase(String email);
}
