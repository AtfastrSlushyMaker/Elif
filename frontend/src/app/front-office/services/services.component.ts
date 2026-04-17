import { Component, OnInit } from '@angular/core';
import { ServiceService, Service } from './service/service.service';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent implements OnInit {
  services: Service[] = [];
  loading = false;
  error = '';

  constructor(private serviceService: ServiceService) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.loading = true;
    this.serviceService.findAll().subscribe({
      next: (data) => {
        this.services = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erreur lors de la récupération des services';
        this.loading = false;
      }
    });
  }
}