package springboot.leavemanagementsystem.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import springboot.leavemanagementsystem.dto.CreateUserRequest;
import springboot.leavemanagementsystem.dto.UpdateUserRequest;
import springboot.leavemanagementsystem.dto.UserResponse;
import springboot.leavemanagementsystem.entity.*;
import springboot.leavemanagementsystem.repository.*;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class AdminUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;

    public AdminUserService(UserRepository userRepository,
                            RoleRepository roleRepository,
                            PasswordEncoder passwordEncoder,
                            LeaveTypeRepository leaveTypeRepository,
                            LeaveBalanceRepository leaveBalanceRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.leaveTypeRepository = leaveTypeRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
    }

    private UserResponse mapToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().getName());
        response.setStatus(user.getStatus().name());
        response.setJoiningDate(user.getJoiningDate());

        if (user.getManager() != null) {
            response.setManagerId(user.getManager().getId());
            response.setManagerName(
                    user.getManager().getFirstName() + " " +
                            user.getManager().getLastName()
            );
        }
        return response;
    }

    // CREATE USER
    public UserResponse createUser(CreateUserRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        String roleName = role.getName();
        User manager = null;

        if (request.getManagerId() != null) {
            manager = userRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new RuntimeException("Manager not found"));

            if (!manager.getRole().getName().equals("MANAGER")) {
                throw new RuntimeException("Assigned manager must have MANAGER role");
            }

            if (manager.getStatus() != UserStatus.ACTIVE) {
                throw new RuntimeException("Assigned manager must be ACTIVE");
            }
        }

        if (roleName.equals("EMPLOYEE") && manager == null) {
            throw new RuntimeException("Employee must have a manager");
        }

        if (roleName.equals("ADMIN") && manager != null) {
            throw new RuntimeException("Admin cannot have a manager");
        }

        User user = new User(
                request.getFirstName(),
                request.getLastName(),
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                role,
                UserStatus.ACTIVE,
                request.getJoiningDate()
        );

        user.setManager(manager);
        User savedUser = userRepository.save(user);

        // Initialize Leave Balance ONLY for EMPLOYEE
        if (roleName.equals("EMPLOYEE")) {
            initializeLeaveBalances(savedUser);
        }

        return mapToResponse(savedUser);
    }

    private void initializeLeaveBalances(User employee) {
        int currentYear = LocalDate.now().getYear();
        List<LeaveType> activeLeaveTypes = leaveTypeRepository.findByStatus(LeaveTypeStatus.ACTIVE);

        for (LeaveType leaveType : activeLeaveTypes) {
            // FIX BUG 1: Check if balance already exists before creating
            leaveBalanceRepository
                    .findByUserAndLeaveTypeAndYear(employee, leaveType, currentYear)
                    .orElseGet(() -> {
                        LeaveBalance balance = new LeaveBalance(
                                employee, leaveType, currentYear,
                                leaveType.getMaxDaysPerYear()
                        );
                        return leaveBalanceRepository.save(balance);
                    });
        }
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToResponse(user);
    }

    public Page<UserResponse> getAllUsers(Pageable pageable) {
        Page<User> userPage = userRepository.findAll(pageable);
        return userPage.map(this::mapToResponse);
    }

    public UserResponse updateUser(Long id, UpdateUserRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // EMAIL VALIDATION
        if (request.getEmail() != null) {
            if (userRepository.findByEmail(request.getEmail())
                    .filter(existing -> !existing.getId().equals(id))
                    .isPresent()) {
                throw new RuntimeException("Email already exists");
            }
            user.setEmail(request.getEmail());
        }

        // USERNAME VALIDATION
        if (request.getUsername() != null) {
            if (userRepository.findByUsername(request.getUsername())
                    .filter(existing -> !existing.getId().equals(id))
                    .isPresent()) {
                throw new RuntimeException("Username already exists");
            }
            user.setUsername(request.getUsername());
        }

        // ROLE
        if (request.getRoleId() != null) {
            Role role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new RuntimeException("Role not found"));
            user.setRole(role);
        }

        // FIX BUG 1: Only update manager if managerId is explicitly provided
        // If not provided, keep the existing manager — don't require it every time
        if (request.getManagerId() != null) {

            if (request.getManagerId().equals(id)) {
                throw new RuntimeException("User cannot be their own manager");
            }

            User manager = userRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new RuntimeException("Manager not found"));

            if (!manager.getRole().getName().equals("MANAGER")) {
                throw new RuntimeException("Assigned manager must have MANAGER role");
            }

            if (manager.getStatus() != UserStatus.ACTIVE) {
                throw new RuntimeException("Assigned manager must be ACTIVE");
            }

            user.setManager(manager);
        }

        // BASIC FIELDS
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getJoiningDate() != null) user.setJoiningDate(request.getJoiningDate());

        return mapToResponse(userRepository.save(user));
    }

    public UserResponse toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Protect admin accounts from being deactivated
        if (user.getRole().getName().equals("ADMIN")) {
            throw new RuntimeException("Admin accounts cannot be deactivated.");
        }

        if (user.getStatus() == UserStatus.ACTIVE) {
            user.setStatus(UserStatus.INACTIVE);
        } else {
            user.setStatus(UserStatus.ACTIVE);
        }

        return mapToResponse(userRepository.save(user));
    }
}
