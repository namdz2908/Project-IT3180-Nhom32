package com.prototype.arpartment_managing.service;

import com.prototype.arpartment_managing.dto.UserDTO;
import com.prototype.arpartment_managing.exception.ApartmentNotFoundException;
import com.prototype.arpartment_managing.exception.FeeNotFoundException;
import com.prototype.arpartment_managing.model.Fee;
import com.prototype.arpartment_managing.model.Revenue;
import com.prototype.arpartment_managing.model.User;
import com.prototype.arpartment_managing.model.Apartment;
import com.prototype.arpartment_managing.repository.ApartmentRepository;
import com.prototype.arpartment_managing.repository.FeeRepository;
import com.prototype.arpartment_managing.repository.RevenueRepository;
import com.prototype.arpartment_managing.repository.UserRepository;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.BaseFont;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfWriter;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.http.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.List;

@Primary
@Service
public class ApartmentService {
    @Autowired
    private ApartmentRepository apartmentRepository;
    @Autowired
    private FeeRepository feeRepository;
    @Autowired
    private RevenueRepository revenueRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private QRCodeService qrCodeService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public List<Apartment> getAllApartments() {
        return apartmentRepository.findAll();
    }

    public ResponseEntity<?> getApartmentById(String apartmentId){
        if (apartmentId != null) {
            Apartment apartment = apartmentRepository.findByApartmentId(apartmentId)
                    .orElseThrow(() -> new ApartmentNotFoundException(apartmentId));
            return ResponseEntity.ok(apartment);
        } else {
            return ResponseEntity.badRequest().body("Must provide apartment room's number");
        }
    }

    public Apartment createApartment(Apartment apartment) {
        if (apartment.getArea() <= 0) {
            throw new IllegalArgumentException("Area must be greater than 0");
        }
        if (apartment.getFloor() <= 0) {
            throw new IllegalArgumentException("Floor must be greater than 0");
        }
        Optional<Apartment> existingApartmentId = apartmentRepository.findByApartmentId(apartment.getApartmentId());
        if (existingApartmentId.isPresent()) {
            throw new IllegalArgumentException("Apartment with number '" + apartment.getApartmentId() + "' already exists");
        }
        return apartmentRepository.save(apartment);
    }

    @Transactional
    public void deleteApartment(String apartmentId) {
        Apartment apartment = apartmentRepository.findByApartmentId(apartmentId)
                .orElseThrow(() -> new ApartmentNotFoundException(apartmentId));

        for (User resident : apartment.getResidents()) {
            resident.setApartment(null);
        }
        userRepository.saveAll(apartment.getResidents()); // Save changes to users

        for (Revenue revenue : new ArrayList<>(apartment.getRevenues())) {
            revenueRepository.delete(revenue);
        }
        apartmentRepository.delete(apartment);
    }

    @Transactional
    public Apartment updateApartment(Apartment newApartment, String apartmentId) {
        return apartmentRepository.findByApartmentId(apartmentId)
                .map(apartment -> {
                    apartment.setFloor(newApartment.getFloor());
                    apartment.setOccupants(newApartment.getOccupants());
                    apartment.setIsOccupied(newApartment.getOccupants() > 0);
                    apartment.setOwner(newApartment.getOwner());
                    apartment.setArea(newApartment.getArea());
                    apartment.setApartmentType(newApartment.getApartmentType());
                    apartment.setTotal(newApartment.getTotal());
                    return apartmentRepository.save(apartment);
                }).orElseThrow(() -> new ApartmentNotFoundException(apartmentId));
    }

//    public Double calculateFee(String apartmentId, String feeType) {
//        List<Revenue> revenues = findAllRevenueByApartmentId(apartmentId);
//        if (revenues.isEmpty()) {
//            return 0.0;
//        }
//        Fee fee = feeRepository.findByType(feeType)
//                .orElseThrow(() -> new IllegalArgumentException("Fee type not found: " + feeType));
//        return revenues.stream()
//                .filter(revenue -> feeType.equals(revenue.getType())) // Selects only revenues matching the requested feeType
//                .mapToDouble(revenue -> revenue.getUsed() * fee.getPricePerUnit()) // Calculates individual fees
//                .sum(); // Sums up all fees
//    }
    public List<Revenue> findAllRevenueByApartmentId(String apartmentId) {
        Apartment apartment = apartmentRepository.findByApartmentId(apartmentId)
                .orElseThrow(() -> new ApartmentNotFoundException(apartmentId));
        return apartment.getRevenues();
    }

    public Double calculateTotalPayment(String apartmentId) {
        List<Revenue> revenues = findAllRevenueByApartmentId(apartmentId);
        if (revenues.isEmpty()) {
            return 0.0;
        }

        // Update status for all revenues first
        revenues.forEach(Revenue::updateStatus);

        // Sum up the total of all unpaid and overdue revenues
        return revenues.stream()
                .filter(revenue -> "Unpaid".equals(revenue.getStatus()) || "Overdue".equals(revenue.getStatus()))
                .mapToDouble(Revenue::getTotal)
                .sum();
    }

    public ResponseEntity<?> generateBill(String apartmentId, String status, String id, String isQR) {
        try {
            Apartment apartment = apartmentRepository.findByApartmentId(apartmentId)
                    .orElseThrow(() -> new ApartmentNotFoundException(apartmentId));

            Document document = new Document(PageSize.A4);
            ByteArrayOutputStream out = new ByteArrayOutputStream();

            PdfWriter.getInstance(document, out);
            document.open();

            // Nhúng font Unicode (Times New Roman)
            BaseFont baseFont = BaseFont.createFont("backend/src/main/resources/fonts/Roboto-Regular.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
            Font headerFont = new Font(baseFont, 24, Font.BOLD);
            Font titleFont = new Font(baseFont, 18, Font.BOLD);
            Font sectionFont = new Font(baseFont, 12, Font.BOLD);
            Font tableHeaderFont = new Font(baseFont, 10, Font.BOLD);
            Font tableCellFont = new Font(baseFont, 10);
            Font totalFont = new Font(baseFont, 14, Font.BOLD);
            Font smallFont = new Font(baseFont, 8, Font.ITALIC);

            // Add logo
            try {
                String logoPath = "backend/src/main/resources/static/images/logo.png";
                Image logo = Image.getInstance(logoPath);
                logo.scaleToFit(100, 100); // Adjust size as needed
                logo.setAlignment(Element.ALIGN_CENTER);
                document.add(logo);
            } catch (Exception e) {
                // If logo is not found, continue without it
                System.out.println("Logo not found: " + e.getMessage());
            }

            // Add company name
            Paragraph header = new Paragraph("BLUEMOON APARTMENT", headerFont);
            header.setAlignment(Element.ALIGN_CENTER);
            header.setSpacingAfter(20);
            document.add(header);

            // Add bill title
            Paragraph title = new Paragraph("BILL STATEMENT", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Add bill information section
            Paragraph billInfo = new Paragraph("Bill Information", sectionFont);
            billInfo.setSpacingBefore(10);
            billInfo.setSpacingAfter(10);
            document.add(billInfo);

            // Add bill details in a table
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingBefore(10);
            infoTable.setSpacingAfter(10);

            Calendar calendar = Calendar.getInstance();
            String currentMonth = new SimpleDateFormat("MMMM yyyy").format(calendar.getTime());

            addTableRow(infoTable, "Bill Number:", "BILL-" + apartmentId + "-" + System.currentTimeMillis(), tableCellFont, tableCellFont);
            addTableRow(infoTable, "Issue Date:", new SimpleDateFormat("dd/MM/yyyy").format(new Date()), tableCellFont, tableCellFont);
            addTableRow(infoTable, "Bill Period:", currentMonth, tableCellFont, tableCellFont);
            document.add(infoTable);

            // Add apartment information section
            Paragraph apartmentInfo = new Paragraph("Apartment Information", sectionFont);
            apartmentInfo.setSpacingBefore(10);
            apartmentInfo.setSpacingAfter(10);
            document.add(apartmentInfo);

            // Add apartment details in a table
            PdfPTable apartmentTable = new PdfPTable(2);
            apartmentTable.setWidthPercentage(100);
            apartmentTable.setSpacingBefore(10);
            apartmentTable.setSpacingAfter(10);

            addTableRow(apartmentTable, "Apartment ID:", apartment.getApartmentId(), tableCellFont, tableCellFont);
            addTableRow(apartmentTable, "Floor:", String.valueOf(apartment.getFloor()), tableCellFont, tableCellFont);
            addTableRow(apartmentTable, "Area:", apartment.getArea() + " m²", tableCellFont, tableCellFont);
            addTableRow(apartmentTable, "Type:", apartment.getApartmentType(), tableCellFont, tableCellFont);
            addTableRow(apartmentTable, "Owner:", apartment.getOwner() != null ? apartment.getOwner() : "Not assigned", tableCellFont, tableCellFont);
            addTableRow(apartmentTable, "Number of Occupants:", String.valueOf(apartment.getOccupants()), tableCellFont, tableCellFont);
            document.add(apartmentTable);

            // Add revenue details section
            Paragraph revenueInfo = new Paragraph("Revenue Details", sectionFont);
            revenueInfo.setSpacingBefore(10);
            revenueInfo.setSpacingAfter(10);
            document.add(revenueInfo);

            // Add revenue table with better formatting
            PdfPTable revenueTable = new PdfPTable(5);
            revenueTable.setWidthPercentage(100);
            revenueTable.setSpacingBefore(10);
            revenueTable.setSpacingAfter(10);

            // Set column widths
            float[] columnWidths = {2f, 2f, 2f, 2f, 2f};
            revenueTable.setWidths(columnWidths);

            // Add table headers
            addTableHeader(revenueTable, "Type", tableHeaderFont);
            addTableHeader(revenueTable, "Usage", tableHeaderFont);
            addTableHeader(revenueTable, "Unit", tableHeaderFont);
            addTableHeader(revenueTable, "Unit Price", tableHeaderFont);
            addTableHeader(revenueTable, "Total", tableHeaderFont);

            // Add revenue rows
            List<Revenue> revenues = apartment.getRevenueWithStatusOrId(status, id);
            if(revenues == null || revenues.isEmpty()){
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error generating bill because revenues are empty in generateBill");
            }
            double totalAmount = 0.0;
            for (Revenue revenue : revenues) {
                Fee fee = feeRepository.findByType(revenue.getType())
                        .orElseThrow(() -> new FeeNotFoundException("Fee not found for type: " + revenue.getType()));

                double amount = revenue.getUsed() * fee.getPricePerUnit();
                totalAmount += amount;

                // Get unit based on revenue type
                String unit = getUnitForType(revenue.getType());

                // Create cells with center alignment
                PdfPCell typeCell = new PdfPCell(new Phrase(revenue.getType(), tableCellFont));
                typeCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                typeCell.setPadding(5);
                revenueTable.addCell(typeCell);

                PdfPCell usageCell = new PdfPCell(new Phrase(String.format("%.2f", revenue.getUsed()), tableCellFont));
                usageCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                usageCell.setPadding(5);
                revenueTable.addCell(usageCell);

                PdfPCell unitCell = new PdfPCell(new Phrase(unit, tableCellFont));
                unitCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                unitCell.setPadding(5);
                revenueTable.addCell(unitCell);

                PdfPCell priceCell = new PdfPCell(new Phrase(String.format("%.2f VND", fee.getPricePerUnit()), tableCellFont));
                priceCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                priceCell.setPadding(5);
                revenueTable.addCell(priceCell);

                PdfPCell totalCell = new PdfPCell(new Phrase(String.format("%.2f VND", amount), tableCellFont));
                totalCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                totalCell.setPadding(5);
                revenueTable.addCell(totalCell);
            }
            document.add(revenueTable);

            // Add total amount with right alignment
            Paragraph total = new Paragraph(String.format("Total Amount Due: %.2f VND", totalAmount), totalFont);
            total.setAlignment(Element.ALIGN_RIGHT);
            total.setSpacingBefore(20);
            document.add(total);
            // QR code
            if(id != null && Objects.equals(isQR, "True")){
                try {
                    String qrBase64 = qrCodeService.generateQRCodeImage(apartment.getRevenueById(id).getPaymentToken());
                    byte[] qrBytes = Base64.getDecoder().decode(qrBase64);
                    Image qrImage = Image.getInstance(qrBytes);
                    qrImage.scaleToFit(100, 100);
                    qrImage.setAlignment(Element.ALIGN_CENTER);

                    Paragraph qrLabel = new Paragraph("Scan to Pay", tableCellFont);
                    qrLabel.setAlignment(Element.ALIGN_CENTER);
                    qrLabel.setSpacingBefore(20);

                    document.add(qrLabel);
                    document.add(qrImage);
                } catch (Exception e) {
                    System.out.println("Failed to add QR Code: " + e.getMessage());
                }
            }

            // Add payment instructions
            Paragraph paymentInfo = new Paragraph("Payment Instructions", sectionFont);
            paymentInfo.setSpacingBefore(20);
            paymentInfo.setSpacingAfter(10);
            document.add(paymentInfo);

            Paragraph instructions = new Paragraph(
                "Please make your payment before the due date to avoid late payment charges.\n" +
                "Payment can be made through our online portal or at the management office.\n" +
                "For any queries, please contact the management office.",
                tableCellFont
            );
            instructions.setSpacingBefore(10);
            document.add(instructions);

            // Add footer
            Paragraph footer = new Paragraph(
                "This is a computer-generated document. No signature is required.",
                smallFont
            );
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(30);
            document.add(footer);

            document.close();

            // Prepare response
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.inline().filename("bill_" + apartmentId + ".pdf").build());

            return new ResponseEntity<>(out.toByteArray(), headers, HttpStatus.OK);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error generating bill: " + e.getMessage());
        }
    }

    // Sửa hàm addTableRow để nhận font
    private void addTableRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPadding(5);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPadding(5);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private void addTableHeader(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(5);
        cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
        table.addCell(cell);
    }

    // Helper method to get unit based on revenue type
    private String getUnitForType(String type) {
        switch (type.toLowerCase()) {
            case "water":
                return "m³";
            case "electricity":
                return "kWh";
            case "service":
                return "m²";
            case "parking":
                return "slot";
            default:
                return "piece";
        }
    }

    public List<UserDTO> getResidentsByApartmentId(String apartmentId) {
        Apartment apartment = apartmentRepository.findByApartmentId(apartmentId)
                .orElseThrow(() -> new ApartmentNotFoundException(apartmentId));
        List<User> residents = apartment.getResidents();
        List<UserDTO> residentDTOs = new ArrayList<>();
        for (User resident : residents) {
            UserDTO userDTO = new UserDTO();
            userDTO.setId(resident.getId());
            userDTO.setFullName(resident.getFullName());
            userDTO.setUsername(resident.getUsername());
            userDTO.setEmail(resident.getEmail());
            userDTO.setPhoneNumber(resident.getPhoneNumber());
            userDTO.setApartmentId(apartmentId);
            userDTO.setRole(resident.getRole());
            userDTO.setCitizenIdentification(resident.getCitizenIdentification());
            userDTO.setPassword(resident.getPassword());
            residentDTOs.add(userDTO);
        }
        return residentDTOs;
    }
    
    /**
     * Reset usage counters for all apartments or a specific apartment
     * This is typically used after billing to start fresh usage tracking for the next billing cycle
     * 
     * @param apartmentId Optional ID of apartment to reset. If null, all apartments are reset.
     * @return Number of apartments that were reset
     */
    @Transactional    
    public int resetUsageCounters(String apartmentId) {
        if (apartmentId != null) {
            // Reset for a specific apartment
            Apartment apartment = apartmentRepository.findByApartmentId(apartmentId)
                    .orElseThrow(() -> new ApartmentNotFoundException(apartmentId));
            
            // Reset all usage counters to zero
            apartment.setServiceUsage(0.0);
            apartment.setWaterUsage(0.0);
            apartment.setElectricityUsage(0.0);
            apartment.setVehicleCount(0);
            
            apartmentRepository.save(apartment);
            return 1; // One apartment reset
        } else {
            // Reset for all apartments
            List<Apartment> apartments = apartmentRepository.findAll();
            
            int count = 0;
            for (Apartment apartment : apartments) {
                // Reset all usage counters to zero
                apartment.setServiceUsage(0.0);
                apartment.setWaterUsage(0.0);
                apartment.setElectricityUsage(0.0);
                apartment.setVehicleCount(0);
                
                apartmentRepository.save(apartment);
                count++;
            }
            
            return count;
        }
    }

    /**
     * Update only the usage fields of an apartment (service, water, electricity, vehicle)
     * This is useful for incrementing usage values during the billing cycle
     * 
     * @param apartmentId The ID of the apartment to update
     * @param serviceUsage The service usage value to set (null to keep current value)
     * @param waterUsage The water usage value to set (null to keep current value)
     * @param electricityUsage The electricity usage value to set (null to keep current value)
     * @param vehicleCount The vehicle count to set (null to keep current value)
     * @return The updated apartment
     */
    @Transactional
    public Apartment updateApartmentUsage(
            String apartmentId,
            Double serviceUsage,
            Double waterUsage, 
            Double electricityUsage,
            Integer vehicleCount) {
        
        Apartment apartment = apartmentRepository.findByApartmentId(apartmentId)
                .orElseThrow(() -> new ApartmentNotFoundException(apartmentId));
        
        // Only update fields that are provided (not null)
        if (serviceUsage != null) {
            apartment.setServiceUsage(serviceUsage);
        }
        
        if (waterUsage != null) {
            apartment.setWaterUsage(waterUsage);
        }
        
        if (electricityUsage != null) {
            apartment.setElectricityUsage(electricityUsage);
        }
        
        if (vehicleCount != null) {
            apartment.setVehicleCount(vehicleCount);
        }
        
        return apartmentRepository.save(apartment);
    }
    
    /**
     * Increment the usage values of an apartment
     * This is useful for adding to the current usage values during the billing cycle
     * 
     * @param apartmentId The ID of the apartment to update
     * @param serviceUsage The service usage to add (null to leave unchanged)
     * @param waterUsage The water usage to add (null to leave unchanged)
     * @param electricityUsage The electricity usage to add (null to leave unchanged)
     * @param vehicleCount The vehicle count to add (null to leave unchanged)
     * @return The updated apartment
     */
    @Transactional
    public Apartment incrementApartmentUsage(
            String apartmentId,
            Double serviceUsage,
            Double waterUsage, 
            Double electricityUsage,
            Integer vehicleCount) {
        
        Apartment apartment = apartmentRepository.findByApartmentId(apartmentId)
                .orElseThrow(() -> new ApartmentNotFoundException(apartmentId));
        
        // Add to existing values (if provided)
        if (serviceUsage != null) {
            double currentServiceUsage = apartment.getServiceUsage() != null ? apartment.getServiceUsage() : 0.0;
            apartment.setServiceUsage(currentServiceUsage + serviceUsage);
        }
        
        if (waterUsage != null) {
            double currentWaterUsage = apartment.getWaterUsage() != null ? apartment.getWaterUsage() : 0.0;
            apartment.setWaterUsage(currentWaterUsage + waterUsage);
        }
        
        if (electricityUsage != null) {
            double currentElectricityUsage = apartment.getElectricityUsage() != null ? apartment.getElectricityUsage() : 0.0;
            apartment.setElectricityUsage(currentElectricityUsage + electricityUsage);
        }
        
        if (vehicleCount != null) {
            int currentVehicleCount = apartment.getVehicleCount() != null ? apartment.getVehicleCount() : 0;
            apartment.setVehicleCount(currentVehicleCount + vehicleCount);
        }
        
        return apartmentRepository.save(apartment);
    }
}