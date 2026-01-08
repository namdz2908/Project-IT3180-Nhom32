package com.prototype.arpartment_managing.service;

import com.prototype.arpartment_managing.dto.UserDTO;
import com.prototype.arpartment_managing.model.Apartment;
import com.prototype.arpartment_managing.model.User;
import com.prototype.arpartment_managing.repository.ApartmentRepository;
import com.prototype.arpartment_managing.repository.UserRepository;
import com.prototype.arpartment_managing.token.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ApartmentRepository apartmentRepository;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private UserService userService;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Test
    public void testLoginUser_Success() {
        // Arrange
        String username = "testuser";
        String password = "password123";
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setActive(true);
        user.setRole("USER");

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken(username, "USER")).thenReturn("mock-jwt-token");

        Map<String, String> loginRequest = new HashMap<>();
        loginRequest.put("username", username);
        loginRequest.put("password", password);

        // Act
        ResponseEntity<?> response = userService.loginUser(loginRequest);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertEquals("mock-jwt-token", body.get("token"));
        assertEquals(username, body.get("username"));
    }

    @Test
    public void testLoginUser_InvalidPassword() {
        // Arrange
        String username = "testuser";
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode("correct-password"));
        user.setActive(true);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));

        Map<String, String> loginRequest = new HashMap<>();
        loginRequest.put("username", username);
        loginRequest.put("password", "wrong-password");

        // Act
        ResponseEntity<?> response = userService.loginUser(loginRequest);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Invalid username or password", response.getBody());
    }

    @Test
    public void testCreateUser_InvalidEmail() {
        // Arrange
        UserDTO userDTO = new UserDTO();
        userDTO.setApartmentId("A101");
        userDTO.setEmail("invalid-email");
        userDTO.setPhoneNumber("0987654321");
        userDTO.setCitizenIdentification("123456789012");

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            userService.createUser(userDTO);
        });
    }

    @Test
    public void testCreateUser_Success() {
        // Arrange
        UserDTO userDTO = new UserDTO();
        userDTO.setFullName("Test User");
        userDTO.setUsername("testuser");
        userDTO.setEmail("test@example.com");
        userDTO.setPhoneNumber("0987123456");
        userDTO.setCitizenIdentification("123456789012");
        userDTO.setPassword("password123");
        userDTO.setApartmentId("A101");
        userDTO.setRole("USER");

        Apartment apartment = new Apartment();
        apartment.setApartmentId("A101");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());
        when(userRepository.findByCitizenIdentification("123456789012")).thenReturn(Optional.empty());
        when(apartmentRepository.findByApartmentId("A101")).thenReturn(Optional.of(apartment));

        // Act
        User createdUser = userService.createUser(userDTO);

        // Assert
        assertNotNull(createdUser);
        assertEquals("testuser", createdUser.getUsername());
        verify(userRepository, times(1)).save(any(User.class));
        verify(apartmentRepository, times(1)).save(any(Apartment.class));
    }
}
