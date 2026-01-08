package com.prototype.arpartment_managing.service;

import com.prototype.arpartment_managing.dto.RevenueDTO;
import com.prototype.arpartment_managing.model.Apartment;
import com.prototype.arpartment_managing.model.Fee;
import com.prototype.arpartment_managing.model.Revenue;
import com.prototype.arpartment_managing.model.User;
import com.prototype.arpartment_managing.repository.ApartmentRepository;
import com.prototype.arpartment_managing.repository.FeeRepository;
import com.prototype.arpartment_managing.repository.RevenueRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RevenueServiceTest {

    @Mock
    private RevenueRepository revenueRepository;

    @Mock
    private FeeRepository feeRepository;

    @Mock
    private ApartmentRepository apartmentRepository;

    @InjectMocks
    private RevenueService revenueService;

    @Test
    public void testCreateRevenue_Success() {
        // Arrange
        RevenueDTO dto = new RevenueDTO();
        dto.setApartmentId("A101");
        dto.setType("Electricity");
        dto.setUsed(100.0);
        dto.setStatus("Unpaid");

        Apartment apartment = new Apartment();
        apartment.setApartmentId("A101");
        User resident = new User();
        resident.setActive(true);
        apartment.setResidents(List.of(resident));

        Fee fee = new Fee();
        fee.setType("Electricity");
        fee.setPricePerUnit(3500.0);

        when(apartmentRepository.findByApartmentId("A101")).thenReturn(Optional.of(apartment));
        when(feeRepository.findByType("Electricity")).thenReturn(Optional.of(fee));
        when(revenueRepository.save(any(Revenue.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        Revenue result = revenueService.createRevenue(dto);

        // Assert
        assertNotNull(result);
        assertEquals(350000.0, result.getTotal()); // 100 * 3500
        verify(revenueRepository, times(1)).save(any(Revenue.class));
    }

    @Test
    public void testCalculateTotalPayment() {
        // Arrange
        String apartmentId = "A101";

        Revenue r1 = new Revenue();
        r1.setType("Electricity");
        r1.setUsed(100.0);
        r1.setStatus("Unpaid");

        Revenue r2 = new Revenue();
        r2.setType("Water");
        r2.setUsed(10.0);
        r2.setStatus("Paid"); // Should not be included in total payment

        Fee f1 = new Fee();
        f1.setType("Electricity");
        f1.setPricePerUnit(3500.0);

        when(revenueRepository.findByApartment_ApartmentId(apartmentId)).thenReturn(List.of(r1, r2));
        when(feeRepository.findByType("Electricity")).thenReturn(Optional.of(f1));

        // Act
        Double total = revenueService.calculateTotalPayment(apartmentId);

        // Assert
        assertEquals(350000.0, total);
    }

    @Test
    public void testCreateRevenue_NoActiveResidents() {
        // Arrange
        RevenueDTO dto = new RevenueDTO();
        dto.setApartmentId("A101");

        Apartment apartment = new Apartment();
        apartment.setApartmentId("A101");
        User resident = new User();
        resident.setActive(false); // Inactive
        apartment.setResidents(List.of(resident));

        when(apartmentRepository.findByApartmentId("A101")).thenReturn(Optional.of(apartment));

        // Act & Assert
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            revenueService.createRevenue(dto);
        });
        assertTrue(exception.getMessage().contains("No active residents"));
    }
}
