import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-request-form',
  templateUrl: './request-form.component.html',
  styleUrls: ['./request-form.component.css']
})
export class RequestFormComponent implements OnInit {
  redirecting = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const petId = Number(this.route.snapshot.params['id']);
    if (!petId) {
      this.router.navigate(['/app/adoption/pets'], { replaceUrl: true });
      return;
    }

    this.router.navigate(['/app/adoption/pets', petId], {
      queryParams: { adopt: 1 },
      replaceUrl: true
    });
  }
}
