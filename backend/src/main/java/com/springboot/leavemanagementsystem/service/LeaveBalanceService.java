package springboot.leavemanagementsystem.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import springboot.leavemanagementsystem.dto.LeaveBalanceDto;
import springboot.leavemanagementsystem.entity.LeaveBalance;
import springboot.leavemanagementsystem.entity.LeaveType;
import springboot.leavemanagementsystem.entity.User;
import springboot.leavemanagementsystem.repository.LeaveBalanceRepository;
import springboot.leavemanagementsystem.repository.LeaveTypeRepository;
import springboot.leavemanagementsystem.repository.UserRepository;

import java.time.LocalDate;
import java.util.List;

@Service
public class LeaveBalanceService {

    private final LeaveBalanceRepository leaveBalanceRepository;
    private final UserRepository userRepository;
    private final LeaveTypeRepository leaveTypeRepository;

    public LeaveBalanceService(
            LeaveBalanceRepository leaveBalanceRepository,
            UserRepository userRepository,
            LeaveTypeRepository leaveTypeRepository) {
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.userRepository = userRepository;
        this.leaveTypeRepository = leaveTypeRepository;
    }

    /** Admin: paginated balances with optional user filter */
    @Transactional
    public Page<LeaveBalanceDto> getBalances(Long userId, Integer year, Pageable pageable) {
        int targetYear = (year != null) ? year : LocalDate.now().getYear();
        ensureYearInitialized(targetYear);

        Page<LeaveBalance> page;
        if (userId != null) {
            page = leaveBalanceRepository.findByUser_IdAndYear(userId, targetYear, pageable);
        } else {
            page = leaveBalanceRepository.findByYear(targetYear, pageable);
        }
        return page.map(this::mapToDto);
    }

    /** Employee: get own balances for current year, auto-initializing if missing */
    @Transactional
    public List<LeaveBalanceDto> getMyBalances(String email) {
        User employee = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        int currentYear = LocalDate.now().getYear();
        ensureYearInitializedForUser(employee, currentYear);

        List<LeaveBalance> balances = leaveBalanceRepository.findByUserAndYear(employee, currentYear);
        return balances.stream().map(this::mapToDto).toList();
    }

    /** Initialize balances for ALL employees for a given year */
    @Transactional
    public void ensureYearInitialized(int year) {
        List<User> employees = userRepository.findAll().stream()
                .filter(u -> u.getRole().getName().equals("EMPLOYEE"))
                .toList();
        List<LeaveType> leaveTypes = leaveTypeRepository.findAll();

        for (User employee : employees) {
            for (LeaveType leaveType : leaveTypes) {
                leaveBalanceRepository
                        .findByUserAndLeaveTypeAndYear(employee, leaveType, year)
                        .orElseGet(() -> leaveBalanceRepository.save(
                                new LeaveBalance(employee, leaveType, year, leaveType.getMaxDaysPerYear())
                        ));
            }
        }
    }

    /** Initialize balances for a SINGLE employee (called after creating a new employee) */
    @Transactional
    public void ensureYearInitializedForUser(User user, int year) {
        // Only employees get leave balances — never admin or manager
        if (!user.getRole().getName().equals("EMPLOYEE")) return;

        List<LeaveType> leaveTypes = leaveTypeRepository.findAll();
        for (LeaveType leaveType : leaveTypes) {
            leaveBalanceRepository
                    .findByUserAndLeaveTypeAndYear(user, leaveType, year)
                    .orElseGet(() -> leaveBalanceRepository.save(
                            new LeaveBalance(user, leaveType, year, leaveType.getMaxDaysPerYear())
                    ));
        }
    }

    /** Admin manual trigger */
    @Transactional
    public void initializeYear(Integer year) {
        ensureYearInitialized(year);
    }

    /** Adjust total allocated days for a specific balance */
    @Transactional
    public void adjustBalance(Long balanceId, Integer newTotalAllocated) {
        LeaveBalance balance = leaveBalanceRepository.findById(balanceId)
                .orElseThrow(() -> new RuntimeException("Leave balance not found"));

        if (newTotalAllocated < balance.getUsedDays()) {
            throw new RuntimeException("Cannot allocate less than already used days (" + balance.getUsedDays() + ")");
        }

        balance.setTotalAllocated(newTotalAllocated);
        balance.setRemainingDays(newTotalAllocated - balance.getUsedDays());
        leaveBalanceRepository.save(balance);
    }

    private LeaveBalanceDto mapToDto(LeaveBalance lb) {
        return new LeaveBalanceDto(
                lb.getId(),
                lb.getUser().getId(),
                lb.getUser().getFirstName() + " " + lb.getUser().getLastName(),
                lb.getLeaveType().getId(),
                lb.getLeaveType().getName(),
                lb.getYear(),
                lb.getTotalAllocated(),
                lb.getUsedDays(),
                lb.getRemainingDays()
        );
    }
}
