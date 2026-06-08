package springboot.leavemanagementsystem.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import springboot.leavemanagementsystem.entity.LeaveBalance;
import springboot.leavemanagementsystem.entity.LeaveType;
import springboot.leavemanagementsystem.entity.User;

import java.util.List;
import java.util.Optional;

public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {

    Optional<LeaveBalance> findByUserAndLeaveTypeAndYear(
            User user,
            LeaveType leaveType,
            Integer year
    );

    Page<LeaveBalance> findByYear(Integer year, Pageable pageable);

    Page<LeaveBalance> findByUser_IdAndYear(Long userId, Integer year, Pageable pageable);

    List<LeaveBalance> findByLeaveTypeAndYear(LeaveType leaveType, Integer year);

    List<LeaveBalance> findByUserAndYear(User user, Integer year);
}
