package com.interviewhub.api.auth;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewhub.api.admin.AdminController;
import com.interviewhub.api.common.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
  private static final ObjectMapper JSON = new ObjectMapper();
  private static final Path STATE_DIR = Path.of(System.getProperty("java.io.tmpdir"), "interviewhub-state");
  private static final Path STUDENT_CREDENTIALS_STATE_FILE = STATE_DIR.resolve("student-credentials.json");
  private static final Path STUDENTS_STATE_FILE = STATE_DIR.resolve("students.json");
  private static final Path LEGACY_STUDENTS_STATE_FILE = STATE_DIR.resolve("student-profiles.json");
  private static final Map<String, String> STUDENT_PASSWORDS = new HashMap<>();
  private static final Map<String, StudentProfile> STUDENTS = new HashMap<>();

  static {
    loadStudentState();
  }

  @PostMapping("/student/register")
  @ResponseStatus(HttpStatus.CREATED)
  public ApiResponse<AuthResult> registerStudent(@Valid @RequestBody StudentRegistrationRequest request) {
    String email = request.email().toLowerCase();
    STUDENT_PASSWORDS.put(email, request.password());
    STUDENTS.put(email, new StudentProfile(request.fullName(), email, request.phone(), request.college(), request.graduationYear()));
    persistStudentState();
    return ApiResponse.created(demoToken("STUDENT", email, request.fullName(), "Student", request.college(), List.of(), request.phone(), request.graduationYear()), "Student registered. You can sign in now.");
  }

  @PostMapping("/interviewer/register")
  @ResponseStatus(HttpStatus.CREATED)
  public ApiResponse<AuthResult> registerInterviewer(@Valid @RequestBody InterviewerRegistrationRequest request) {
    if (AdminController.isRejectedInterviewer(request.email())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This interviewer application was rejected by admin.");
    }
    AdminController.addPendingInterviewer(
        request.fullName(),
        request.email(),
        request.currentCompany(),
        request.currentDesignation(),
        request.yearsOfExperience(),
        request.linkedinUrl(),
        request.expertise(),
        true,
        false);
    AdminController.registerInterviewerCredentials(request.email(), request.password());
    return ApiResponse.created(
        demoToken("INTERVIEWER_PENDING", request.email(), request.fullName(), request.currentDesignation(), request.currentCompany(), request.expertise(), "", ""),
        "Interviewer application submitted for admin review.");
  }

  @PostMapping("/login")
  public ApiResponse<AuthResult> login(@Valid @RequestBody LoginRequest request) {
    if ("INTERVIEWER".equalsIgnoreCase(request.role())) {
      if (AdminController.isRejectedInterviewer(request.email())) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Your interviewer application was rejected by admin.");
      }
      if (!AdminController.hasInterviewerCredentials(request.email())) {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No interviewer account found for this email. Please register first.");
      }
      if (!AdminController.isApprovedInterviewer(request.email())) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Your interviewer account is not approved by admin yet.");
      }
      if (!AdminController.passwordMatches(request.email(), request.password())) {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid interviewer email or password.");
      }
      AdminController.ApprovedInterviewerProfile profile = AdminController.approvedProfile(request.email());
      return ApiResponse.ok(demoToken("INTERVIEWER", request.email(), profile.name(), profile.designation(), profile.company(), profile.expertise() == null ? List.of() : profile.expertise(), "", ""));
    }

    if ("STUDENT".equalsIgnoreCase(request.role())) {
      String email = request.email().toLowerCase();
      if (!STUDENT_PASSWORDS.containsKey(email)) {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No student account found for this email. Please register first.");
      }
      if (!request.password().equals(STUDENT_PASSWORDS.get(email))) {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid student email or password.");
      }
      StudentProfile profile = STUDENTS.get(email);
      return ApiResponse.ok(demoToken("STUDENT", email, profile.fullName(), "Student", profile.college(), List.of(), profile.phone(), profile.graduationYear()));
    }

    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unsupported login role.");
  }

  private AuthResult demoToken(String role, String email, String fullName, String designation, String company, List<String> expertise, String phone, String graduationYear) {
    return new AuthResult(UUID.randomUUID(), email, role, "replace-with-jwt", "Bearer", 3600, fullName, designation, company, expertise == null ? List.of() : expertise, phone == null ? "" : phone, graduationYear == null ? "" : graduationYear);
  }

  private static void loadStudentState() {
    try {
      if (Files.exists(STUDENT_CREDENTIALS_STATE_FILE)) {
        Map<String, String> savedPasswords = JSON.readValue(STUDENT_CREDENTIALS_STATE_FILE.toFile(), new TypeReference<Map<String, String>>() {});
        STUDENT_PASSWORDS.clear();
        STUDENT_PASSWORDS.putAll(savedPasswords);
      }
      if (Files.exists(STUDENTS_STATE_FILE)) {
        Map<String, StudentProfile> savedStudents = JSON.readValue(STUDENTS_STATE_FILE.toFile(), new TypeReference<Map<String, StudentProfile>>() {});
        STUDENTS.clear();
        STUDENTS.putAll(savedStudents);
      } else if (Files.exists(LEGACY_STUDENTS_STATE_FILE)) {
        Map<String, LegacyStudentProfile> savedStudents = JSON.readValue(LEGACY_STUDENTS_STATE_FILE.toFile(), new TypeReference<Map<String, LegacyStudentProfile>>() {});
        STUDENTS.clear();
        savedStudents.forEach((email, profile) -> STUDENTS.put(email, new StudentProfile(profile.fullName(), profile.email(), "", profile.college(), profile.graduationYear())));
      }
    } catch (IOException ignored) {
      // Keep in-memory state if local files cannot be read.
    }
  }

  private static void persistStudentState() {
    try {
      Files.createDirectories(STATE_DIR);
      JSON.writerWithDefaultPrettyPrinter().writeValue(STUDENT_CREDENTIALS_STATE_FILE.toFile(), STUDENT_PASSWORDS);
      JSON.writerWithDefaultPrettyPrinter().writeValue(STUDENTS_STATE_FILE.toFile(), STUDENTS);
    } catch (IOException ignored) {
      // The app can continue with in-memory accounts during local development.
    }
  }

  public record StudentProfile(String fullName, String email, String phone, String college, String graduationYear) {}
  public record LegacyStudentProfile(String fullName, String email, String college, String graduationYear) {}

  public record LoginRequest(@Email String email, @NotBlank String password, @NotBlank String role) {}

  public record StudentRegistrationRequest(
      @NotBlank String fullName,
      @Email String email,
      @NotBlank String phone,
      @NotBlank String college,
      @NotBlank String graduationYear,
      @NotBlank String password,
      @NotBlank String resumeDocumentId) {}

  public record InterviewerRegistrationRequest(
      @NotBlank String fullName,
      @Email String email,
      @NotBlank String phone,
      @NotBlank String currentCompany,
      @NotBlank String currentDesignation,
      @NotBlank String yearsOfExperience,
      @NotBlank String linkedinUrl,
      @NotBlank String bio,
      @NotEmpty List<String> expertise,
      @NotEmpty List<String> availableDays,
      @NotEmpty List<String> availableTimeSlots,
      @NotBlank String password,
      String upiId,
      String bankAccountLast4,
      @NotBlank String resumeDocumentId) {}

  public record AuthResult(UUID userId, String email, String role, String accessToken, String tokenType, int expiresInSeconds, String fullName, String designation, String company, List<String> expertise, String phone, String graduationYear) {}
}