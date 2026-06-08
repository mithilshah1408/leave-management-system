package springboot.leavemanagementsystem.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import springboot.leavemanagementsystem.dto.AdjustBalanceRequest;
import springboot.leavemanagementsystem.dto.LeaveBalanceDto;
import springboot.leavemanagementsystem.service.LeaveBalanceService;

import java.util.List;

@RestController
public class LeaveBalanceController {

    private final LeaveBalanceService leaveBalanceService;

    public LeaveBalanceController(LeaveBalanceService leaveBalanceService) {
        this.leaveBalanceService = leaveBalanceService;
    }

    // ADMIN - view all balances
    @GetMapping("/api/admin/leave-balances")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<LeaveBalanceDto> getBalances(
            @RequestParam(required = false) Long userId,
            @RequestParam Integer year,
            Pageable pageable
    ) {
        return leaveBalanceService.getBalances(userId, year, pageable);
    }

    @PostMapping("/api/admin/leave-balances/initialize")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> initializeYear(@RequestParam Integer year) {
        leaveBalanceService.initializeYear(year);
        return ResponseEntity.ok("Leave balances initialized for year " + year);
    }

    @PutMapping("/api/admin/leave-balances/{id}/adjust")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> adjustBalance(
            @PathVariable Long id,
            @RequestBody AdjustBalanceRequest request
    ) {
        leaveBalanceService.adjustBalance(id, request.getNewTotalAllocated());
        return ResponseEntity.ok("Leave balance adjusted successfully");
    }

    @GetMapping("/api/leave-balances/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public List<LeaveBalanceDto> getMyBalances(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return leaveBalanceService.getMyBalances(userDetails.getUsername());
    }
}
