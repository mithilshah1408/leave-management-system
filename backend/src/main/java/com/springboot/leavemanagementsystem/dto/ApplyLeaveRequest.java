package springboot.leavemanagementsystem.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class ApplyLeaveRequest {

    @NotNull
    private Long leaveTypeId;

    @NotNull
    // Removed @FutureOrPresent — allows backdating leave requests
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    private String reason;

    public Long getLeaveTypeId() { return leaveTypeId; }
    public void setLeaveTypeId(Long leaveTypeId) { this.leaveTypeId = leaveTypeId; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
