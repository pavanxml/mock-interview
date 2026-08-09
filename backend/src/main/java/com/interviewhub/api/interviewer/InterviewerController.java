package com.interviewhub.api.interviewer;

import com.interviewhub.api.admin.AdminController;
import com.interviewhub.api.booking.BookingController;
import com.interviewhub.api.common.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/interviewer")
public class InterviewerController {
  @GetMapping("/portal")
  public synchronized ApiResponse<InterviewerPortalOverview> portal(@RequestParam(value = "email", required = false) String email, @RequestParam(value = "expertise", required = false) String expertise) {
    List<String> skills = expertise == null || expertise.isBlank() ? List.of() : Arrays.stream(expertise.split(",")).map(String::trim).filter(item -> !item.isBlank()).toList();
    if (skills.isEmpty() && email != null && !email.isBlank()) {
      AdminController.ApprovedInterviewerProfile profile = AdminController.approvedProfile(email);
      if (profile != null && profile.expertise() != null) skills = profile.expertise();
    }
    return ApiResponse.ok(new InterviewerPortalOverview(
        BookingController.pendingRequests(skills),
        BookingController.acceptedInterviews(email),
        BigDecimal.ZERO,
        "0.0"));
  }

  @PostMapping("/requests/{requestId}/accept")
  public synchronized ApiResponse<ModerationResult> acceptRequest(@PathVariable("requestId") String requestId, @RequestBody(required = false) AcceptRequest request) {
    AcceptRequest payload = request == null ? new AcceptRequest("", "", "", "") : request;
    boolean updated = BookingController.acceptRequest(requestId, payload.interviewerEmail(), payload.interviewerName(), payload.company(), payload.designation());
    return ApiResponse.ok(new ModerationResult(requestId, updated ? "ACCEPTED" : "NOT_FOUND"));
  }

  @PostMapping("/requests/{requestId}/decline")
  public synchronized ApiResponse<ModerationResult> declineRequest(@PathVariable("requestId") String requestId) {
    boolean updated = BookingController.declineRequest(requestId);
    return ApiResponse.ok(new ModerationResult(requestId, updated ? "DECLINED" : "NOT_FOUND"));
  }

  @PostMapping("/requests/{requestId}/confirm")
  public synchronized ApiResponse<ModerationResult> confirmInterview(@PathVariable("requestId") String requestId, @Valid @RequestBody MeetingConfirmation request) {
    boolean updated = BookingController.confirmInterview(requestId, request.meetingUrl(), request.message());
    return ApiResponse.ok(new ModerationResult(requestId, updated ? "CONFIRMED" : "NOT_FOUND"));
  }

  @PostMapping("/requests/{requestId}/complete")
  public synchronized ApiResponse<ModerationResult> completeInterview(@PathVariable("requestId") String requestId) {
    boolean updated = BookingController.completeInterview(requestId);
    return ApiResponse.ok(new ModerationResult(requestId, updated ? "COMPLETED" : "NOT_FOUND"));
  }

  @GetMapping("/{interviewerId}/bookings")
  public ApiResponse<List<BookingController.InterviewerBooking>> bookings(@PathVariable UUID interviewerId) {
    return ApiResponse.ok(List.of());
  }

  @PutMapping("/{interviewerId}/availability")
  public ApiResponse<AvailabilityUpdate> updateAvailability(@PathVariable UUID interviewerId, @Valid @RequestBody AvailabilityUpdate request) {
    return ApiResponse.ok(request);
  }

  @PostMapping("/bookings/{bookingId}/feedback")
  @ResponseStatus(HttpStatus.CREATED)
  public synchronized ApiResponse<FeedbackResult> submitFeedback(@PathVariable("bookingId") String bookingId, @Valid @RequestBody FeedbackRequest request) {
    boolean updated = BookingController.publishFeedback(bookingId, new BookingController.FeedbackPayload(
        request.technical(),
        request.problemSolving(),
        request.coding(),
        request.communication(),
        request.confidence(),
        request.overallRating(),
        request.hiringReadiness(),
        request.strengths(),
        request.improvements(),
        request.suggestions()));
    return ApiResponse.created(new FeedbackResult(UUID.randomUUID(), bookingId, updated ? "SUBMITTED" : "NOT_FOUND"), "Feedback published to student dashboard and notification sent.");
  }

  @PostMapping("/{interviewerId}/withdrawals")
  @ResponseStatus(HttpStatus.CREATED)
  public ApiResponse<WithdrawalResult> requestWithdrawal(@PathVariable UUID interviewerId, @Valid @RequestBody WithdrawalRequest request) {
    return ApiResponse.created(new WithdrawalResult(UUID.randomUUID(), interviewerId, request.amount(), "PENDING_ADMIN_REVIEW"), "Withdrawal request queued for admin approval.");
  }

  public record InterviewerPortalOverview(List<BookingController.InterviewRequest> requests, List<BookingController.InterviewerBooking> interviews, BigDecimal walletBalance, String rating) {}
  public record ModerationResult(String targetId, String status) {}
  public record MeetingConfirmation(@NotBlank String meetingUrl, String message) {}
  public record AcceptRequest(String interviewerEmail, String interviewerName, String company, String designation) {}
  public record AvailabilityUpdate(@NotNull List<LocalDate> dates, @NotNull List<String> timeSlots, boolean acceptingBookings) {}
  public record FeedbackRequest(int technical, int problemSolving, int coding, int communication, int confidence, int overallRating, @NotBlank String strengths, @NotBlank String improvements, String suggestions, @NotBlank String hiringReadiness) {}
  public record FeedbackResult(UUID feedbackId, String bookingId, String status) {}
  public record WithdrawalRequest(@NotNull BigDecimal amount, @NotBlank String payoutMethod) {}
  public record WithdrawalResult(UUID withdrawalId, UUID interviewerId, BigDecimal amount, String status) {}
}