package org.raspinloop.web.administration;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;

@SpringBootConfiguration
@EnableAutoConfiguration
public class AdministrationConsoleApplication {

	public static void main(String[] args) {
		SpringApplication.run(AdministrationConsoleApplication.class, args);
	}
}
