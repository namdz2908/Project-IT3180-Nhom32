package com.prototype.arpartment_managing.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Utility class to monitor logs for specific events like revenue generation
 * Helps verify that scheduled tasks are running correctly
 */
@Component
public class LogMonitor {
    private static final Logger logger = LoggerFactory.getLogger(LogMonitor.class);
    
    // Assuming logs are in the default Spring Boot location
    private static final String DEFAULT_LOG_DIR = "logs";
    private static final String DEFAULT_LOG_FILE = "spring.log";
    
    /**
     * Get revenue generation log entries from the application log file
     * 
     * @param date Optional date to filter log entries (null for all entries)
     * @return List of log entries related to revenue generation
     */
    public List<String> getRevenueGenerationLogs(LocalDate date) {
        List<String> logEntries = new ArrayList<>();
        Path logFilePath = getLogFilePath();
        
        if (logFilePath == null) {
            logger.warn("Could not locate log file");
            return logEntries;
        }
        
        try (BufferedReader reader = new BufferedReader(new FileReader(logFilePath.toFile()))) {
            String datePattern = date != null ? 
                    date.format(DateTimeFormatter.ISO_LOCAL_DATE) : null;
                    
            String line;
            while ((line = reader.readLine()) != null) {
                // Check if the line contains revenue generation information
                if (line.contains("RevenueScheduler") && 
                   (line.contains("Starting automatic monthly revenue generation") ||
                    line.contains("Created") && line.contains("revenue for apartment"))) {
                    
                    // If a date filter is provided, check if the log entry is from that date
                    if (datePattern == null || line.contains(datePattern)) {
                        logEntries.add(line);
                    }
                }
            }
        } catch (IOException e) {
            logger.error("Error reading log file: {}", e.getMessage());
        }
        
        return logEntries;
    }
    
    /**
     * Find the log file path
     * First checks the standard locations, then tries to find the file
     */
    private Path getLogFilePath() {
        // Try standard locations first
        Path[] possiblePaths = {
            Paths.get(DEFAULT_LOG_DIR, DEFAULT_LOG_FILE),  // logs/spring.log
            Paths.get("target", DEFAULT_LOG_FILE),         // target/spring.log
            Paths.get(System.getProperty("user.dir"), DEFAULT_LOG_FILE)  // ./spring.log
        };
        
        for (Path path : possiblePaths) {
            if (Files.exists(path)) {
                return path;
            }
        }
        
        // If not found in standard locations, try to search
        try (Stream<Path> stream = Files.walk(Paths.get(System.getProperty("user.dir")), 3)) {
            return stream
                .filter(path -> path.getFileName().toString().equals(DEFAULT_LOG_FILE))
                .findFirst().orElse(null);
        } catch (IOException e) {
            logger.error("Error searching for log file: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * Check if there are any revenue generation logs for today
     * 
     * @return true if revenues were generated today
     */
    public boolean wereRevenuesGeneratedToday() {
        List<String> todayLogs = getRevenueGenerationLogs(LocalDate.now());
        return !todayLogs.isEmpty();
    }
}
