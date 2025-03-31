package QwaBar4.bank.Model;

import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Transactional
public interface UserModelRepository extends JpaRepository<UserModel, Long> {

    @Query("SELECT u FROM UserModel u WHERE lower(u.username) = lower(:username)")
    Optional<UserModel> findByUsername(@Param("username") String username);

    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END " +
          "FROM UserModel u WHERE LOWER(u.username) = LOWER(:username)")
    boolean existsByUsernameIgnoreCase(@Param("username") String username);
    
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END " +
      "FROM UserModel u WHERE LOWER(u.email) = LOWER(:email)")
	boolean existsByEmailIgnoreCase(@Param("email") String email);

    @Modifying
    @Query("DELETE FROM UserModel u WHERE lower(u.username) = lower(:username)")
    void deleteByUsernameIgnoreCase(@Param("username") String username);
    
	@Modifying
	@Query("UPDATE UserModel u SET u.password = :password WHERE LOWER(u.email) = LOWER(:email)")
	@Transactional
	void updatePassword(@Param("email") String email, @Param("password") String password);
    
    @Query("SELECT u FROM UserModel u WHERE LOWER(u.email) = LOWER(:email)")
    Optional<UserModel> findByEmailIgnoreCase(@Param("email") String email);
}

