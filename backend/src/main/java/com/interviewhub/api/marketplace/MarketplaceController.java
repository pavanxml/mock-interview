package com.interviewhub.api.marketplace;

import com.interviewhub.api.common.ApiResponse;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/marketplace")
public class MarketplaceController {
  @GetMapping("/technologies")
  public ApiResponse<List<TechnologyDto>> technologies() {
    return ApiResponse.ok(List.of(
        new TechnologyDto("java-full-stack", "Java Full Stack", "Backend", 42),
        new TechnologyDto("react", "React", "Frontend", 31),
        new TechnologyDto("system-design", "System Design", "Architecture", 18)));
  }

  @GetMapping("/interviewers")
  public ApiResponse<List<InterviewerCard>> interviewers(@RequestParam(required = false) String technology) {
    return ApiResponse.ok(List.of(
        new InterviewerCard(UUID.randomUUID(), "Ravi Kumar", "Cognizant", "Technical Manager", "Java Full Stack", new BigDecimal("250.00"), 4.8, true),
        new InterviewerCard(UUID.randomUUID(), "Ananya Krishnan", "Amazon", "Senior SDE", "System Design", new BigDecimal("300.00"), 4.9, true)));
  }

  @GetMapping("/availability")
  public ApiResponse<List<AvailabilitySlot>> availability(@RequestParam UUID interviewerId, @RequestParam LocalDate date) {
    return ApiResponse.ok(List.of(
        new AvailabilitySlot(date, "18:00", "18:45", true),
        new AvailabilitySlot(date, "19:00", "19:45", true),
        new AvailabilitySlot(date, "20:00", "20:45", false)));
  }

  public record TechnologyDto(String id, String label, String category, int interviewerCount) {}
  public record InterviewerCard(UUID id, String name, String company, String designation, String primarySkill, BigDecimal priceFrom, double rating, boolean verified) {}
  public record AvailabilitySlot(LocalDate date, String startTime, String endTime, boolean available) {}
}