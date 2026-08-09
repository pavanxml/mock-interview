package com.interviewhub.api.booking;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewhub.api.common.ApiResponse;
import com.interviewhub.api.notification.NotificationController;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.OffsetDateTime;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Locale;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/bookings")
public class BookingController {
  private static final ObjectMapper JSON = new ObjectMapper();
  private static final Path STATE_DIR = Path.of(System.getProperty("java.io.tmpdir"), "interviewhub-state");
  private static final Path PENDING_REQUESTS_STATE_FILE = STATE_DIR.resolve("booking-pending-requests.json");
  private static final Path ACCEPTED_INTERVIEWS_STATE_FILE = STATE_DIR.resolve("booking-accepted-interviews.json");
  private static final Path STUDENT_UPCOMING_STATE_FILE = STATE_DIR.resolve("student-upcoming-bookings.json");
  private static final Path STUDENT_HISTORY_STATE_FILE = STATE_DIR.resolve("student-history-bookings.json");
  private static final Path FEEDBACK_STATE_FILE = STATE_DIR.resolve("student-feedback-reports.json");

  private static final List<InterviewRequest> PENDING_REQUESTS = new ArrayList<>();
  private static final List<InterviewerBooking> ACCEPTED_INTERVIEWS = new ArrayList<>();
  private static final List<StudentBookingCard> STUDENT_UPCOMING = new ArrayList<>();
  private static final List<StudentHistoryCard> STUDENT_HISTORY = new ArrayList<>();
  private static final List<FeedbackReport> FEEDBACK_REPORTS = new ArrayList<>();

  static {
    loadBookingState();
  }

  @GetMapping("/student/overview")
  public synchronized ApiResponse<StudentOverview> studentOverview(@RequestParam(value = "email", required = false) String email) {
    List<StudentBookingCard> upcoming = filterUpcomingForStudent(email);
    List<StudentHistoryCard> history = filterHistoryForStudent(email);
    BigDecimal totalSpent = upcoming.stream().map(StudentBookingCard::amount).reduce(BigDecimal.ZERO, BigDecimal::add)
        .add(history.stream().map(StudentHistoryCard::amount).reduce(BigDecimal.ZERO, BigDecimal::add));
    List<FeedbackReport> feedback = filterFeedbackForStudent(email);
    return ApiResponse.ok(new StudentOverview(List.copyOf(upcoming), List.copyOf(history), List.copyOf(feedback), totalSpent));
  }

  @PostMapping("/student/request")
  @ResponseStatus(HttpStatus.CREATED)
  public synchronized ApiResponse<StudentBookingCard> createStudentRequest(@Valid @RequestBody StudentBookingRequest request) {
    String bookingId = request.bookingId() == null || request.bookingId().isBlank() ? "IH-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase() : request.bookingId();
    BigDecimal price = request.amount() == null ? BigDecimal.ZERO : request.amount();
    BigDecimal interviewerAmount = price.multiply(new BigDecimal("0.90")).setScale(0, RoundingMode.HALF_UP);
    String duration = request.duration() == null || request.duration().isBlank() ? request.durationMinutes() + " min" : request.duration();
    String time = request.time() == null || request.time().isBlank() ? "TBD" : request.time();
    String date = request.date() == null || request.date().isBlank() ? "TBD" : request.date();

    InterviewRequest interviewRequest = new InterviewRequest(bookingId, request.studentName(), request.college(), request.technology(), duration, date, time.replace(" IST", ""), interviewerAmount, "just now", request.resumeUrl() == null || request.resumeUrl().isBlank() ? "#" : request.resumeUrl());
    PENDING_REQUESTS.removeIf(item -> item.id().equals(bookingId));
    PENDING_REQUESTS.add(0, interviewRequest);

    StudentBookingCard studentCard = new StudentBookingCard(bookingId, request.studentEmail(), request.technology(), "Pending interviewer", "InterviewHub", "Awaiting acceptance", date, time, duration, "", "pending", price);
    STUDENT_UPCOMING.removeIf(item -> item.id().equals(bookingId));
    STUDENT_UPCOMING.add(0, studentCard);
    persistBookingState();

    NotificationController.add("student", "payment", "Payment Successful", "Payment received for " + request.technology() + ". Booking request " + bookingId + " was created.", "/student-dashboard?tab=payments", "View payment");
    NotificationController.add("student", "booking", "Booking Request Created", "Your " + request.technology() + " request was sent to available interviewers. You will receive a message when an interviewer accepts.", "/student-dashboard?tab=upcoming", "Track booking");
    NotificationController.add("interviewer", "booking", "New Interview Request", request.studentName() + " from " + request.college() + " requested a " + request.technology() + " interview (" + duration + ").", "/interviewer-portal?tab=requests", "View request");

    return ApiResponse.created(studentCard, "Booking request sent to interviewers.");
  }

  public static synchronized List<InterviewRequest> pendingRequests() {
    return List.copyOf(PENDING_REQUESTS);
  }

  public static synchronized List<InterviewRequest> pendingRequests(List<String> expertise) {
    List<String> normalizedExpertise = expertise == null ? List.of() : expertise.stream()
        .filter(item -> item != null && !item.isBlank())
        .toList();
    if (normalizedExpertise.isEmpty()) return List.copyOf(PENDING_REQUESTS);
    return PENDING_REQUESTS.stream()
        .filter(request -> normalizedExpertise.stream().anyMatch(skill -> technologyMatches(request.technology(), skill)))
        .toList();
  }

  public static synchronized List<InterviewerBooking> acceptedInterviews() {
    return List.copyOf(ACCEPTED_INTERVIEWS);
  }

  public static synchronized List<InterviewerBooking> acceptedInterviews(String interviewerEmail) {
    if (interviewerEmail == null || interviewerEmail.isBlank()) return List.copyOf(ACCEPTED_INTERVIEWS);
    return ACCEPTED_INTERVIEWS.stream()
        .filter(item -> item.interviewerEmail() != null && item.interviewerEmail().equalsIgnoreCase(interviewerEmail))
        .toList();
  }

  public static synchronized boolean acceptRequest(String requestId) {
    return acceptRequest(requestId, "", "Accepted interviewer", "InterviewHub", "Interviewer");
  }

  public static synchronized boolean acceptRequest(String requestId, String interviewerEmail, String interviewerName, String company, String designation) {
    InterviewRequest request = PENDING_REQUESTS.stream().filter(item -> item.id().equals(requestId)).findFirst().orElse(null);
    if (request == null) return false;
    PENDING_REQUESTS.removeIf(item -> item.id().equals(requestId));
    String startsAt = request.preferredDate() + " " + request.preferredTime();
    String cleanName = interviewerName == null || interviewerName.isBlank() ? "Accepted interviewer" : interviewerName;
    String cleanCompany = company == null || company.isBlank() ? "InterviewHub" : company;
    String cleanDesignation = designation == null || designation.isBlank() ? "Interviewer" : designation;
    String cleanEmail = interviewerEmail == null ? "" : interviewerEmail;
    ACCEPTED_INTERVIEWS.add(0, new InterviewerBooking(UUID.nameUUIDFromBytes(requestId.getBytes()), requestId, request.student(), request.technology(), "accepted", startsAt, "", request.duration(), cleanEmail, cleanName, cleanCompany, cleanDesignation));
    STUDENT_UPCOMING.replaceAll(item -> item.id().equals(requestId)
        ? new StudentBookingCard(item.id(), item.studentEmail(), item.technology(), cleanName, cleanCompany, cleanDesignation, item.date(), item.time(), item.duration(), "", "scheduled", item.amount())
        : item);
    persistBookingState();
    NotificationController.add("student", "interview", "Interviewer Accepted", cleanName + " accepted your " + request.technology() + " request. Meeting link will be shared soon.", "/student-dashboard?tab=upcoming", "View booking");
    NotificationController.add("interviewer", "booking", "Request Accepted", "You accepted " + request.student() + " for " + request.technology() + ". Schedule the interview and send the meeting link.", "/interviewer-portal?tab=accepted", "Schedule");
    return true;
  }

  public static synchronized boolean declineRequest(String requestId) {
    InterviewRequest request = PENDING_REQUESTS.stream().filter(item -> item.id().equals(requestId)).findFirst().orElse(null);
    boolean removed = PENDING_REQUESTS.removeIf(item -> item.id().equals(requestId));
    if (removed) {
      STUDENT_UPCOMING.replaceAll(item -> item.id().equals(requestId)
          ? new StudentBookingCard(item.id(), item.studentEmail(), item.technology(), "Declined", "InterviewHub", "Please book another slot", item.date(), item.time(), item.duration(), "", "declined", item.amount())
          : item);
      persistBookingState();
      NotificationController.add("student", "booking", "Interview Request Declined", "Your " + (request == null ? "interview" : request.technology()) + " request was declined. Please book another slot or wait for another interviewer.", "/student-interview-booking", "Book again");
    }
    return removed;
  }

  public static synchronized boolean confirmInterview(String requestId, String meetingUrl, String message) {
    InterviewerBooking booking = ACCEPTED_INTERVIEWS.stream().filter(item -> item.bookingId().equals(requestId)).findFirst().orElse(null);
    if (booking == null || meetingUrl == null || meetingUrl.isBlank()) return false;
    ACCEPTED_INTERVIEWS.replaceAll(item -> item.bookingId().equals(requestId)
        ? new InterviewerBooking(item.id(), item.bookingId(), item.studentName(), item.technology(), "confirmed", item.startsAt(), meetingUrl, item.duration(), item.interviewerEmail(), item.interviewerName(), item.interviewerCompany(), item.interviewerDesignation())
        : item);
    STUDENT_UPCOMING.replaceAll(item -> item.id().equals(requestId)
        ? new StudentBookingCard(item.id(), item.studentEmail(), item.technology(), booking.interviewerName(), booking.interviewerCompany(), booking.interviewerDesignation(), item.date(), item.time(), item.duration(), meetingUrl, "confirmed", item.amount())
        : item);
    persistBookingState();
    NotificationController.add("student", "interview", "Meeting Link Received", (message == null || message.isBlank() ? "Your interview meeting link is ready." : message) + " Link: " + meetingUrl, "/student-dashboard?tab=upcoming", "Join interview");
    return true;
  }
  public static synchronized boolean completeInterview(String requestId) {
    InterviewerBooking booking = ACCEPTED_INTERVIEWS.stream().filter(item -> item.bookingId().equals(requestId)).findFirst().orElse(null);
    if (booking == null) return false;
    ACCEPTED_INTERVIEWS.replaceAll(item -> item.bookingId().equals(requestId)
        ? new InterviewerBooking(item.id(), item.bookingId(), item.studentName(), item.technology(), "completed", item.startsAt(), item.meetingUrl(), item.duration(), item.interviewerEmail(), item.interviewerName(), item.interviewerCompany(), item.interviewerDesignation())
        : item);
    StudentBookingCard studentCard = STUDENT_UPCOMING.stream().filter(item -> item.id().equals(requestId)).findFirst().orElse(null);
    if (studentCard != null) {
      STUDENT_UPCOMING.removeIf(item -> item.id().equals(requestId));
      STUDENT_HISTORY.removeIf(item -> item.id().equals(requestId));
      STUDENT_HISTORY.add(0, new StudentHistoryCard(studentCard.id(), studentCard.studentEmail(), studentCard.technology(), booking.interviewerName(), booking.interviewerCompany(), studentCard.date(), "completed", studentCard.amount(), null));
      NotificationController.add("student", "interview", "Interview Completed", "Your " + studentCard.technology() + " interview is marked completed. Feedback will be shared after the interviewer submits the report.", "/student-dashboard?tab=history", "View history");
    }
    persistBookingState();
    return true;
  }

  public static synchronized boolean publishFeedback(String bookingId, FeedbackPayload feedback) {
    InterviewerBooking booking = ACCEPTED_INTERVIEWS.stream().filter(item -> item.bookingId().equals(bookingId)).findFirst().orElse(null);
    if (booking == null) return false;
    StudentHistoryCard history = STUDENT_HISTORY.stream().filter(item -> item.id().equals(bookingId)).findFirst().orElse(null);
    StudentBookingCard upcoming = STUDENT_UPCOMING.stream().filter(item -> item.id().equals(bookingId)).findFirst().orElse(null);
    String studentEmail = history != null ? history.studentEmail() : upcoming == null ? "" : upcoming.studentEmail();
    BigDecimal amount = history != null ? history.amount() : upcoming == null ? BigDecimal.ZERO : upcoming.amount();
    String date = history != null ? history.date() : upcoming == null ? LocalDate.now().toString() : upcoming.date();
    if (history == null && upcoming != null) {
      STUDENT_UPCOMING.removeIf(item -> item.id().equals(bookingId));
      STUDENT_HISTORY.add(0, new StudentHistoryCard(upcoming.id(), upcoming.studentEmail(), upcoming.technology(), booking.interviewerName(), booking.interviewerCompany(), upcoming.date(), "completed", upcoming.amount(), feedback.overallRating()));
    } else {
      STUDENT_HISTORY.replaceAll(item -> item.id().equals(bookingId)
          ? new StudentHistoryCard(item.id(), item.studentEmail(), item.technology(), item.interviewer(), item.company(), item.date(), "completed", item.amount(), feedback.overallRating())
          : item);
    }
    FEEDBACK_REPORTS.removeIf(item -> item.bookingId().equals(bookingId));
    FEEDBACK_REPORTS.add(0, new FeedbackReport(
        "FB-" + bookingId,
        bookingId,
        studentEmail,
        booking.technology(),
        booking.interviewerName(),
        booking.interviewerCompany(),
        date,
        feedback.technical(),
        feedback.problemSolving(),
        feedback.coding(),
        feedback.communication(),
        feedback.confidence(),
        feedback.overallRating(),
        feedback.hiringReadiness(),
        feedback.strengths(),
        feedback.improvements(),
        feedback.suggestions(),
        amount));
    ACCEPTED_INTERVIEWS.replaceAll(item -> item.bookingId().equals(bookingId)
        ? new InterviewerBooking(item.id(), item.bookingId(), item.studentName(), item.technology(), "feedback_submitted", item.startsAt(), item.meetingUrl(), item.duration(), item.interviewerEmail(), item.interviewerName(), item.interviewerCompany(), item.interviewerDesignation())
        : item);
    NotificationController.add("student", "feedback", "Feedback Report Ready", "Your " + booking.technology() + " feedback report is ready to view and download.", "/student-dashboard?tab=feedback", "View feedback");
    persistBookingState();
    return true;
  }


  private static List<StudentBookingCard> filterUpcomingForStudent(String email) {
    if (email == null || email.isBlank()) return List.copyOf(STUDENT_UPCOMING);
    return STUDENT_UPCOMING.stream()
        .filter(item -> item.studentEmail() != null && item.studentEmail().equalsIgnoreCase(email))
        .toList();
  }

  private static List<StudentHistoryCard> filterHistoryForStudent(String email) {
    if (email == null || email.isBlank()) return List.copyOf(STUDENT_HISTORY);
    return STUDENT_HISTORY.stream()
        .filter(item -> item.studentEmail() != null && item.studentEmail().equalsIgnoreCase(email))
        .toList();
  }
  private static List<FeedbackReport> filterFeedbackForStudent(String email) {
    if (email == null || email.isBlank()) return List.copyOf(FEEDBACK_REPORTS);
    return FEEDBACK_REPORTS.stream()
        .filter(item -> item.studentEmail() != null && item.studentEmail().equalsIgnoreCase(email))
        .toList();
  }

  private static boolean technologyMatches(String requestedTechnology, String interviewerExpertise) {
    String requested = normalizeTechnology(requestedTechnology);
    String expertise = normalizeTechnology(interviewerExpertise);
    if (requested.isBlank() || expertise.isBlank()) return false;
    if (requested.contains(expertise) || expertise.contains(requested)) return true;
    return requested.contains("fullstack") && expertise.contains("fullstack");
  }

  private static String normalizeTechnology(String value) {
    return value == null ? "" : value.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
  }
  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ApiResponse<BookingDto> createBooking(@Valid @RequestBody CreateBookingRequest request) {
    return ApiResponse.created(new BookingDto(UUID.randomUUID(), request.studentId(), request.interviewerId(), request.technology(), request.startsAt(), request.durationMinutes(), request.price(), "PAYMENT_PENDING", null), "Booking reserved for payment.");
  }

  @GetMapping("/student/{studentId}")
  public ApiResponse<List<BookingDto>> studentBookings(@PathVariable UUID studentId) {
    return ApiResponse.ok(List.of());
  }

  @PostMapping("/{bookingId}/payments")
  public ApiResponse<PaymentIntent> createPayment(@PathVariable UUID bookingId, @Valid @RequestBody PaymentRequest request) {
    return ApiResponse.ok(new PaymentIntent(UUID.randomUUID(), bookingId, request.amount(), "INR", "PAYMENT_PROVIDER_ORDER_ID", "CREATED"));
  }

  private static void loadBookingState() {
    try {
      if (Files.exists(PENDING_REQUESTS_STATE_FILE)) {
        PENDING_REQUESTS.clear();
        PENDING_REQUESTS.addAll(JSON.readValue(PENDING_REQUESTS_STATE_FILE.toFile(), new TypeReference<List<InterviewRequest>>() {}));
      }
      if (Files.exists(ACCEPTED_INTERVIEWS_STATE_FILE)) {
        ACCEPTED_INTERVIEWS.clear();
        ACCEPTED_INTERVIEWS.addAll(JSON.readValue(ACCEPTED_INTERVIEWS_STATE_FILE.toFile(), new TypeReference<List<InterviewerBooking>>() {}));
      }
      if (Files.exists(STUDENT_UPCOMING_STATE_FILE)) {
        STUDENT_UPCOMING.clear();
        STUDENT_UPCOMING.addAll(JSON.readValue(STUDENT_UPCOMING_STATE_FILE.toFile(), new TypeReference<List<StudentBookingCard>>() {}));
      }
      if (Files.exists(STUDENT_HISTORY_STATE_FILE)) {
        STUDENT_HISTORY.clear();
        STUDENT_HISTORY.addAll(JSON.readValue(STUDENT_HISTORY_STATE_FILE.toFile(), new TypeReference<List<StudentHistoryCard>>() {}));
      }
      if (Files.exists(FEEDBACK_STATE_FILE)) {
        FEEDBACK_REPORTS.clear();
        FEEDBACK_REPORTS.addAll(JSON.readValue(FEEDBACK_STATE_FILE.toFile(), new TypeReference<List<FeedbackReport>>() {}));
      }
    } catch (IOException ignored) {
      // Keep in-memory state if local files cannot be read.
    }
  }

  private static void persistBookingState() {
    try {
      Files.createDirectories(STATE_DIR);
      JSON.writerWithDefaultPrettyPrinter().writeValue(PENDING_REQUESTS_STATE_FILE.toFile(), PENDING_REQUESTS);
      JSON.writerWithDefaultPrettyPrinter().writeValue(ACCEPTED_INTERVIEWS_STATE_FILE.toFile(), ACCEPTED_INTERVIEWS);
      JSON.writerWithDefaultPrettyPrinter().writeValue(STUDENT_UPCOMING_STATE_FILE.toFile(), STUDENT_UPCOMING);
      JSON.writerWithDefaultPrettyPrinter().writeValue(STUDENT_HISTORY_STATE_FILE.toFile(), STUDENT_HISTORY);
      JSON.writerWithDefaultPrettyPrinter().writeValue(FEEDBACK_STATE_FILE.toFile(), FEEDBACK_REPORTS);
    } catch (IOException ignored) {
      // The app can continue with in-memory bookings during local development.
    }
  }

  public record StudentBookingRequest(@NotBlank String bookingId, @NotBlank String studentName, String studentEmail, @NotBlank String college, @NotBlank String technology, String duration, int durationMinutes, String date, String time, @NotNull BigDecimal amount, String resumeUrl) {}
  public record StudentOverview(List<StudentBookingCard> upcoming, List<StudentHistoryCard> history, List<FeedbackReport> feedback, BigDecimal totalSpent) {}
  public record StudentBookingCard(String id, String studentEmail, String technology, String interviewer, String company, String designation, String date, String time, String duration, String meetLink, String status, BigDecimal amount) {}
  public record StudentHistoryCard(String id, String studentEmail, String technology, String interviewer, String company, String date, String status, BigDecimal amount, Integer rating) {}
  public record InterviewRequest(String id, String student, String college, String technology, String duration, String preferredDate, String preferredTime, BigDecimal amount, String postedAt, String resumeUrl) {}
  public record InterviewerBooking(UUID id, String bookingId, String studentName, String technology, String status, String startsAt, String meetingUrl, String duration, String interviewerEmail, String interviewerName, String interviewerCompany, String interviewerDesignation) {}
  public record FeedbackPayload(int technical, int problemSolving, int coding, int communication, int confidence, int overallRating, String hiringReadiness, String strengths, String improvements, String suggestions) {}
  public record FeedbackReport(String id, String bookingId, String studentEmail, String technology, String interviewer, String company, String date, int technical, int problemSolving, int coding, int communication, int confidence, int overallRating, String hiringReadiness, String strengths, String improvements, String suggestions, BigDecimal amount) {}
  public record CreateBookingRequest(@NotNull UUID studentId, @NotNull UUID interviewerId, @NotBlank String technology, @NotNull OffsetDateTime startsAt, int durationMinutes, @NotNull BigDecimal price) {}
  public record BookingDto(UUID id, UUID studentId, UUID interviewerId, String technology, OffsetDateTime startsAt, int durationMinutes, BigDecimal price, String status, String meetingUrl) {}
  public record PaymentRequest(@NotNull BigDecimal amount, @NotBlank String provider) {}
  public record PaymentIntent(UUID paymentId, UUID bookingId, BigDecimal amount, String currency, String providerOrderId, String status) {}
}