package springboot.leavemanagementsystem.service;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import springboot.leavemanagementsystem.dto.CreateLeaveTypeRequest;
import springboot.leavemanagementsystem.dto.LeaveTypeResponse;
import springboot.leavemanagementsystem.dto.UpdateLeaveTypeRequest;
import springboot.leavemanagementsystem.entity.LeaveBalance;
import springboot.leavemanagementsystem.entity.LeaveType;
import springboot.leavemanagementsystem.entity.LeaveTypeStatus;
import springboot.leavemanagementsystem.entity.User;
import springboot.leavemanagementsystem.repository.LeaveBalanceRepository;
import springboot.leavemanagementsystem.repository.LeaveTypeRepository;
import springboot.leavemanagementsystem.repository.UserRepository;

import java.time.Year;
import java.util.List;

@Service
public class LeaveTypeService {

    private final LeaveTypeRepository leaveTypeRepository;
    private final UserRepository userRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;

    public LeaveTypeService(
            LeaveTypeRepository leaveTypeRepository,
            UserRepository userRepository,
            LeaveBalanceRepository leaveBalanceRepository
    ) {
        this.leaveTypeRepository = leaveTypeRepository;
        this.userRepository = userRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
    }

    // CREATE
    @Transactional
    public LeaveTypeResponse createLeaveType(CreateLeaveTypeRequest request) {

        LeaveType leaveType = new LeaveType();
        leaveType.setName(request.getName().trim());
        leaveType.setMaxDaysPerYear(request.getMaxDaysPerYear());
        leaveType.setDescription(request.getDescription());
        leaveType.setCarryForwardAllowed(request.getCarryForwardAllowed());
        leaveType.setStatus(LeaveTypeStatus.ACTIVE);

        LeaveType savedLeaveType = leaveTypeRepository.save(leaveType);

        // FIX BUG 4: Only create balances for EMPLOYEE role users (not admin/manager)
        List<User> employees = userRepository.findAll().stream()
                .filter(u -> u.getRole().getName().equals("EMPLOYEE"))
                .toList();

        int currentYear = Year.now().getValue();

        for (User employee : employees) {
            LeaveBalance balance = new LeaveBalance(
                    employee,
                    savedLeaveType,
                    currentYear,
                    savedLeaveType.getMaxDaysPerYear()
            );
            leaveBalanceRepository.save(balance);
        }

        return mapToResponse(savedLeaveType);
    }

    // UPDATE
    @Transactional
    public LeaveTypeResponse updateLeaveType(Long id, UpdateLeaveTypeRequest request) {

        LeaveType leaveType = leaveTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Leave type not found"));

        leaveTypeRepository.findByNameIgnoreCase(request.getName())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new IllegalArgumentException("Leave type name already in use");
                    }
                });

        int oldMax = leaveType.getMaxDaysPerYear();
        int newMax = request.getMaxDaysPerYear();

        leaveType.setName(request.getName().trim());
        leaveType.setMaxDaysPerYear(newMax);
        leaveType.setDescription(request.getDescription());
        leaveType.setCarryForwardAllowed(request.getCarryForwardAllowed());

        LeaveType updated = leaveTypeRepository.save(leaveType);

        // FIX BUG 2: Propagate max days change to existing leave balances
        if (oldMax != newMax) {
            int currentYear = Year.now().getValue();
            List<LeaveBalance> balances = leaveBalanceRepository
                    .findByLeaveTypeAndYear(updated, currentYear);

            for (LeaveBalance balance : balances) {
                int diff = newMax - oldMax;
                int newTotal = balance.getTotalAllocated() + diff;
                if (newTotal < balance.getUsedDays()) {
                    newTotal = balance.getUsedDays(); // never go below used days
                }
                balance.setTotalAllocated(newTotal);
                balance.setRemainingDays(newTotal - balance.getUsedDays());
                leaveBalanceRepository.save(balance);
            }
        }

        return mapToResponse(updated);
    }

    // ENABLE
    @Transactional
    public void enableLeaveType(Long id) {
        LeaveType leaveType = leaveTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Leave type not found"));
        leaveType.setStatus(LeaveTypeStatus.ACTIVE);
    }

    // DISABLE
    @Transactional
    public void disableLeaveType(Long id) {
        LeaveType leaveType = leaveTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Leave type not found"));
        leaveType.setStatus(LeaveTypeStatus.INACTIVE);
    }

    // GET ALL (ADMIN)
    public List<LeaveTypeResponse> getAllLeaveTypes() {
        return leaveTypeRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // GET ACTIVE (EMPLOYEE)
    public List<LeaveTypeResponse> getActiveLeaveTypes() {
        return leaveTypeRepository.findByStatus(LeaveTypeStatus.ACTIVE)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // MAPPER
    private LeaveTypeResponse mapToResponse(LeaveType leaveType) {
        LeaveTypeResponse response = new LeaveTypeResponse();
        response.setId(leaveType.getId());
        response.setName(leaveType.getName());
        response.setMaxDaysPerYear(leaveType.getMaxDaysPerYear());
        response.setDescription(leaveType.getDescription());
        response.setCarryForwardAllowed(leaveType.getCarryForwardAllowed());
        response.setStatus(leaveType.getStatus().name());
        return response;
    }
}
