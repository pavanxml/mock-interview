package com.interviewhub.api.notification;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewhub.api.common.ApiResponse;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {
  private static final ObjectMapper JSON = new ObjectMapper();
  private static final Path STATE_DIR = Path.of(System.getProperty("java.io.tmpdir"), "interviewhub-state");
  private static final Path NOTIFICATIONS_STATE_FILE = STATE_DIR.resolve("notifications.json");
  private static final List<NotificationItem> NOTIFICATIONS = new ArrayList<>();

  static {
    loadState();
  }

  @GetMapping
  public synchronized ApiResponse<List<NotificationItem>> list(@RequestParam(name = "audience", required = false) String audience) {
    if (audience == null || audience.isBlank() || "all".equalsIgnoreCase(audience)) {
      return ApiResponse.ok(List.copyOf(NOTIFICATIONS));
    }
    String normalized = audience.toLowerCase();
    return ApiResponse.ok(NOTIFICATIONS.stream()
        .filter(item -> "all".equals(item.audience()) || item.audience().equals(normalized))
        .toList());
  }

  @PostMapping("/mark-all-read")
  public synchronized ApiResponse<List<NotificationItem>> markAllRead(@RequestParam(name = "audience", required = false) String audience) {
    String normalized = audience == null ? "all" : audience.toLowerCase();
    NOTIFICATIONS.replaceAll(item -> "all".equals(normalized) || item.audience().equals(normalized) || "all".equals(item.audience())
        ? item.withRead(true)
        : item);
    persistState();
    return list(audience);
  }

  public static synchronized void add(String audience, String type, String title, String message, String actionUrl, String actionLabel) {
    NOTIFICATIONS.add(0, new NotificationItem(
        UUID.randomUUID().toString(),
        audience == null || audience.isBlank() ? "all" : audience.toLowerCase(),
        type,
        title,
        message,
        "now",
        false,
        actionUrl,
        actionLabel,
        Instant.now().toString()));
    persistState();
  }

  private static void loadState() {
    try {
      if (Files.exists(NOTIFICATIONS_STATE_FILE)) {
        NOTIFICATIONS.clear();
        NOTIFICATIONS.addAll(JSON.readValue(NOTIFICATIONS_STATE_FILE.toFile(), new TypeReference<List<NotificationItem>>() {}));
      }
    } catch (IOException ignored) {
      // Keep in-memory notifications if local files cannot be read.
    }
  }

  private static void persistState() {
    try {
      Files.createDirectories(STATE_DIR);
      JSON.writerWithDefaultPrettyPrinter().writeValue(NOTIFICATIONS_STATE_FILE.toFile(), NOTIFICATIONS);
    } catch (IOException ignored) {
      // Notifications can still work in memory during local development.
    }
  }

  public record NotificationItem(String id, String audience, String type, String title, String message, String time, boolean read, String actionUrl, String actionLabel, String createdAt) {
    NotificationItem withRead(boolean nextRead) {
      return new NotificationItem(id, audience, type, title, message, time, nextRead, actionUrl, actionLabel, createdAt);
    }
  }
}