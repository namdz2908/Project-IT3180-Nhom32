package com.prototype.arpartment_managing;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter; 

@SpringBootApplication
@EnableScheduling  // Enable scheduling for the application
public class ArpartmentManagingApplication {

	@Bean
    CommandLineRunner printHash(PasswordEncoder encoder) {
        return args -> System.out.println("HASH_1234 = " + encoder.encode("1234"));
    }

	public static void main(String[] args) {
		SpringApplication.run(ArpartmentManagingApplication.class, args);
	}
	
}
