package com.prototype.arpartment_managing.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;

@Service
public class QRCodeService {

    @Value("${app.frontend-url:http://localhost:5000}")
    private String baseUrl;

    public String generateQRCodeImage(String paymentToken) throws WriterException, IOException {
        String paymentUrl = baseUrl + "/payment/complete/" + paymentToken;
        
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(paymentUrl, BarcodeFormat.QR_CODE, 200, 200);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
        
        return Base64.getEncoder().encodeToString(outputStream.toByteArray());
    }
} 