package com.interviewhub.api.admin;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewhub.api.common.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {
  public record ApprovedInterviewerProfile(String name, String email, String company, String designation, List<String> expertise) {}

  private static final ObjectMapper JSON = new ObjectMapper();
  private static final Path STATE_DIR = Path.of(System.getProperty("java.io.tmpdir"), "interviewhub-state");
  private static final Path PENDING_STATE_FILE = STATE_DIR.resolve("pending-interviewers.json");
  private static final Path APPROVED_STATE_FILE = STATE_DIR.resolve("approved-interviewers.json");
  private static final Path REJECTED_STATE_FILE = STATE_DIR.resolve("rejected-interviewers.json");
  private static final Path CREDENTIALS_STATE_FILE = STATE_DIR.resolve("interviewer-credentials.json");

  private static final Map<String, ApprovedInterviewerProfile> APPROVED_INTERVIEWERS = new HashMap<>();
  private static final Set<String> REJECTED_INTERVIEWERS = new HashSet<>();
  private static final Map<String, String> INTERVIEWER_PASSWORDS = new HashMap<>();

  public static synchronized boolean isApprovedInterviewer(String email) {
    return APPROVED_INTERVIEWERS.containsKey(email.toLowerCase());
  }

  public static synchronized boolean isRejectedInterviewer(String email) {
    return REJECTED_INTERVIEWERS.contains(email.toLowerCase());
  }

  public static synchronized ApprovedInterviewerProfile approvedProfile(String email) {
    return APPROVED_INTERVIEWERS.get(email.toLowerCase());
  }

  public static synchronized void approveEmail(String email, String name, String company, String designation) {
    approveEmail(email, name, company, designation, List.of());
  }

  public static synchronized void approveEmail(String email, String name, String company, String designation, List<String> expertise) {
    APPROVED_INTERVIEWERS.put(email.toLowerCase(), new ApprovedInterviewerProfile(name, email, company, designation, expertise == null ? List.of() : List.copyOf(expertise)));
    REJECTED_INTERVIEWERS.remove(email.toLowerCase());
  }

    public static synchronized void rejectEmail(String email) {
    APPROVED_INTERVIEWERS.remove(email.toLowerCase());
    REJECTED_INTERVIEWERS.add(email.toLowerCase());
  }

  public static synchronized void registerInterviewerCredentials(String email, String password) {
    INTERVIEWER_PASSWORDS.put(email.toLowerCase(), password);
    persistState();
  }

  public static synchronized boolean hasInterviewerCredentials(String email) {
    return INTERVIEWER_PASSWORDS.containsKey(email.toLowerCase());
  }

  public static synchronized boolean passwordMatches(String email, String password) {
    return password.equals(INTERVIEWER_PASSWORDS.get(email.toLowerCase()));
  }

  public static synchronized PendingInterviewer addPendingInterviewer(String name, String email, String company, String designation, String experience, String linkedinUrl, List<String> expertise, boolean resumeUploaded, boolean idCardUploaded) {
    String normalizedEmail = email.toLowerCase();
    pendingInterviewers.removeIf(i -> i.email().equalsIgnoreCase(normalizedEmail));
    PendingInterviewer applicant = new PendingInterviewer(
        UUID.randomUUID(),
        name,
        normalizedEmail,
        company,
        designation,
        experience,
        linkedinUrl,
        List.copyOf(expertise),
        linkedinUrl != null && !linkedinUrl.isBlank(),
        resumeUploaded,
        idCardUploaded,
        "now",
        0);
    pendingInterviewers.add(0, applicant);
    persistState();
    return applicant;
  }
  private static final List<PendingInterviewer> pendingInterviewers = new ArrayList<>();

  static {
    loadState();
  }

  private final List<WithdrawalReview> withdrawals = new ArrayList<>(List.of(
      new WithdrawalReview(UUID.fromString("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"), "Pradeep Sharma", new BigDecimal("12400"), "UPI", "pradeep@paytm", "13 Jul, 2:30 AM", 18600, 62, "PENDING_ADMIN_REVIEW"),
      new WithdrawalReview(UUID.fromString("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"), "Meena Iyer", new BigDecimal("8750"), "Bank", "HDFC ****4821", "12 Jul, 11:00 PM", 9200, 44, "PENDING_ADMIN_REVIEW"),
      new WithdrawalReview(UUID.fromString("cccccccc-cccc-4ccc-8ccc-cccccccccccc"), "Arjun Patel", new BigDecimal("6200"), "UPI", "arjun@okaxis", "12 Jul, 6:15 PM", 7100, 31, "PENDING_ADMIN_REVIEW"),
      new WithdrawalReview(UUID.fromString("dddddddd-dddd-4ddd-8ddd-dddddddddddd"), "Sunita Reddy", new BigDecimal("9800"), "Bank", "SBI ****2934", "12 Jul, 1:00 PM", 11200, 49, "PENDING_ADMIN_REVIEW"),
      new WithdrawalReview(UUID.fromString("eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee"), "Ravi Chandran", new BigDecimal("5650"), "UPI", "ravi@ybl", "11 Jul, 8:45 PM", 6800, 28, "PENDING_ADMIN_REVIEW")
  ));

  private final List<StudentRecord> students = new ArrayList<>(List.of(
      new StudentRecord("Priya Sharma", "priya.sharma@student.vit.ac.in", "VIT Vellore", 8, new BigDecimal("2124"), "ACTIVE"),
      new StudentRecord("Nisha Verma", "nisha.verma@srmuniv.edu.in", "SRM Chennai", 5, new BigDecimal("1118"), "ACTIVE"),
      new StudentRecord("Aryan Shah", "aryan.shah@pes.edu", "PES University", 3, new BigDecimal("708"), "NEW"),
      new StudentRecord("Rohan Mishra", "rohan.m@manipal.edu", "Manipal Institute", 11, new BigDecimal("3186"), "ACTIVE")
  ));

  private final List<BookingRecord> bookings = new ArrayList<>(List.of(
      new BookingRecord("IH-2048", "Priya Sharma", "Ananya Krishnamurthy", "System Design", "13 Jul, 7:00 PM", new BigDecimal("354"), "SCHEDULED"),
      new BookingRecord("IH-2047", "Nisha Verma", "Meena Iyer", "MERN Stack", "13 Jul, 5:30 PM", new BigDecimal("177"), "PENDING"),
      new BookingRecord("IH-2046", "Aryan Shah", "Pradeep Sharma", "Java Full Stack", "12 Jul, 9:00 PM", new BigDecimal("236"), "COMPLETED"),
      new BookingRecord("IH-2045", "Rohan Mishra", "Vijay Raghunathan", "DSA", "12 Jul, 8:00 PM", new BigDecimal("354"), "COMPLETED")
  ));

  private final List<TechnologyRecord> technologies = List.of(
      new TechnologyRecord("Java Full Stack", 314, 42, new BigDecimal("242000"), "HIGH"),
      new TechnologyRecord("MERN Stack", 287, 36, new BigDecimal("201000"), "HIGH"),
      new TechnologyRecord("Spring Boot", 198, 31, new BigDecimal("148000"), "MEDIUM"),
      new TechnologyRecord("Python", 154, 29, new BigDecimal("116000"), "MEDIUM"),
      new TechnologyRecord("DevOps", 118, 18, new BigDecimal("92000"), "HIGH")
  );

  private final List<ReviewRecord> reviews = new ArrayList<>(List.of(
      new ReviewRecord(UUID.fromString("90000000-0000-4000-8000-000000000001"), "Priya Sharma", "Ananya Krishnamurthy", new BigDecimal("5.0"), "Very detailed feedback and practical system design guidance.", "PUBLISHED"),
      new ReviewRecord(UUID.fromString("90000000-0000-4000-8000-000000000002"), "Nisha Verma", "Meena Iyer", new BigDecimal("4.8"), "React questions matched real interview level.", "PUBLISHED"),
      new ReviewRecord(UUID.fromString("90000000-0000-4000-8000-000000000003"), "Rohan Mishra", "Vijay Raghunathan", new BigDecimal("4.2"), "Good DSA round, feedback report was slightly delayed.", "REVIEW")
  ));

  private final List<ComplaintRecord> complaints = new ArrayList<>(List.of(
      new ComplaintRecord(UUID.fromString("80000000-0000-4000-8000-000000000102"), "CMP-102", "Aryan Shah", "Interview no-show", "HIGH", "OPEN", "1 hr"),
      new ComplaintRecord(UUID.fromString("80000000-0000-4000-8000-000000000101"), "CMP-101", "Nisha Verma", "Feedback report missing", "MEDIUM", "INVESTIGATING", "4 hrs"),
      new ComplaintRecord(UUID.fromString("80000000-0000-4000-8000-000000000100"), "CMP-100", "Rohan Mishra", "Payment receipt issue", "LOW", "RESOLVED", "1 day")
  ));

  private final List<PaymentRecord> payments = List.of(
      new PaymentRecord("PAY-8841", "Nisha Verma", "MERN Stack - 30 min", new BigDecimal("177"), new BigDecimal("35"), "CAPTURED"),
      new PaymentRecord("PAY-8840", "Rohan Mishra", "DSA - 60 min", new BigDecimal("354"), new BigDecimal("70"), "CAPTURED"),
      new PaymentRecord("PAY-8839", "Priya Sharma", "System Design - 60 min", new BigDecimal("354"), new BigDecimal("70"), "REFUND_REVIEW")
  );

  private List<TopInterviewer> approvedInterviewers() {
    return APPROVED_INTERVIEWERS.values().stream()
        .map(i -> new TopInterviewer(i.name(), i.company(), i.designation(), i.expertise() == null || i.expertise().isEmpty() ? List.of("Verified") : i.expertise(), BigDecimal.ZERO, 0, BigDecimal.ZERO, "Approved"))
        .toList();
  }

  private final List<AuditRecord> audits = new ArrayList<>(List.of(
      new AuditRecord("04:06 AM", "Arjun Mehta", "Approved interviewer", "Suresh Nambiar", "LOW"),
      new AuditRecord("03:42 AM", "System", "Failed admin login", "unknown@interviewhub.in", "HIGH"),
      new AuditRecord("02:55 AM", "Arjun Mehta", "Processed withdrawal", "Pradeep Sharma", "MEDIUM")
  ));

  @GetMapping("/metrics")
  public synchronized ApiResponse<AdminMetrics> metrics() {
    BigDecimal revenue = payments.stream().map(PaymentRecord::amount).reduce(BigDecimal.ZERO, BigDecimal::add);
    return ApiResponse.ok(new AdminMetrics(students.size(), APPROVED_INTERVIEWERS.size() + pendingInterviewers.size(), bookings.size(), revenue, pendingInterviewers.size(), withdrawals.size()));
  }

  @GetMapping("/overview")
  public synchronized ApiResponse<AdminOverview> overview() {
    return ApiResponse.ok(new AdminOverview(metrics().data(), pendingInterviewers, withdrawals, students, bookings, technologies, reviews, complaints, payments, approvedInterviewers(), audits));
  }

  @GetMapping("/interviewers/pending")
  public synchronized ApiResponse<List<PendingInterviewer>> pendingInterviewers() { return ApiResponse.ok(pendingInterviewers); }
  @GetMapping("/withdrawals/pending")
  public synchronized ApiResponse<List<WithdrawalReview>> pendingWithdrawals() { return ApiResponse.ok(withdrawals); }

  @PostMapping("/interviewers/{interviewerId}/approve")
  public synchronized ApiResponse<ModerationResult> approveInterviewer(@PathVariable("interviewerId") UUID interviewerId, @Valid @RequestBody ModerationRequest request) {
    PendingInterviewer removed = removePendingInterviewer(interviewerId);
    if (removed != null) { approveEmail(removed.email(), removed.name(), removed.company(), removed.designation(), removed.expertise()); }
    persistState();
    audits.add(0, new AuditRecord("now", request.adminId(), "Approved interviewer", removed == null ? interviewerId.toString() : removed.name(), "LOW"));
    return ApiResponse.ok(new ModerationResult(interviewerId, "APPROVED", request.note()));
  }

  @PostMapping("/interviewers/{interviewerId}/reject")
  public synchronized ApiResponse<ModerationResult> rejectInterviewer(@PathVariable("interviewerId") UUID interviewerId, @Valid @RequestBody ModerationRequest request) {
    PendingInterviewer removed = removePendingInterviewer(interviewerId);
    if (removed != null) { rejectEmail(removed.email()); }
    persistState();
    audits.add(0, new AuditRecord("now", request.adminId(), "Rejected interviewer", removed == null ? interviewerId.toString() : removed.name(), "MEDIUM"));
    return ApiResponse.ok(new ModerationResult(interviewerId, "REJECTED", request.note()));
  }

  @PostMapping("/withdrawals/{withdrawalId}/mark-paid")
  public synchronized ApiResponse<ModerationResult> markWithdrawalPaid(@PathVariable("withdrawalId") UUID withdrawalId, @Valid @RequestBody ModerationRequest request) {
    WithdrawalReview removed = removeWithdrawal(withdrawalId);
    audits.add(0, new AuditRecord("now", request.adminId(), "Marked withdrawal paid", removed == null ? withdrawalId.toString() : removed.interviewerName(), "MEDIUM"));
    return ApiResponse.ok(new ModerationResult(withdrawalId, "PAID", request.note()));
  }

  @PostMapping("/withdrawals/{withdrawalId}/reject")
  public synchronized ApiResponse<ModerationResult> rejectWithdrawal(@PathVariable("withdrawalId") UUID withdrawalId, @Valid @RequestBody ModerationRequest request) {
    WithdrawalReview removed = removeWithdrawal(withdrawalId);
    audits.add(0, new AuditRecord("now", request.adminId(), "Rejected withdrawal", removed == null ? withdrawalId.toString() : removed.interviewerName(), "MEDIUM"));
    return ApiResponse.ok(new ModerationResult(withdrawalId, "REJECTED", request.note()));
  }

  @PostMapping("/complaints/{complaintId}/resolve")
  public synchronized ApiResponse<ModerationResult> resolveComplaint(@PathVariable("complaintId") UUID complaintId, @Valid @RequestBody ModerationRequest request) {
    complaints.replaceAll(c -> c.id().equals(complaintId) ? new ComplaintRecord(c.id(), c.code(), c.reportedBy(), c.issue(), c.priority(), "RESOLVED", c.age()) : c);
    audits.add(0, new AuditRecord("now", request.adminId(), "Resolved complaint", complaintId.toString(), "LOW"));
    return ApiResponse.ok(new ModerationResult(complaintId, "RESOLVED", request.note()));
  }

  @PostMapping("/reviews/{reviewId}/publish")
  public synchronized ApiResponse<ModerationResult> publishReview(@PathVariable("reviewId") UUID reviewId, @Valid @RequestBody ModerationRequest request) {
    reviews.replaceAll(r -> r.id().equals(reviewId) ? new ReviewRecord(r.id(), r.student(), r.interviewer(), r.rating(), r.text(), "PUBLISHED") : r);
    audits.add(0, new AuditRecord("now", request.adminId(), "Published review", reviewId.toString(), "LOW"));
    return ApiResponse.ok(new ModerationResult(reviewId, "PUBLISHED", request.note()));
  }

  @PostMapping("/reviews/{reviewId}/hide")
  public synchronized ApiResponse<ModerationResult> hideReview(@PathVariable("reviewId") UUID reviewId, @Valid @RequestBody ModerationRequest request) {
    reviews.replaceAll(r -> r.id().equals(reviewId) ? new ReviewRecord(r.id(), r.student(), r.interviewer(), r.rating(), r.text(), "HIDDEN") : r);
    audits.add(0, new AuditRecord("now", request.adminId(), "Hidden review", reviewId.toString(), "MEDIUM"));
    return ApiResponse.ok(new ModerationResult(reviewId, "HIDDEN", request.note()));
  }

  private PendingInterviewer removePendingInterviewer(UUID id) {
    PendingInterviewer item = pendingInterviewers.stream().filter(i -> i.id().equals(id)).findFirst().orElse(null);
    pendingInterviewers.removeIf(i -> i.id().equals(id));
    return item;
  }

  private WithdrawalReview removeWithdrawal(UUID id) {
    WithdrawalReview item = withdrawals.stream().filter(w -> w.id().equals(id)).findFirst().orElse(null);
    withdrawals.removeIf(w -> w.id().equals(id));
    return item;
  }

  private static void loadState() {
    try {
      if (Files.exists(PENDING_STATE_FILE)) {
        List<PendingInterviewer> savedPending = JSON.readValue(PENDING_STATE_FILE.toFile(), new TypeReference<List<PendingInterviewer>>() {});
        pendingInterviewers.clear();
        pendingInterviewers.addAll(savedPending);
      }
      if (Files.exists(APPROVED_STATE_FILE)) {
        Map<String, ApprovedInterviewerProfile> savedApproved = JSON.readValue(APPROVED_STATE_FILE.toFile(), new TypeReference<Map<String, ApprovedInterviewerProfile>>() {});
        APPROVED_INTERVIEWERS.clear();
        APPROVED_INTERVIEWERS.putAll(savedApproved);
      }
      if (Files.exists(REJECTED_STATE_FILE)) {
        Set<String> savedRejected = JSON.readValue(REJECTED_STATE_FILE.toFile(), new TypeReference<Set<String>>() {});
        REJECTED_INTERVIEWERS.clear();
        REJECTED_INTERVIEWERS.addAll(savedRejected);
      }
      if (Files.exists(CREDENTIALS_STATE_FILE)) {
        Map<String, String> savedCredentials = JSON.readValue(CREDENTIALS_STATE_FILE.toFile(), new TypeReference<Map<String, String>>() {});
        INTERVIEWER_PASSWORDS.clear();
        INTERVIEWER_PASSWORDS.putAll(savedCredentials);
      }
    } catch (IOException ignored) {
      // Keep seeded dev data if the local state file is not readable.
    }
  }

  private static void persistState() {
    try {
      Files.createDirectories(STATE_DIR);
      JSON.writerWithDefaultPrettyPrinter().writeValue(PENDING_STATE_FILE.toFile(), pendingInterviewers);
      JSON.writerWithDefaultPrettyPrinter().writeValue(APPROVED_STATE_FILE.toFile(), APPROVED_INTERVIEWERS);
      JSON.writerWithDefaultPrettyPrinter().writeValue(REJECTED_STATE_FILE.toFile(), REJECTED_INTERVIEWERS);
      JSON.writerWithDefaultPrettyPrinter().writeValue(CREDENTIALS_STATE_FILE.toFile(), INTERVIEWER_PASSWORDS);
    } catch (IOException ignored) {
      // The app can still run with in-memory state during local development.
    }
  }
  public record AdminMetrics(int students, int interviewers, int bookingsThisMonth, BigDecimal revenueThisMonth, int pendingApprovals, int pendingWithdrawals) {}
  public record AdminOverview(AdminMetrics metrics, List<PendingInterviewer> pendingInterviewers, List<WithdrawalReview> withdrawals, List<StudentRecord> students, List<BookingRecord> bookings, List<TechnologyRecord> technologies, List<ReviewRecord> reviews, List<ComplaintRecord> complaints, List<PaymentRecord> payments, List<TopInterviewer> topInterviewers, List<AuditRecord> audits) {}
  public record PendingInterviewer(UUID id, String name, String email, String company, String designation, String experience, String linkedinUrl, List<String> expertise, boolean linkedinVerified, boolean resumeUploaded, boolean idCardUploaded, String submittedAt, int waitHours) {}
  public record WithdrawalReview(UUID id, String interviewerName, BigDecimal amount, String payoutMethod, String payoutDetail, String requestedAt, int walletBalance, int completedSessions, String status) {}
  public record StudentRecord(String name, String email, String college, int bookings, BigDecimal spend, String status) {}
  public record BookingRecord(String id, String student, String interviewer, String technology, String date, BigDecimal amount, String status) {}
  public record TechnologyRecord(String name, int bookings, int interviewers, BigDecimal revenue, String demand) {}
  public record ReviewRecord(UUID id, String student, String interviewer, BigDecimal rating, String text, String status) {}
  public record ComplaintRecord(UUID id, String code, String reportedBy, String issue, String priority, String status, String age) {}
  public record PaymentRecord(String id, String user, String item, BigDecimal amount, BigDecimal commission, String status) {}
  public record TopInterviewer(String name, String company, String designation, List<String> technologies, BigDecimal rating, int sessions, BigDecimal earnings, String badge) {}
  public record AuditRecord(String time, String actor, String action, String target, String risk) {}
  public record ModerationRequest(@NotBlank String adminId, String note) {}
  public record ModerationResult(UUID targetId, String status, String note) {}
}







